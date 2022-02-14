import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 360 })
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {
    count: 500000,
    size: 0.01,
    radius: 5,
    branches: 5,
    spin: 1.7,
    randomness: 0.2,
    randomnessPower: 4,
    insideColor: "#ff6030",    
    outsideColor: "#1b3984",
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'branches').min(2).max(10).step(1).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'spin').min(-5).max(5).step(0.1).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'randomness').min(0).max(3).step(0.1).onFinishChange(() => {
    generateGalaxy()
})
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.1).onFinishChange(() => {
    generateGalaxy()
})
gui.addColor(parameters, "insideColor").onFinishChange(() => generateGalaxy())
gui.addColor(parameters, "outsideColor").onFinishChange(() => generateGalaxy())

let geometry = null
let material = null 
let points = null

const generateGalaxy = () => {
    if (!!points) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    // Geometry
    const positionsArray = new Float32Array(parameters.count * 3)
    const colorArray = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)
    for (let i = 0; i < parameters.count; i++) {
        // Positions
        const radius = Math.pow(Math.random(), 3) * parameters.radius
        const angle = (2 * Math.PI) / parameters.branches * (i % parameters.branches)
        const farness = radius / parameters.radius
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1: 1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1: 1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? -1: 1)
        positionsArray[i * 3] = Math.cos(angle + radius * parameters.spin) * radius + randomX
        positionsArray[i * 3 + 2] = Math.sin(angle + radius * parameters.spin) * radius + randomZ
        positionsArray[i * 3 + 1] = randomY + 1.2

        // Colors
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, farness)

        colorArray[i * 3] = mixedColor.r
        colorArray[i * 3 + 1] = mixedColor.g
        colorArray[i * 3 + 2] = mixedColor.b
    }
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
    const colorAttribute = new THREE.BufferAttribute(colorArray, 3)

    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', positionsAttribute)
    geometry.setAttribute('color', colorAttribute)

    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Particles
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 5
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enablePan = false
controls.enableZoom = false
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const mousePosition = {
    x: 0,
    y: 0,
}
canvas.addEventListener('mousemove', e => {
    mousePosition.x = e.clientX / sizes.width - 0.5
    mousePosition.y = e.clientY / sizes.width - 0.5
})

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    points.rotation.y = elapsedTime * 0.02

    camera.position.x = mousePosition.x
    camera.position.y = mousePosition.y + 6
    camera.lookAt(points.position)


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()