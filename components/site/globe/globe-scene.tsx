'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { blurChannel, drawLandMask, latLonToVector, loadLand, type LandData } from './land'

export type GlobePoint = { id: string; lat: number; lon: number; label: string }
export type GlobeRequest = { id: string; spin: boolean; nonce: number }

type Quality = 'high' | 'low'

/* Sculptural palette: ivory land on a slightly deeper ivory sea, ink lines and brass markers */
const LAND = [240, 234, 218] // PANTONE 11-0104 TPG, the site's journal paper
const SEA = [221, 213, 196]
const INK = '#484b5d' // PANTONE 4131 C
const BRASS = '#c8a26a'

/** Land relief, as a share of the globe radius. */
const RELIEF = 0.018
const MIN_PITCH = -0.9
const MAX_PITCH = 0.9
const AUTO_SPEED = 0.045 // rad/s, about two minutes per turn
const IDLE_BEFORE_AUTO = 2.5 // s

type Earth = {
  geometry: THREE.SphereGeometry
  texture: THREE.CanvasTexture
  coast: THREE.BufferGeometry
  graticule: THREE.BufferGeometry
  /** Relief (0…1) at a latitude/longitude. */
  heightAt: (lat: number, lon: number) => number
}

function buildEarth({ land, coast }: LandData, quality: Quality): Earth {
  // Relief: a softly blurred land mask pushes the sphere's vertices outwards
  const maskW = quality === 'high' ? 1024 : 768
  const maskH = maskW / 2
  const maskPixels = drawLandMask(land, maskW, maskH).getContext('2d')!.getImageData(0, 0, maskW, maskH).data
  const heights = new Float32Array(maskW * maskH)
  for (let i = 0; i < heights.length; i++) heights[i] = maskPixels[i * 4] / 255
  blurChannel(heights, maskW, maskH, quality === 'high' ? 3 : 2)

  // Bilinear sample at a UV of three's SphereGeometry (u wraps around the globe)
  const sample = (u: number, v: number) => {
    const x = (((u % 1) + 1) % 1) * maskW - 0.5
    const y = Math.min(Math.max((1 - v) * maskH - 0.5, 0), maskH - 1)
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const y1 = Math.min(y0 + 1, maskH - 1)
    const at = (xx: number, yy: number) => heights[yy * maskW + ((xx % maskW) + maskW) % maskW]
    return (
      (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y1) * (1 - fx) + at(x0 + 1, y1) * fx) * fy
    )
  }
  // SphereGeometry: u = (lon + 90°) / 360°, v = (lat + 90°) / 180°
  const heightAt = (lat: number, lon: number) => sample((lon + 90) / 360, (lat + 90) / 180)

  const [segW, segH] = quality === 'high' ? [400, 200] : [240, 120]
  const geometry = new THREE.SphereGeometry(1, segW, segH)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const scale = 1 + RELIEF * sample(uv.getX(i), uv.getY(i))
    position.setXYZ(i, position.getX(i) * scale, position.getY(i) * scale, position.getZ(i) * scale)
  }
  geometry.computeVertexNormals()
  // The seam's duplicated vertices get their normals averaged, so no shading line shows along it
  const normal = geometry.attributes.normal as THREE.BufferAttribute
  for (let row = 0; row <= segH; row++) {
    const a = row * (segW + 1)
    const b = a + segW
    const n = new THREE.Vector3(
      normal.getX(a) + normal.getX(b),
      normal.getY(a) + normal.getY(b),
      normal.getZ(a) + normal.getZ(b),
    ).normalize()
    normal.setXYZ(a, n.x, n.y, n.z)
    normal.setXYZ(b, n.x, n.y, n.z)
  }

  // Colour: a crisp land mask mixed with a faint gypsum grain
  const colorW = quality === 'high' ? 2048 : 1024
  const colorH = colorW / 2
  const colorCanvas = drawLandMask(land, colorW, colorH)
  const ctx = colorCanvas.getContext('2d')!
  const image = ctx.getImageData(0, 0, colorW, colorH)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const m = data[i] / 255
    const grain = (Math.random() - 0.5) * 7
    data[i] = SEA[0] + (LAND[0] - SEA[0]) * m + grain
    data[i + 1] = SEA[1] + (LAND[1] - SEA[1]) * m + grain
    data[i + 2] = SEA[2] + (LAND[2] - SEA[2]) * m + grain
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(colorCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  // Coastlines, just above the bevel's midpoint
  const coastPoints: number[] = []
  for (const line of coast.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const [lon0, lat0] = line[i - 1]
      const [lon1, lat1] = line[i]
      coastPoints.push(...latLonToVector(lat0, lon0, 1 + RELIEF * 0.55), ...latLonToVector(lat1, lon1, 1 + RELIEF * 0.55))
    }
  }
  const coastGeometry = new THREE.BufferGeometry()
  coastGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coastPoints, 3))

  // Meridians and parallels every 15°, at sea level: the raised land covers them
  const grid: number[] = []
  const r = 1.0015
  for (let lon = -180; lon < 180; lon += 15) {
    for (let lat = -80; lat < 80; lat += 2) grid.push(...latLonToVector(lat, lon, r), ...latLonToVector(lat + 2, lon, r))
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let lon = -180; lon < 180; lon += 2) grid.push(...latLonToVector(lat, lon, r), ...latLonToVector(lat, lon + 2, r))
  }
  const graticule = new THREE.BufferGeometry()
  graticule.setAttribute('position', new THREE.Float32BufferAttribute(grid, 3))

  return { geometry, texture, coast: coastGeometry, graticule, heightAt }
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

