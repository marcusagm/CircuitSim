import Tool from './Tool.js';

class SelectTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        // A lista de elementos selecionados será gerenciada pelo drawingManager e acessada dinamicamente
    }

    activate() {
        // Não deseleciona ao ativar, para permitir que a seleção persista entre ferramentas
    }

    deactivate() {
        // Não deseleciona ao desativar, para permitir que a seleção persista entre ferramentas
    }

    // Este método agora deseleciona todos os elementos no drawingManager
    deselectAll() {
        this.drawingManager.elements.forEach(el => el.deselect());
        this.canvas.requestRender();
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const clickedElement = this.drawingManager.findElementAt(x, y);
        console.log(clickedElement);

        if (event.ctrlKey || event.metaKey) {
            // Ctrl/Cmd para seleção múltipla
            if (clickedElement) {
                if (clickedElement.isSelected) {
                    clickedElement.deselect();
                } else {
                    clickedElement.select();
                }
            }
        } else {
            // Seleção única
            if (clickedElement) {
                if (!clickedElement.isSelected) {
                    this.deselectAll(); // Deseleciona todos os outros
                    clickedElement.select();
                }
                // Se já estiver selecionado, não faz nada (permite arrastar com a MoveTool)
            } else {
                this.deselectAll(); // Clicou no vazio, deseleciona tudo
            }
        }
        this.canvas.requestRender();
    }

    onMouseMove(event) {
        // A seleção não arrasta, apenas marca
    }

    onMouseUp(event) {
        // A seleção não arrasta, apenas marca
    }
}

export default SelectTool;
