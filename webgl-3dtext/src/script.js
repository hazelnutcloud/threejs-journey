import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPixelatedPass } from './RenderPixelatedPass.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        // Material
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
        // const material = new THREE.MeshNormalMaterial()

        // Text
        const textGeometry = new TextGeometry(
            'nutcloud',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        textGeometry.center()

        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        // Donuts
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64)

        for(let i = 0; i < 50; i++)
        {
            const donut = new THREE.Mesh(donutGeometry, material)
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(1 - 2 * Math.random() * 1)
            donut.position.x = Math.cos(theta) * Math.sin(phi) * 5
            donut.position.y = Math.sin(theta) * Math.sin(phi) * 5
            donut.position.z = Math.cos(phi) * 5
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI
            const scale = Math.max(Math.random(), 0.2)
            donut.scale.set(scale, scale, scale)

            scene.add(donut)
        }
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const screenResolution = new THREE.Vector2( window.innerWidth, window.innerHeight )

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
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 0
// camera.position.y = 0.5
// camera.position.z = 5
const aspectRatio = screenResolution.x / screenResolution.y
const camera = new THREE.OrthographicCamera(-aspectRatio * 2, aspectRatio * 2, 2, -2)
camera.position.x = 3
camera.position.y = new THREE.Vector3(3, 0, 5).distanceTo(new THREE.Vector3(0, 0, 0)) * Math.tan(Math.PI / 6)
camera.position.z = 5
scene.add(camera)
 
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.minPolarAngle = controls.maxPolarAngle = controls.getPolarAngle()
controls.enableZoom = false

/**
 * Renderer
 */
//normal
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Composer
 */
const composer = new EffectComposer(renderer)
const renderPixelatedPass = new RenderPixelatedPass(screenResolution, 5, scene, camera)
composer.addPass(renderPixelatedPass)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()