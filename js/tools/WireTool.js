import Tool from './Tool.js';
import Wire from '../components/Wire.js';

class WireTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.currentWire = null;
        this.startTerminal = null;
        this.lastPoint = null;
        this.isDrawingWire = false;
    }

    activate() {
        this.reset();
    }

    deactivate() {
        this.reset();
    }

    reset() {
        if (this.currentWire && this.currentWire.isTemporary) {
            this.drawingManager.removeElement(this.currentWire);
        }
        this.currentWire = null;
        this.startTerminal = null;
        this.lastPoint = null;
        this.isDrawingWire = false;
        this.canvas.draw();
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const snappedX = Math.round(x / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;
        const snappedY = Math.round(y / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;
        const snappedPoint = { x: snappedX, y: snappedY };

        let clickedTerminal = null;
        let clickedComponent = null;

        // Procura por um terminal clicado em qualquer componente
        for (const element of this.drawingManager.drawableElements) {
            if (element.terminals) {
                for (const terminal of element.terminals) {
                    const absPos = terminal.getAbsolutePosition();
                    if (terminal.isHit(x, y)) {
                        clickedTerminal = terminal;
                        clickedComponent = element;
                        break;
                    }
                }
            }
            if (clickedTerminal) break;
        }

        if (!this.isDrawingWire) {
            // Tentando iniciar um novo fio
            if (clickedTerminal) {
                this.startTerminal = clickedTerminal;
                this.currentWire = new Wire(this.startTerminal);
                this.currentWire.isTemporary = true;
                this.drawingManager.addElement(this.currentWire);
                this.startTerminal.addWire(this.currentWire);
                this.lastPoint = this.startTerminal.getAbsolutePosition();
                this.isDrawingWire = true;
            } else {
                // Clicou em um ponto vazio, iniciar fio a partir de um ponto livre
                this.currentWire = new Wire();
                this.currentWire.isTemporary = true;
                this.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                this.drawingManager.addElement(this.currentWire);
                this.lastPoint = snappedPoint;
                this.isDrawingWire = true;
            }
        } else {
            // Continuar desenhando o fio ou conectar a um terminal
            if (clickedTerminal && clickedTerminal !== this.startTerminal) {
                // Conectar a outro terminal
                this.currentWire.endTerminal = clickedTerminal;
                clickedTerminal.addWire(this.currentWire);
                this.currentWire.isTemporary = false;
                this.currentWire = null;
                this.startTerminal = null;
                this.lastPoint = null;
                this.isDrawingWire = false;
            } else {
                // Adicionar um ponto de dobra ao fio
                this.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                this.lastPoint = snappedPoint;
            }
        }
        this.canvas.draw();
    }

    onMouseMove(event) {
        if (!this.isDrawingWire || !this.currentWire) return;

        const { x, y } = this.getMouseCoords(event);
        const snappedX = Math.round(x / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;
        const snappedY = Math.round(y / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;
        const currentSnappedPoint = { x: snappedX, y: snappedY };

        // Se não há pontos no path, o ponto inicial é o startTerminal ou o primeiro clique
        const referencePoint = this.currentWire.path.length > 0 ?
                               this.currentWire.path[this.currentWire.path.length - 1] :
                               (this.startTerminal ? this.startTerminal.getAbsolutePosition() : this.lastPoint);

        let finalX = currentSnappedPoint.x;
        let finalY = currentSnappedPoint.y;

        const dx = Math.abs(currentSnappedPoint.x - referencePoint.x);
        const dy = Math.abs(currentSnappedPoint.y - referencePoint.y);

        // Lógica para forçar ortogonal ou 45 graus
        if (dx === dy) {
            // 45 graus
            finalX = currentSnappedPoint.x;
            finalY = currentSnappedPoint.y;
        } else if (dx > dy) {
            // Horizontal
            finalY = referencePoint.y;
        } else {
            // Vertical
            finalX = referencePoint.x;
        }

        // Adiciona ou atualiza o último ponto do path
        if (this.currentWire.path.length === 0 && !this.startTerminal) {
            // Se o fio começou de um ponto livre e este é o primeiro movimento
            this.currentWire.path.push({ x: finalX, y: finalY });
        } else if (this.currentWire.path.length === 0 && this.startTerminal) {
            // Se o fio começou de um terminal, o primeiro ponto do path é o mouse
            this.currentWire.path.push({ x: finalX, y: finalY });
        } else {
            // Atualiza o último ponto do path
            this.currentWire.path[this.currentWire.path.length - 1] = { x: finalX, y: finalY };
        }

        this.canvas.draw();
    }

    onMouseUp(event) {
        // A lógica de finalização do fio é tratada no onMouseDown (ao clicar em outro terminal ou em um ponto livre)
        // Não há necessidade de lógica aqui para esta ferramenta específica
    }
}

export default WireTool;

