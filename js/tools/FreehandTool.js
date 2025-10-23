import Tool from './Tool.js';
import Freehand from '../shapes/Freehand.js';

class FreehandTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentFreehand = null;
    }
    deactivate() {}
    activate() {}

    onMouseDown(event) {
        this.isDrawing = true;
        const { x, y } = this.getMouseCoords(event);
        this.currentFreehand = new Freehand();
        this.currentFreehand.addPoint(x, y);
        this.drawingManager.addElement(this.currentFreehand);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMouseCoords(event);
        this.currentFreehand.addPoint(x, y);
        this.canvas.requestRender();
    }

    onMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentFreehand.points.length < 2) {
            this.drawingManager.removeElement(this.currentFreehand);
        }
        this.currentFreehand = null;
        this.canvas.requestRender();
    }
}

export default FreehandTool;