type Motion = {
  yaw: number
  pitch: number
  velYaw: number
  velPitch: number
  dragging: boolean
  moved: boolean
  lastInteraction: number
  tween: { fromYaw: number; fromPitch: number; toYaw: number; toPitch: number; start: number; duration: number; id: string } | null
}

function Marker({
  point,
  earth,
  selected,
  motion,
  onPick,
  setCursor,
}: {
  point: GlobePoint
  earth: Earth
  selected: boolean
  motion: React.RefObject<Motion>
  onPick: (id: string) => void
  setCursor: (cursor: string) => void
}) {
  const group = useRef<THREE.Group>(null)
  const dot = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const position = useMemo(() => {
    const height = 1 + RELIEF * earth.heightAt(point.lat, point.lon) + 0.004
    return new THREE.Vector3(...latLonToVector(point.lat, point.lon, height))
  }, [earth, point.lat, point.lon])

  useEffect(() => {
    group.current?.lookAt(position.clone().multiplyScalar(2))
  }, [position])

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 10)
    const active = hovered || selected
    if (dot.current) dot.current.scale.lerp(new THREE.Vector3().setScalar(active ? 1.5 : 1), k)
    if (ring.current) {
      const material = ring.current.material as THREE.MeshBasicMaterial
      material.opacity += ((active ? 0.9 : 0) - material.opacity) * k
      ring.current.scale.lerp(new THREE.Vector3().setScalar(active ? 1 : 0.6), k)
    }
  })

  // Only the hemisphere facing the viewer is clickable
  const facing = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    const world = event.object.getWorldPosition(new THREE.Vector3())
    return world.dot(event.camera.position) > 0
  }

  return (
    <group ref={group} position={position}>
      <mesh ref={dot}>
        <sphereGeometry args={[0.014, 24, 24]} />
        <meshStandardMaterial color={BRASS} metalness={0.55} roughness={0.32} emissive={BRASS} emissiveIntensity={0.18} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.026, 0.0295, 64]} />
        <meshBasicMaterial color={BRASS} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Generous invisible hit area for fingers */}
      <mesh
        onPointerOver={(event) => {
          if (!facing(event)) return
          event.stopPropagation()
          setHovered(true)
          setCursor('pointer')
        }}
        onPointerOut={() => {
          setHovered(false)
          setCursor('')
        }}
        onClick={(event) => {
          if (motion.current.moved || !facing(event)) return
          event.stopPropagation()
          onPick(point.id)
        }}
      >
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Globe({
  land,
  quality,
  points,
  selectedId,
  request,
  reducedMotion,
  onPick,
  onArrive,
  setCursor,
}: {
  land: LandData
  quality: Quality
  points: GlobePoint[]
  selectedId: string | null
  request: GlobeRequest | null
  reducedMotion: boolean
  onPick: (id: string) => void
  onArrive: (id: string) => void
  setCursor: (cursor: string) => void
}) {
  const globe = useRef<THREE.Group>(null)
  const { gl, clock } = useThree()
  const earth = useMemo(() => buildEarth(land, quality), [land, quality])
  // Opening view: the western Atlantic and the Caribbean, slightly from above
  const motion = useRef<Motion>({
    yaw: (68 * Math.PI) / 180,
    pitch: 0.32,
    velYaw: 0,
    velPitch: 0,
    dragging: false,
    moved: false,
    lastInteraction: -Infinity,
    tween: null,
  })

  useEffect(
    () => () => {
      earth.geometry.dispose()
      earth.texture.dispose()
      earth.coast.dispose()
      earth.graticule.dispose()
    },
    [earth],
  )

  // Turn to a destination: the shortest way, or with an extra full turn for "Surprise Me"
  useEffect(() => {
    if (!request) return
    const point = points.find((p) => p.id === request.id)
    if (!point) return
    const m = motion.current
    const toPitch = Math.min(Math.max((point.lat * Math.PI) / 180, MIN_PITCH), MAX_PITCH)
    let delta = wrapAngle((-point.lon * Math.PI) / 180 - m.yaw)
    if (request.spin) delta += delta >= 0 ? Math.PI * 2 : -Math.PI * 2
    m.velYaw = 0
    m.velPitch = 0
    m.tween = {
      fromYaw: m.yaw,
      fromPitch: m.pitch,
      toYaw: m.yaw + delta,
      toPitch,
      start: clock.elapsedTime,
      duration: reducedMotion ? 0.001 : request.spin ? 2.8 : 1.4,
      id: point.id,
    }
  }, [request, points, reducedMotion, clock])

  // Drag to rotate. Touch turns the globe horizontally only (touch-action: pan-y keeps vertical
  // swipes scrolling the page); mouse and pen also tilt it, within limits so it never flips.
  useEffect(() => {
    const el = gl.domElement
    let pointerId: number | null = null
    let pointerType = 'mouse'
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let startX = 0
    let startY = 0
    const radPerPx = () => Math.PI / Math.max(el.clientWidth, 1)

    const down = (e: PointerEvent) => {
      if (pointerId !== null) return
      pointerId = e.pointerId
      pointerType = e.pointerType
      lastX = startX = e.clientX
      lastY = startY = e.clientY
      lastT = performance.now()
      const m = motion.current
      m.dragging = true
      m.moved = false
      m.tween = null
      m.velYaw = 0
      m.velPitch = 0
      m.lastInteraction = clock.elapsedTime
      setCursor('grabbing')
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      const m = motion.current
      const now = performance.now()
      const dt = Math.max((now - lastT) / 1000, 1 / 240)
      const dYaw = (e.clientX - lastX) * radPerPx()
      const dPitch = pointerType === 'touch' ? 0 : (e.clientY - lastY) * radPerPx()
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 5) m.moved = true
      m.yaw += dYaw
      m.pitch = Math.min(Math.max(m.pitch + dPitch, MIN_PITCH), MAX_PITCH)
      m.velYaw = dYaw / dt
      m.velPitch = dPitch / dt
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
      m.lastInteraction = clock.elapsedTime
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      pointerId = null
      const m = motion.current
      m.dragging = false
      // No inertia from a pause before release
      if (performance.now() - lastT > 80) {
        m.velYaw = 0
        m.velPitch = 0
      }
      m.lastInteraction = clock.elapsedTime
      setCursor('')
      // A click right after a drag must not select a marker
      if (m.moved) setTimeout(() => (m.moved = false), 0)
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl, clock, setCursor])

  useFrame((state, delta) => {
    const m = motion.current
    const dt = Math.min(delta, 1 / 20)
    const now = state.clock.elapsedTime
    if (m.tween) {
      const t = Math.min((now - m.tween.start) / m.tween.duration, 1)
      const e = easeInOutCubic(t)
      m.yaw = m.tween.fromYaw + (m.tween.toYaw - m.tween.fromYaw) * e
      m.pitch = m.tween.fromPitch + (m.tween.toPitch - m.tween.fromPitch) * e
      if (t >= 1) {
        const id = m.tween.id
        m.tween = null
        m.yaw = wrapAngle(m.yaw)
        onArrive(id)
      }
    } else if (!m.dragging) {
      // Inertia, then the slow idle turn
      const decay = Math.exp(-dt * 3.5)
      m.velYaw *= decay
      m.velPitch *= decay
      m.yaw += m.velYaw * dt
      m.pitch = Math.min(Math.max(m.pitch + m.velPitch * dt, MIN_PITCH), MAX_PITCH)
      if (!reducedMotion && !selectedId && now - m.lastInteraction > IDLE_BEFORE_AUTO) m.yaw += AUTO_SPEED * dt
    }
    if (globe.current) globe.current.rotation.set(m.pitch, m.yaw, 0)
  })

  return (
    <group ref={globe}>
      <mesh geometry={earth.geometry}>
        <meshStandardMaterial map={earth.texture} roughness={0.93} metalness={0} />
      </mesh>
      <lineSegments geometry={earth.graticule}>
        <lineBasicMaterial color={INK} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={earth.coast}>
        <lineBasicMaterial color={INK} transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      {points.map((point) => (
        <Marker
          key={point.id}
          point={point}
          earth={earth}
          selected={point.id === selectedId}
          motion={motion}
          onPick={onPick}
          setCursor={setCursor}
        />
      ))}
    </group>
  )
}

