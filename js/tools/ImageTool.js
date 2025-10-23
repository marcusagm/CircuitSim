import Tool from './Tool.js';
import ImageShape from '../shapes/Image.js';

class ImageTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }
    deactivate() {}
    activate() {}

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const imageUrl = prompt('Digite a URL da imagem:');
        if (imageUrl !== null && imageUrl.trim() !== '') {
            // Opcionalmente, pedir largura e altura, ou deixar que a imagem defina
            const newImage = new ImageShape(x, y, imageUrl);
            newImage.drawingManager = this.drawingManager; // Atribui o drawingManager para que a imagem possa forçar um redraw
            this.drawingManager.addElement(newImage);
            this.canvas.requestRender(); // Desenha imediatamente, a imagem aparecerá quando carregar
        }
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta de imagem
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta de imagem
    }
}

export default ImageTool;
