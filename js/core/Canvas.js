class Canvas {
    constructor(canvasElement, ctx) {
        this.canvasElement = canvasElement;
        this.ctx = ctx;
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        this.drawingManager = null; // Será inicializado posteriormente
        this.grid = null; // Será inicializado posteriormente
    }

    set width(value) {
        this.canvasElement.width = value;
    }

    get width() {
        return this.canvasElement.width;
    }

    set height(value) {
        this.canvasElement.height = value;
    }

    get height() {
        return this.canvasElement.height;
    }

    draw() {
        // Este método será sobrescrito no script.js para incluir a grid e os elementos do DrawingManager
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default Canvas;