export type GlobeSceneProps = {
  points: GlobePoint[]
  selectedId: string | null
  request: GlobeRequest | null
  reducedMotion: boolean
  /** Rendering pauses while the section is off screen. */
  active: boolean
  label: string
  onPick: (id: string) => void
  onArrive: (id: string) => void
  onReady: () => void
}

/** The WebGL globe. Loaded lazily (three.js, the land data) once the section approaches the viewport. */
export default function GlobeScene({ active, label, onReady, ...props }: GlobeSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [land, setLand] = useState<LandData | null>(null)
  const [quality] = useState<Quality>(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const small = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    return small || (nav.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4 ? 'low' : 'high'
  })

  useEffect(() => {
    let cancelled = false
    loadLand().then((data) => !cancelled && setLand(data))
    return () => {
      cancelled = true
    }
  }, [])

  const setCursor = useMemo(
    () => (cursor: string) => {
      if (wrapper.current) wrapper.current.style.cursor = cursor || 'grab'
    },
    [],
  )

  return (
    <div ref={wrapper} className="absolute inset-0 cursor-grab touch-pan-y [&_canvas]:touch-pan-y" role="img" aria-label={label}>
      {land && (
        <Canvas
          frameloop={active ? 'always' : 'never'}
          dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
          camera={{ position: [0, 0, 4.2], fov: 30, near: 0.1, far: 20 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ touchAction: 'pan-y' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping
            onReady()
          }}
        >
          {/* Soft light from the upper left */}
          <hemisphereLight args={['#fffaf0', '#6b6d7a', 1.15]} />
          <directionalLight position={[-3.2, 3, 3.6]} intensity={2.3} color="#fff8ec" />
          <ambientLight intensity={0.4} />
          <Globe land={land} quality={quality} setCursor={setCursor} {...props} />
        </Canvas>
      )}
    </div>
  )
}
