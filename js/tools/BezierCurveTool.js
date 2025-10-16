import Tool from "./Tool.js";
import BezierCurve from "../shapes/BezierCurve.js";

class BezierCurveTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentCurve = null;
        this.points = []; // Armazena todos os pontos (start, control1, control2, end)
        this.clickCount = 0;
        this.isDrawing = false;

        // Adiciona listener para a tecla ESC
        this.boundKeyDown = this.onKeyDown.bind(this);
    }

    activate() {
        this.reset();
        document.addEventListener("keydown", this.boundKeyDown);
    }

    deactivate() {
        this.reset();
        document.removeEventListener("keydown", this.boundKeyDown);
    }

    reset() {
        if (this.currentCurve && this.isDrawing) {
            this.drawingManager.removeElement(this.currentCurve);
        }
        this.currentCurve = null;
        this.points = [];
        this.clickCount = 0;
        this.isDrawing = false;
        this.canvas.draw();
    }

    onKeyDown(event) {
        if (event.key === "Escape" && this.isDrawing) {
            this.reset();
        }
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);

        if (!this.isDrawing) {
            // Primeiro clique: ponto inicial
            this.points.push({ x, y });
            this.currentCurve = new BezierCurve(x, y, x, y, x, y, x, y); // Inicializa com todos os pontos iguais
            this.drawingManager.addElement(this.currentCurve);
            this.isDrawing = true;
            this.clickCount++;
        } else {
            // Adiciona pontos de controle ou ponto final
            this.points.push({ x, y });
            this.clickCount++;

            // Atualiza a curva com os novos pontos
            this.updateCurvePoints();

            // Se tivermos 4 pontos (start, cp1, cp2, end), a curva está completa
            if (this.clickCount >= 4) {
                this.currentCurve.isTemporary = false; // Marca como não temporário
                this.currentCurve = null;
                this.points = [];
                this.clickCount = 0;
                this.isDrawing = false;
            }
        }
        this.canvas.draw();
    }

    onMouseMove(event) {
        if (!this.isDrawing || !this.currentCurve) return;

        const { x, y } = this.getMouseCoords(event);

        // Atualiza o ponto que está sendo desenhado
        if (this.clickCount === 1) {
            // Ponto de controle 1 e ponto final (para visualização)
            this.currentCurve.cx1 = x;
            this.currentCurve.cy1 = y;
            this.currentCurve.cx2 = x; // Temporariamente
            this.currentCurve.cy2 = y; // Temporariamente
            this.currentCurve.x2 = x;
            this.currentCurve.y2 = y;
        } else if (this.clickCount === 2) {
            // Ponto de controle 2 e ponto final (para visualização)
            this.currentCurve.cx2 = x;
            this.currentCurve.cy2 = y;
            this.currentCurve.x2 = x;
            this.currentCurve.y2 = y;
        } else if (this.clickCount === 3) {
            // Ponto final
            this.currentCurve.x2 = x;
            this.currentCurve.y2 = y;
        }
        this.canvas.draw();
    }

    onMouseUp(event) {
        // A lógica de finalização é tratada no onMouseDown ou via ESC
    }

    updateCurvePoints() {
        // Garante que temos pelo menos 4 pontos para uma curva Bezier completa
        if (this.points.length >= 4) {
            this.currentCurve.x1 = this.points[0].x;
            this.currentCurve.y1 = this.points[0].y;
            this.currentCurve.cx1 = this.points[1].x;
            this.currentCurve.cy1 = this.points[1].y;
            this.currentCurve.cx2 = this.points[2].x;
            this.currentCurve.cy2 = this.points[2].y;
            this.currentCurve.x2 = this.points[3].x;
            this.currentCurve.y2 = this.points[3].y;
        } else if (this.points.length === 3) {
            // Se tivermos 3 pontos, o último é o cp2 e o end point é o mesmo
            this.currentCurve.x1 = this.points[0].x;
            this.currentCurve.y1 = this.points[0].y;
            this.currentCurve.cx1 = this.points[1].x;
            this.currentCurve.cy1 = this.points[1].y;
            this.currentCurve.cx2 = this.points[2].x;
            this.currentCurve.cy2 = this.points[2].y;
            this.currentCurve.x2 = this.points[2].x;
            this.currentCurve.y2 = this.points[2].y;
        } else if (this.points.length === 2) {
            // Se tivermos 2 pontos, o segundo é o cp1 e o cp2 e end point são o mesmo
            this.currentCurve.x1 = this.points[0].x;
            this.currentCurve.y1 = this.points[0].y;
            this.currentCurve.cx1 = this.points[1].x;
            this.currentCurve.cy1 = this.points[1].y;
            this.currentCurve.cx2 = this.points[1].x;
            this.currentCurve.cy2 = this.points[1].y;
            this.currentCurve.x2 = this.points[1].x;
            this.currentCurve.y2 = this.points[1].y;
        }
    }
}

export default BezierCurveTool;
