import Tool from './Tool.js';

class MoveTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.selectedElements = []; // Referência aos elementos selecionados pelo SelectTool
    }

    activate() {
        // no-op
    }

    deactivate() {
        this.isDragging = false;
        this.elementsToMove = []; // Limpa a referência ao desativar para evitar estados residuais
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);

        // Obter elementos selecionados do DrawingManager (que é a fonte da verdade para a seleção)
        const currentlySelectedElements = this.drawingManager.getAllSelectedElements();
        const clickedElement = this.drawingManager.findElementAt(x, y);

        if (clickedElement) {
            if (clickedElement.isSelected) {
                // Se o elemento clicado já está selecionado, move todos os selecionados
                this.elementsToMove = currentlySelectedElements;
            } else {
                // Se o elemento clicado NÃO está selecionado, deseleciona tudo e seleciona apenas este
                this.drawingManager.elements.forEach(el => el.deselect());
                clickedElement.select();
                this.elementsToMove = [clickedElement];
            }
        } else {
            // Clicou no vazio, deseleciona tudo
            this.drawingManager.elements.forEach(el => el.deselect());
            this.elementsToMove = [];
        }

        if (this.elementsToMove.length > 0) {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
        }
        this.canvas.requestRender();
    }

    onMouseMove(event) {
        if (!this.isDragging || this.elementsToMove.length === 0) return;

        const { x, y } = this.getMouseCoords(event);
        const dx = x - this.dragStartX;
        const dy = y - this.dragStartY;

        this.elementsToMove.forEach(el => {
            el.move(dx, dy);
        });

        this.dragStartX = x;
        this.dragStartY = y;
        this.canvas.requestRender();
    }

    onMouseUp(event) {
        this.isDragging = false;
        // A seleção deve persistir, então não limpamos elementsToMove aqui.
        this.canvas.requestRender();
    }
}

export default MoveTool;
