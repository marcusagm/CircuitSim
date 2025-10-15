import Tool from './Tool.js';
import Wire from '../components/Wire.js';

class NodeEditTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.selectedWire = null;
        this.draggingNodeIndex = -1; // -1 para nenhum nó arrastado
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialNodePos = { x: 0, y: 0 }; // Posição inicial do nó antes do arrasto
    }

    activate() {
        this.selectedWire = null;
        this.draggingNodeIndex = -1;
        this.canvas.draw();
    }

    deactivate() {
        if (this.selectedWire) {
            this.selectedWire.deselect();
        }
        this.selectedWire = null;
        this.draggingNodeIndex = -1;
        this.canvas.draw();
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);

        // Primeiro, verifica se um nó de um fio já selecionado foi clicado
        if (this.selectedWire) {
            const pointsToConsider = [];
            const hasStartTerminal = !!this.selectedWire.startTerminal;
            if (hasStartTerminal) pointsToConsider.push(this.selectedWire.startTerminal.getAbsolutePosition());
            pointsToConsider.push(...this.selectedWire.path);
            if (this.selectedWire.endTerminal) pointsToConsider.push(this.selectedWire.endTerminal.getAbsolutePosition());

            for (let i = 0; i < pointsToConsider.length; i++) {
                const p = pointsToConsider[i];
                const distance = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));

                if (distance < 10) { // Encontrou um nó
                    const isStartTerminalHandle = hasStartTerminal && i === 0;
                    const isEndTerminalHandle = this.selectedWire.endTerminal && i === pointsToConsider.length - 1;

                    // Terminais não são arrastáveis com esta ferramenta
                    if (isStartTerminalHandle || isEndTerminalHandle) {
                        console.log("Terminais não podem ser movidos com a ferramenta de edição de nós. Mova o componente.");
                        this.draggingNodeIndex = -1; // Garante que não haverá arrasto
                        return; // Interrompe a ação
                    }

                    // É um nó de path arrastável
                    this.draggingNodeIndex = i;
                    this.dragStartX = x;
                    this.dragStartY = y;
                    this.initialNodePos = { x: p.x, y: p.y };
                    return; // Interrompe para iniciar o arrasto
                }
            }
        }

        // Se não iniciou um arrasto, verifica se um novo fio deve ser selecionado
        this.draggingNodeIndex = -1; // Garante que não está arrastando
        const clickedElement = this.drawingManager.findElementAt(x, y);

        if (clickedElement instanceof Wire) {
            if (this.selectedWire !== clickedElement) {
                if (this.selectedWire) {
                    this.selectedWire.deselect();
                }
                this.selectedWire = clickedElement;
                this.selectedWire.select();
            }
        } else {
            // Clicou no vazio, deseleciona o fio atual
            if (this.selectedWire) {
                this.selectedWire.deselect();
                this.selectedWire = null;
            }
        }
        this.canvas.draw();
    }

    onMouseMove(event) {
        if (this.draggingNodeIndex === -1 || !this.selectedWire) return;

        const { x, y } = this.getMouseCoords(event);

        const deltaX = x - this.dragStartX;
        const deltaY = y - this.dragStartY;

        let newX = this.initialNodePos.x + deltaX;
        let newY = this.initialNodePos.y + deltaY;

        const snappedX = Math.round(newX / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;
        const snappedY = Math.round(newY / this.canvas.grid.gridCellSize) * this.canvas.grid.gridCellSize;

        let pathIndexToUpdate = this.draggingNodeIndex;
        if (this.selectedWire.startTerminal) {
            pathIndexToUpdate--; // Ajusta o índice para o array 'path'
        }

        if (pathIndexToUpdate >= 0 && pathIndexToUpdate < this.selectedWire.path.length) {
            this.selectedWire.path[pathIndexToUpdate].x = snappedX;
            this.selectedWire.path[pathIndexToUpdate].y = snappedY;
        }

        this.canvas.draw();
    }

    onMouseUp(event) {
        this.draggingNodeIndex = -1;
        // Não deseleciona o fio, para permitir múltiplas edições
        this.canvas.draw();
    }
}

export default NodeEditTool;

