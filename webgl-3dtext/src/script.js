import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPixelatedPass } from './RenderPixelatedPass.js'
import * as dat from 'lil-gui'

// Textures
const textureLoader = new THREE.TextureLoader()
const matcapTextureMetal = textureLoader.load('textures/matcaps/3.png')
const matcapTextureRust = textureLoader.load('textures/matcaps/8.png')
const matcapTextureGreen = textureLoader.load('textures/matcaps/7.png')

// Materials
const normalMaterial = new THREE.MeshNormalMaterial()
const matcapMaterialMetal = new THREE.MeshMatcapMaterial({ matcap: matcapTextureMetal })
const matcapMaterialRust = new THREE.MeshMatcapMaterial({ matcap: matcapTextureRust })
const matcapMaterialGreen = new THREE.MeshMatcapMaterial({ matcap: matcapTextureGreen })

// Variables
let font, textMesh, sphereGroup
let camera, screenResolution, scene, canvas, renderPixelatedPass, controls, composer, renderer
const params = {
    text: 'nutcloud',
    shapesMaterial: normalMaterial,
    textMaterial: normalMaterial,
    pixelSize: 4,
    normalEdgeStrength: .1,
    depthEdgeStrength: 0,
    rotate: true,
    sphereSize: 5,
    shapesCount: 100,
}

// Debug GUI
const gui = new dat.GUI()
gui.close()

const clock = new THREE.Clock()

// Start
init()
animate()

function init() {
    // Screen resolution
    screenResolution = new THREE.Vector2( window.innerWidth, window.innerHeight ) 

    // Canvas
    canvas = document.querySelector('canvas.webgl')

    // Scene
    scene = new THREE.Scene()

    // Text
    loadFont('/fonts/helvetiker_regular.typeface.json', normalMaterial)

    // Shapes sphere
    createSphereGroup(normalMaterial)

    // Resize event listener
    window.addEventListener('resize', resize)

    // Camera
    createCamera()

    // Controls
    createControls()

    // Renderer
    createRenderer()

    // Debug GUI

    gui.add(params, "text").onChange(v => {
        refreshText(params.textMaterial)
    })

    gui.add(params, 'shapesMaterial', {
        'rainbow': normalMaterial,
        'metal': matcapMaterialMetal,
        'rust': matcapMaterialRust,
        'green': matcapMaterialGreen,
    }).onChange(() => {
        scene.remove(sphereGroup)
        createSphereGroup(params.shapesMaterial)
    }).name('shapes material')

    gui.add(params, 'textMaterial', {
        'rainbow': normalMaterial,
        'metal': matcapMaterialMetal,
        'rust': matcapMaterialRust,
        'green': matcapMaterialGreen,
    }).onChange(() => {
        textMesh.material = params.textMaterial
    }).name('text material')

    gui.add(params, 'rotate')

    gui.add(params, 'sphereSize').onChange(() => {
        scene.remove(sphereGroup)
        createSphereGroup(params.shapesMaterial)
    }).min(0).max(10).step(1).name('shape sphere size')

    gui.add(params, 'shapesCount').onChange(() => {
        scene.remove(sphereGroup)
        createSphereGroup(params.shapesMaterial)
    }).min(0).max(1000).step(1).name('shapes count')
}


function loadFont(fontPath, material) {
    const fontLoader = new FontLoader()
    fontLoader.load(
        fontPath,
        function (response) {
            font = response
            refreshText(material)
        }
    )
}

function refreshText(material) {
    if (textMesh) scene.remove(textMesh)
    createText(material)
}

function createText(material) {
    const textGeo = new TextGeometry(
        params.text,
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
    textGeo.center()

    textMesh = new THREE.Mesh(textGeo, material)
    scene.add(textMesh)
}

function createSphereGroup(material) {
    sphereGroup = new THREE.Group()
    const sphereSize = params.sphereSize
    const shapeCount = params.shapesCount
    for (let i = 0; i < shapeCount; i++) {
        const theta = 2 * Math.PI * Math.random()
        const phi = Math.acos(1 - 2 * Math.random() * 1)
        const scale = Math.max(Math.random(), 0.2)
        if (i % 3 === 0) {
            createDonut(theta, phi, scale, material, sphereSize)
        } else if (i % 3 === 1) {
            createCube(theta, phi, scale, material, sphereSize)
        } else (
            createPyramid(theta, phi, scale, material, sphereSize)
        )
    }
    scene.add(sphereGroup)
}

function createDonut(theta, phi, scale, material, sphereSize) {
    // Donuts
    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64)
    const donut = new THREE.Mesh(donutGeometry, material)

    donut.position.x = Math.cos(theta) * Math.sin(phi) * sphereSize
    donut.position.y = Math.sin(theta) * Math.sin(phi) * sphereSize
    donut.position.z = Math.cos(phi) * sphereSize
    donut.rotation.x = Math.random() * Math.PI
    donut.rotation.y = Math.random() * Math.PI
    donut.scale.set(scale, scale, scale)

    sphereGroup.add(donut)
}

