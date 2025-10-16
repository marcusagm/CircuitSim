class Canvas {

    constructor(canvasElement, ctx) {
        this.canvasElement = canvasElement;
        this.ctx = ctx;
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        this.drawingManager = null; // Será inicializado posteriormente
        this.grid = null; // Será inicializado posteriormente

        this.needsRender = false;
        this.isRendering = false;
        this.render = this.render.bind(this);
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

    requestRender() {
        this.needsRender = true;
        if (!this.isRendering) {
            this.isRendering = true;
            requestAnimationFrame(this.render);
        }
    }

    render() {
        if (this.needsRender) {
            this.needsRender = false;
            this.draw();
        }
        this.isRendering = false;
    }

    draw() {
        // Este método será sobrescrito no script.js para incluir a grid e os elementos do DrawingManager
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

export default Canvas;
