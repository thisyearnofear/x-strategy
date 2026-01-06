import Canvas from "./canvas"

class App {
  canvas: Canvas

  constructor() {
    // Check if we're running in a browser environment
    if (typeof window !== 'undefined') {
      this.canvas = new Canvas()
      this.render()
    }
  }

  render() {
    if (this.canvas) {
      this.canvas.render()
      requestAnimationFrame(this.render.bind(this))
    }
  }
}

export default App
