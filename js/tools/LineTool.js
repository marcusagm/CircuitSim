import Tool from "./Tool.js";
import Line from "../shapes/Line.js";

class LineTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentLine = null;
    }

    onMouseDown(event) {
        this.isDrawing = true;
        const { x, y } = this.getMouseCoords(event);
        this.startX = x;
        this.startY = y;
        this.currentLine = new Line(
            this.startX,
            this.startY,
            this.startX,
            this.startY
        );
        this.drawingManager.addElement(this.currentLine);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMouseCoords(event);
        this.currentLine.x2 = x;
        this.currentLine.y2 = y;
        this.canvas.draw();
    }

    onMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.currentLine = null;
        this.canvas.draw();
    }
}

export default LineTool;