function createCube(theta, phi, scale, material, sphereSize) {
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const cube = new THREE.Mesh(cubeGeometry, material)

    cube.position.x = Math.cos(theta) * Math.sin(phi) * sphereSize
    cube.position.y = Math.sin(theta) * Math.sin(phi) * sphereSize
    cube.position.z = Math.cos(phi) * sphereSize
    cube.rotation.x = Math.random() * Math.PI
    cube.rotation.y = Math.random() * Math.PI
    cube.scale.set(scale, scale, scale)

    sphereGroup.add(cube)
}

function createPyramid(theta, phi, scale, material, sphereSize) {
    const pyramidGeometry = new THREE.TetrahedronGeometry(0.5)
    const pyramid = new THREE.Mesh(pyramidGeometry, material)

    pyramid.position.x = Math.cos(theta) * Math.sin(phi) * sphereSize
    pyramid.position.y = Math.sin(theta) * Math.sin(phi) * sphereSize
    pyramid.position.z = Math.cos(phi) * sphereSize
    pyramid.rotation.x = Math.random() * Math.PI
    pyramid.rotation.y = Math.random() * Math.PI
    pyramid.scale.set(scale, scale, scale)

    sphereGroup.add(pyramid)
}

/**
 * Sizes
 */

function resize() {
    screenResolution.set(window.innerWidth, window.innerHeight)
    const aspectRatio = screenResolution.x / screenResolution.y
    camera.left = -aspectRatio * 2
    camera.right = aspectRatio * 2
    camera.updateProjectionMatrix()
    renderer.setSize(screenResolution.x, screenResolution.y)
    renderPixelatedPass.setSize(screenResolution.x, screenResolution.y)
}

function createCamera() {
    const aspectRatio = screenResolution.x / screenResolution.y
    camera = new THREE.OrthographicCamera(-aspectRatio * 2, aspectRatio * 2, 2, -2, 0.0000000001)
    camera.position.x = 3
    camera.position.y = new THREE.Vector3(3, 0, 5).distanceTo(new THREE.Vector3(0, 0, 0)) * Math.tan(Math.PI / 6)
    camera.position.z = 5
    scene.add(camera)
}

function createControls() {
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minPolarAngle = controls.maxPolarAngle = controls.getPolarAngle()
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false
    })
    renderer.shadowMap.enabled = true;
    renderer.setSize(screenResolution.x, screenResolution.y)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer = new EffectComposer(renderer)
    renderPixelatedPass = new RenderPixelatedPass(screenResolution, 5, scene, camera)
    composer.addPass(renderPixelatedPass)
    renderPixelatedPass.normalEdgeStrength = 0.1
    renderPixelatedPass.depthEdgeStrength = 0
    renderPixelatedPass.setPixelSize(params.pixelSize)

    gui.add( params, 'pixelSize' ).min( 1 ).max( 16 ).step( 1 )
    .onChange( () => {
        renderPixelatedPass.setPixelSize( params.pixelSize )
    } );
    gui.add( renderPixelatedPass, 'normalEdgeStrength' ).min( 0 ).max( 2 ).step( .05 );
    gui.add( renderPixelatedPass, 'depthEdgeStrength' ).min( 0 ).max( 1 ).step( .05 );
}

function animate() {
    const deltaTime = clock.getDelta()
    if (sphereGroup && params.rotate) {
        sphereGroup.rotation.y += deltaTime * 0.05
    }
    if (textMesh && params.rotate) {
        textMesh.rotation.y += deltaTime * -0.2
    }

    controls.update()

    composer.render()

    window.requestAnimationFrame(animate)
}