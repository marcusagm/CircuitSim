import Tool from "./Tool.js";

class DeleteTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const clickedElement = this.drawingManager.findElementAt(x, y);

        if (clickedElement) {
            // Se o elemento clicado for um fio, remover as referências dos terminais
            if (clickedElement.constructor.name === "Wire") {
                if (clickedElement.startTerminal) {
                    clickedElement.startTerminal.removeWire(clickedElement);
                }
                if (clickedElement.endTerminal) {
                    clickedElement.endTerminal.removeWire(clickedElement);
                }
            }
            this.drawingManager.removeElement(clickedElement);
            this.canvas.draw();
        }
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta de exclusão
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta de exclusão
    }
}

export default DeleteTool;
