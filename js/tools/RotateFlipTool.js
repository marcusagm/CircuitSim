import Tool from "./Tool.js";

class RotateFlipTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        this.selectedElements = [];
    }

    activate() {
        // A ferramenta de rotação/inversão opera sobre os elementos selecionados.
        // Não há lógica de ativação/desativação complexa além de garantir que os elementos estejam selecionados.
    }

    onMouseDown(event) {
        // Esta ferramenta não usa arrastar, mas sim ações de clique para rotação/inversão.
        // As ações serão disparadas por botões na UI, não diretamente no canvas.
        // No entanto, para fins de demonstração, podemos adicionar um comportamento básico aqui.
        // Por exemplo, um clique com o botão direito pode girar.
        // Ou, mais realisticamente, esta ferramenta seria ativada e então o usuário clicaria em botões específicos na UI.

        // Para a implementação inicial, vamos apenas selecionar os elementos para que as ações de rotação/inversão
        // possam ser chamadas externamente (e.g., por botões na barra de ferramentas).
        const { x, y } = this.getMouseCoords(event);
        const clickedElement = this.drawingManager.findElementAt(x, y);

        if (clickedElement) {
            if (!clickedElement.isSelected) {
                // Desseleciona outros se não for Ctrl/Cmd
                this.drawingManager.drawableElements.forEach((el) =>
                    el.deselect()
                );
                this.selectedElements = [];
                clickedElement.select();
                this.selectedElements.push(clickedElement);
            } else if (event.ctrlKey || event.metaKey) {
                // Permite deselecionar com Ctrl/Cmd
                clickedElement.deselect();
                this.selectedElements = this.selectedElements.filter(
                    (el) => el !== clickedElement
                );
            }
        } else {
            this.drawingManager.drawableElements.forEach((el) => el.deselect());
            this.selectedElements = [];
        }
        this.canvas.draw();
    }

    onMouseMove(event) {
        // Não há arrastar para esta ferramenta
    }

    onMouseUp(event) {
        // Não há arrastar para esta ferramenta
    }

    // Métodos para serem chamados por botões da UI
    rotateSelected(angle) {
        this.drawingManager.drawableElements
            .filter((el) => el.isSelected)
            .forEach((el) => {
                if (el.rotate) {
                    el.rotate(angle);
                }
            });
        this.canvas.draw();
    }

    flipSelectedHorizontal() {
        this.drawingManager.drawableElements
            .filter((el) => el.isSelected)
            .forEach((el) => {
                if (el.flipHorizontal) {
                    el.flipHorizontal();
                }
            });
        this.canvas.draw();
    }

    flipSelectedVertical() {
        this.drawingManager.drawableElements
            .filter((el) => el.isSelected)
            .forEach((el) => {
                if (el.flipVertical) {
                    el.flipVertical();
                }
            });
        this.canvas.draw();
    }
}

export default RotateFlipTool;
