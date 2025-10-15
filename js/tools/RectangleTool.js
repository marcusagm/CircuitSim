import Tool from './Tool.js';
import Rectangle from '../shapes/Rectangle.js';

class RectangleTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentRectangle = null;
    }

    onMouseDown(event) {
        this.isDrawing = true;
        const { x, y } = this.getMouseCoords(event);
        this.startX = x;
        this.startY = y;
        this.currentRectangle = new Rectangle(this.startX, this.startY, 0, 0);
        this.drawingManager.addElement(this.currentRectangle);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMouseCoords(event);
        this.currentRectangle.width = x - this.startX;
        this.currentRectangle.height = y - this.startY;
        this.canvas.draw();
    }

    onMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        // Ajusta largura e altura para serem sempre positivas
        if (this.currentRectangle.width < 0) {
            this.currentRectangle.x += this.currentRectangle.width;
            this.currentRectangle.width = Math.abs(this.currentRectangle.width);
        }
        if (this.currentRectangle.height < 0) {
            this.currentRectangle.y += this.currentRectangle.height;
            this.currentRectangle.height = Math.abs(this.currentRectangle.height);
        }
        if (this.currentRectangle.width === 0 || this.currentRectangle.height === 0) {
            this.drawingManager.removeElement(this.currentRectangle);
        }
        this.currentRectangle = null;
        this.canvas.draw();
    }
}

export default RectangleTool;

