import Tool from './Tool.js';
import ThreePointCurve from '../shapes/ThreePointCurve.js';

class ThreePointCurveTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentCurve = null;
        this.clickCount = 0;
        this.p1 = null; // Start point
        this.p2 = null; // End point
    }

    activate() {
        this.clickCount = 0;
        this.p1 = null;
        this.p2 = null;
        this.currentCurve = null;
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);

        if (this.clickCount === 0) {
            // Primeiro clique: ponto inicial
            this.p1 = { x, y };
            this.currentCurve = new ThreePointCurve(x, y, x, y, x, y); // Inicializa com todos os pontos iguais
            this.drawingManager.addElement(this.currentCurve);
            this.isDrawing = true;
            this.clickCount++;
        } else if (this.clickCount === 1) {
            // Segundo clique: ponto final
            this.p2 = { x, y };
            this.currentCurve.x2 = x;
            this.currentCurve.y2 = y;
            this.clickCount++;
        } else if (this.clickCount === 2) {
            // Terceiro clique: ponto de controle
            this.currentCurve.cx = x;
            this.currentCurve.cy = y;
            this.isDrawing = false;
            this.currentCurve = null;
            this.clickCount = 0;
            this.canvas.draw();
        }
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const { x, y } = this.getMouseCoords(event);

        if (this.clickCount === 1) {
            // Desenhando o ponto final da curva
            this.currentCurve.x2 = x;
            this.currentCurve.y2 = y;
            // O ponto de controle segue o mouse para visualização
            this.currentCurve.cx = x;
            this.currentCurve.cy = y;
        } else if (this.clickCount === 2) {
            // Desenhando o ponto de controle da curva
            this.currentCurve.cx = x;
            this.currentCurve.cy = y;
        }
        this.canvas.draw();
    }

    onMouseUp(event) {
        // A lógica de finalização é tratada no terceiro clique do onMouseDown
        // Não há necessidade de lógica aqui para esta ferramenta específica
    }
}

export default ThreePointCurveTool;

