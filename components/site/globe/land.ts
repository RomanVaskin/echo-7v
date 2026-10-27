import { geoEquirectangular, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { feature, mesh } from 'topojson-client'

type Topology = Parameters<typeof feature>[0]

export type LandData = {
  land: GeoPermissibleObjects
  coast: GeoJSON.MultiLineString
}

/** Natural Earth land at 1:50m (world-atlas), loaded only together with the globe. */
export async function loadLand(): Promise<LandData> {
  const topology = (await import('world-atlas/land-50m.json')).default as unknown as Topology
  const object = topology.objects.land as NonNullable<Parameters<typeof mesh>[1]>
  return {
    land: feature(topology, object) as GeoPermissibleObjects,
    coast: mesh(topology, object) as GeoJSON.MultiLineString,
  }
}

/** Unit vector for a latitude/longitude: longitude 0 faces +z, north is +y. */
export function latLonToVector(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = (lat * Math.PI) / 180
  const lambda = (lon * Math.PI) / 180
  return [radius * Math.cos(phi) * Math.sin(lambda), radius * Math.sin(phi), radius * Math.cos(phi) * Math.cos(lambda)]
}

/**
 * Draws the land as white on black into an equirectangular canvas laid out to match three's
 * SphereGeometry UVs (u = 0 sits at longitude −90°, hence the projection's −90° rotation).
 */
export function drawLandMask(land: GeoPermissibleObjects, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const projection = geoEquirectangular()
    .rotate([-90, 0])
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2])
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  geoPath(projection, ctx)(land)
  ctx.fill()
  return canvas
}

/**
 * Separable box blur on a single channel (in place), wrapping horizontally (longitude) and clamping
 * vertically. Two passes approximate a soft Gaussian: the bevel of the raised coastlines.
 */
export function blurChannel(src: Float32Array, width: number, height: number, radius: number, passes = 2) {
  const a = src
  const b = new Float32Array(src.length)
  const span = radius * 2 + 1
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      const row = y * width
      let sum = 0
      for (let k = -radius; k <= radius; k++) sum += a[row + ((k + width) % width)]
      for (let x = 0; x < width; x++) {
        b[row + x] = sum / span
        sum += a[row + ((x + radius + 1) % width)] - a[row + ((x - radius + width) % width)]
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let k = -radius; k <= radius; k++) sum += b[Math.min(Math.max(k, 0), height - 1) * width + x]
      for (let y = 0; y < height; y++) {
        a[y * width + x] = sum / span
        sum +=
          b[Math.min(y + radius + 1, height - 1) * width + x] - b[Math.max(y - radius, 0) * width + x]
      }
    }
  }
  return a
}
