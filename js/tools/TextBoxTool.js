import Tool from "./Tool.js";
import TextBox from "../shapes/TextBox.js";

class TextBoxTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const textContent = prompt("Digite o texto:");
        if (textContent !== null && textContent.trim() !== "") {
            const newTextBox = new TextBox(x, y, textContent);
            this.drawingManager.addElement(newTextBox);
            this.canvas.requestRender();
        }
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta de caixa de texto
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta de caixa de texto
    }
}

export default TextBoxTool;
