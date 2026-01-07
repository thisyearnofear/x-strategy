import * as THREE from "three"
import { Dimensions, Size } from "./types/types"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import Planes from "./planes"
import { CardFocusManager, addFocusSystem } from "./interactions/cardFocus"

export default class Canvas {
  element: HTMLCanvasElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  sizes: Size
  dimensions: Dimensions
  time: number
  clock: THREE.Clock
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2 = new THREE.Vector2()
  orbitControls: OrbitControls
  debug: GUI
  planes: Planes
  material: THREE.ShaderMaterial
  focusManager: CardFocusManager | null = null

  constructor() {
    this.element = document.getElementById("webgl") as HTMLCanvasElement
    this.time = 0
    this.createClock()
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.createRaycaster()
    this.setSizes()
    this.addEventListeners()
    this.createDebug()
    this.createPlanes()

    this.debug.hide()

    this.render()
  }

  setTheme(theme: string) {
    if (theme === 'dark') {
      this.renderer.setClearColor(0x000000, 0) // Transparent for CSS background
    } else {
      this.renderer.setClearColor(0xffffff, 0) // Transparent for CSS background
    }
  }

  createScene() {
    this.scene = new THREE.Scene()
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.scene.add(this.camera)
    this.camera.position.z = 10
  }

  createHelpers() {
    const axesHelper = new THREE.AxesHelper(5)
    this.scene.add(axesHelper)
  }

  createOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
  }

  createPlanes() {
    this.planes = new Planes({ scene: this.scene, sizes: this.sizes })
    // Bind drag interactions to the renderer's canvas
    this.planes.bindDrag(this.renderer.domElement)
    
    // Add focus system after planes are created
    this.focusManager = addFocusSystem(this.planes, this.camera)
  }

  createRenderer() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.element,
      alpha: true,
    })
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
  }

  createDebug() {
    this.debug = new GUI()
  }

  setSizes() {
    let fov = this.camera.fov * (Math.PI / 180)
    let height = this.camera.position.z * Math.tan(fov / 2) * 2
    let width = height * this.camera.aspect

    this.sizes = {
      width: width,
      height: height,
    }
  }

  createClock() {
    this.clock = new THREE.Clock()
  }

  createRaycaster() {
    this.raycaster = new THREE.Raycaster()
  }

  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update raycaster for hover
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    if (this.planes && this.planes.instancedMesh) {
      const intersects = this.raycaster.intersectObject(this.planes.instancedMesh)
      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId
        if (instanceId !== undefined) {
          this.planes.setHoveredInstance(instanceId)
          document.body.style.cursor = 'pointer'
        }
      } else {
        this.planes.setHoveredInstance(null)
        document.body.style.cursor = 'default'
      }
    }
  }

  addEventListeners() {
    window.addEventListener("mousemove", this.onMouseMove.bind(this))
    window.addEventListener("resize", this.onResize.bind(this))
    window.addEventListener("click", this.onClick.bind(this))
  }

  onClick(event: MouseEvent) {
    // Update mouse position for raycasting
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Check for intersections with planes
    if (this.planes && this.planes.instancedMesh) {
      const intersects = this.raycaster.intersectObject(this.planes.instancedMesh)
      
      if (intersects.length > 0) {
        const intersection = intersects[0]
        const instanceId = intersection.instanceId
        
        if (instanceId !== undefined) {
          // Check if clicking on already focused card
          if (this.focusManager && this.focusManager.getFocusedCardId() === instanceId) {
            // Unfocus (close detail view)
            this.focusManager.unfocusCard()
          } else if (this.focusManager) {
            // Focus on new card
            this.focusManager.focusCard(instanceId)
          }
          
          // Notify planes about the click
          this.planes.onPlaneClick(instanceId)
        }
      } else if (this.focusManager && this.focusManager.isFocused()) {
        // Clicked empty space - unfocus
        this.focusManager.unfocusCard()
      }
    }
  }

  onResize() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.setSizes()

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    
    // Notify focus manager of resize
    if (this.focusManager) {
      this.focusManager.handleResize()
    }
  }

  render() {
    const now = this.clock.getElapsedTime()
    const delta = now - this.time
    this.time = now

    const normalizedDelta = delta / (1 / 60)

    this.planes?.render(normalizedDelta)

    this.renderer.render(this.scene, this.camera)
  }
}
