import Tool from "./Tool.js";
import SVGDrawing from "../shapes/SVGDrawing.js";

class SVGTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const svgContent = prompt("Cole o conteúdo SVG aqui:");
        if (svgContent !== null && svgContent.trim() !== "") {
            const newSVG = new SVGDrawing(x, y, svgContent);
            newSVG.drawingManager = this.drawingManager; // Atribui o drawingManager para que o SVG possa forçar um redraw
            this.drawingManager.addElement(newSVG);
            this.canvas.requestRender(); // Desenha imediatamente, o SVG aparecerá quando carregar
        }
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta SVG
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta SVG
    }
}

export default SVGTool;
