import Tool from './Tool.js';
import Circle from '../shapes/Circle.js';

class CircleTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentCircle = null;
    }
    deactivate() {}
    activate() {}

    onMouseDown(event) {
        this.isDrawing = true;
        const { x, y } = this.getMouseCoords(event);
        this.startX = x;
        this.startY = y;
        this.currentCircle = new Circle(this.startX, this.startY, 0);
        this.drawingManager.addElement(this.currentCircle);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMouseCoords(event);
        const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
        this.currentCircle.radius = radius;
        this.canvas.requestRender();
    }

    onMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentCircle.radius === 0) {
            this.drawingManager.removeElement(this.currentCircle);
        }
        this.currentCircle = null;
        this.canvas.requestRender();
    }
}

export default CircleTool;
