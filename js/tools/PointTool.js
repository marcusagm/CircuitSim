import Tool from "./Tool.js";
import Point from "../shapes/Point.js";

class PointTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const newPoint = new Point(x, y);
        this.drawingManager.addElement(newPoint);
        this.canvas.draw();
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta de ponto
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta de ponto
    }
}

export default PointTool;
