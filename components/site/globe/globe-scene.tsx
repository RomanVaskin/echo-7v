'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { blurChannel, drawLandMask, latLonToVector, loadLand, type LandData } from './land'

export type GlobePoint = { id: string; lat: number; lon: number; label: string }
export type GlobeRequest = { id: string; spin: boolean; nonce: number }

type Quality = 'high' | 'low'

/* Glass globe: a clear sphere with a light rim, land as pale glass with glowing blue coastlines */
const GLOW = new THREE.Color('#4aa3ff')
const GLOW_HEX = '#6db6ff'
const LIGHT_DIR = new THREE.Vector3(-0.55, 0.65, 0.55).normalize() // upper left, view space

/** Land relief, as a share of the globe radius. */
const RELIEF = 0.018
const MIN_PITCH = -0.9
const MAX_PITCH = 0.9
const AUTO_SPEED = 0.045 // rad/s, about two minutes per turn
const IDLE_BEFORE_AUTO = 2.5 // s

type Earth = {
  geometry: THREE.SphereGeometry
  /** Blurred land mask (0…1) on the sphere's UVs: drives the glass fill and the glowing edge. */
  heightTexture: THREE.DataTexture
  coast: THREE.BufferGeometry
  glints: THREE.BufferGeometry
  /** Relief (0…1) at a latitude/longitude. */
  heightAt: (lat: number, lon: number) => number
}

function buildEarth({ land, coast }: LandData, quality: Quality): Earth {
  // Relief: a softly blurred land mask pushes the sphere's vertices outwards
  const maskW = quality === 'high' ? 2048 : 1024
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

  // The mask as a texture, rows flipped to match the UVs (v = 1 at the top)
  const bytes = new Uint8Array(maskW * maskH)
  for (let y = 0; y < maskH; y++) {
    for (let x = 0; x < maskW; x++) bytes[(maskH - 1 - y) * maskW + x] = Math.round(heights[y * maskW + x] * 255)
  }
  const heightTexture = new THREE.DataTexture(bytes, maskW, maskH, THREE.RedFormat, THREE.UnsignedByteType)
  heightTexture.wrapS = THREE.RepeatWrapping
  heightTexture.magFilter = THREE.LinearFilter
  heightTexture.minFilter = THREE.LinearFilter
  heightTexture.needsUpdate = true

  // Coastlines, just above the bevel's midpoint
  const coastPoints: number[] = []
  const coastVertices: [number, number][] = []
  for (const line of coast.coordinates) {
    for (let i = 1; i < line.length; i++) {
      const [lon0, lat0] = line[i - 1]
      const [lon1, lat1] = line[i]
      coastPoints.push(...latLonToVector(lat0, lon0, 1 + RELIEF * 0.55), ...latLonToVector(lat1, lon1, 1 + RELIEF * 0.55))
      coastVertices.push([lat0, lon0])
    }
  }
  const coastGeometry = new THREE.BufferGeometry()
  coastGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coastPoints, 3))

  // A few sparkles along the coasts, like light caught in the glass edge (fixed seed: same every load)
  let seed = 7
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const glintPositions: number[] = []
  const glintPhases: number[] = []
  const count = quality === 'high' ? 46 : 28
  for (let i = 0; i < count; i++) {
    const [lat, lon] = coastVertices[Math.floor(random() * coastVertices.length)]
    glintPositions.push(...latLonToVector(lat, lon, 1 + RELIEF * 0.7))
    glintPhases.push(random() * Math.PI * 2)
  }
  const glints = new THREE.BufferGeometry()
  glints.setAttribute('position', new THREE.Float32BufferAttribute(glintPositions, 3))
  glints.setAttribute('phase', new THREE.Float32BufferAttribute(glintPhases, 1))

  return { geometry, heightTexture, coast: coastGeometry, glints, heightAt }
}

/* Shaders. "facing" is the view-space z of the outward direction: > 0 on the hemisphere facing
   the viewer, so the far side can be drawn faintly through the glass. */
const facingVertex = /* glsl */ `
  varying float vFacing;
  void setFacing(vec3 p) { vFacing = normalize(normalMatrix * normalize(p)).z; }
`

const landVertex = /* glsl */ `
  ${facingVertex}
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    setFacing(position);
    gl_Position = projectionMatrix * mv;
  }
`

const landFragment = /* glsl */ `
  uniform sampler2D uHeight;
  uniform vec3 uGlow;
  uniform vec3 uLight;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vFacing;
  void main() {
    float h = texture2D(uHeight, vUv).r;
    if (h < 0.3) discard;
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fresnel = pow(1.0 - abs(dot(n, v)), 2.0);
    // Bright band along the coast, clear glass inland
    float edge = smoothstep(0.3, 0.48, h) * (1.0 - smoothstep(0.5, 0.92, h));
    // Light catches the raised edges only, not the flat land
    float spec = pow(max(dot(reflect(-uLight, n), v), 0.0), 60.0) * smoothstep(0.25, 0.6, edge);
    vec3 color = mix(vec3(0.9, 0.95, 1.0), uGlow, edge * 0.85) + spec;
    float alpha = 0.045 + 0.2 * fresnel + edge * 0.8 + spec * 0.8;
    alpha *= mix(0.22, 1.0, smoothstep(-0.15, 0.35, vFacing)) * uOpacity;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

const glassVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

const glassFragment = /* glsl */ `
  uniform vec3 uLight;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float fresnel = pow(1.0 - abs(dot(n, v)), 3.0);
    vec3 r = reflect(-uLight, n);
    float highlight = pow(max(dot(r, v), 0.0), 160.0) * 1.4 + pow(max(dot(r, v), 0.0), 14.0) * 0.07;
    vec3 color = mix(vec3(0.82, 0.91, 1.0), vec3(1.0), fresnel);
    float alpha = (0.01 + fresnel * 0.75 + highlight) * uStrength;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`

const lineVertex = /* glsl */ `
  ${facingVertex}
  void main() {
    setFacing(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const lineFragment = /* glsl */ `
  uniform vec3 uGlow;
  varying float vFacing;
  void main() {
    float alpha = mix(0.14, 0.95, smoothstep(-0.15, 0.3, vFacing));
    gl_FragColor = vec4(uGlow, alpha);
  }
`

const glintVertex = /* glsl */ `
  ${facingVertex}
  attribute float phase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    setFacing(position);
    float twinkle = pow(0.5 + 0.5 * sin(uTime * 1.3 + phase * 3.0), 6.0);
    vAlpha = twinkle * smoothstep(0.0, 0.45, vFacing);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (10.0 + 26.0 * twinkle) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`

const glintFragment = /* glsl */ `
  uniform vec3 uGlow;
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float core = exp(-dot(d, d) * 90.0);
    float rays = max(0.0, 1.0 - abs(d.x) * 60.0) * (1.0 - abs(d.y) * 2.0) + max(0.0, 1.0 - abs(d.y) * 60.0) * (1.0 - abs(d.x) * 2.0);
    float a = (core + rays * 0.55) * vAlpha;
    gl_FragColor = vec4(mix(uGlow, vec3(1.0), core), a);
  }
`

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

let halo: THREE.CanvasTexture | null = null
/** Soft radial glow shared by all markers. */
function haloTexture() {
  if (halo) return halo
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  halo = new THREE.CanvasTexture(canvas)
  return halo
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
        <sphereGeometry args={[0.012, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh renderOrder={5}>
        <circleGeometry args={[0.03, 32]} />
        <meshBasicMaterial map={haloTexture()} color={GLOW_HEX} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.026, 0.0295, 64]} />
        <meshBasicMaterial color={GLOW_HEX} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
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
  const pixelRatio = useThree((state) => state.viewport.dpr)
  const materials = useMemo(() => {
    const common = { transparent: true, depthWrite: false }
    const landMaterial = (side: THREE.Side, opacity: number) =>
      new THREE.ShaderMaterial({
        ...common,
        side,
        vertexShader: landVertex,
        fragmentShader: landFragment,
        uniforms: {
          uHeight: { value: earth.heightTexture },
          uGlow: { value: GLOW },
          uLight: { value: LIGHT_DIR },
          uOpacity: { value: opacity },
        },
      })
    const glassMaterial = (side: THREE.Side, strength: number) =>
      new THREE.ShaderMaterial({
        ...common,
        side,
        vertexShader: glassVertex,
        fragmentShader: glassFragment,
        uniforms: { uLight: { value: LIGHT_DIR }, uStrength: { value: strength } },
      })
    return {
      land: landMaterial(THREE.FrontSide, 1),
      landBack: landMaterial(THREE.BackSide, 1),
      glass: glassMaterial(THREE.FrontSide, 1),
      glassBack: glassMaterial(THREE.BackSide, 0.22),
      coast: new THREE.ShaderMaterial({
        ...common,
        blending: THREE.AdditiveBlending,
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
        uniforms: { uGlow: { value: GLOW } },
      }),
      glints: new THREE.ShaderMaterial({
        ...common,
        blending: THREE.AdditiveBlending,
        vertexShader: glintVertex,
        fragmentShader: glintFragment,
        uniforms: { uGlow: { value: GLOW }, uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      }),
    }
  }, [earth])
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
      earth.heightTexture.dispose()
      earth.glints.dispose()
      materials.land.dispose()
      materials.landBack.dispose()
      materials.glass.dispose()
      materials.glassBack.dispose()
      materials.coast.dispose()
      materials.glints.dispose()
      earth.coast.dispose()
    },
    [earth, materials],
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
    // Sparkles twinkle; with reduced motion they hold still
    materials.glints.uniforms.uTime.value = reducedMotion ? 1.2 : now
    materials.glints.uniforms.uPixelRatio.value = pixelRatio
  })

  return (
    <group ref={globe}>
      {/* Back to front: far side of the glass and land, then the near side, lines and sparkles */}
      <mesh geometry={earth.geometry} material={materials.glassBack} renderOrder={0} scale={0.999} />
      <mesh geometry={earth.geometry} material={materials.landBack} renderOrder={1} />
      <mesh geometry={earth.geometry} material={materials.land} renderOrder={2} />
      <lineSegments geometry={earth.coast} material={materials.coast} renderOrder={3} />
      <mesh material={materials.glass} renderOrder={4} scale={1 + RELIEF * 1.3}>
        <sphereGeometry args={[1, 96, 64]} />
      </mesh>
      <points geometry={earth.glints} material={materials.glints} renderOrder={6} />
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
          <Globe land={land} quality={quality} setCursor={setCursor} {...props} />
        </Canvas>
      )}
    </div>
  )
}
