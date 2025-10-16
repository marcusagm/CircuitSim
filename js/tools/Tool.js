class Tool {
    constructor(canvas, drawingManager) {
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.drawingManager = drawingManager;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
    }

    activate() {
        // Pode ser sobrescrito por subclasses para lógica de ativação
    }

    deactivate() {
        // Pode ser sobrescrito por subclasses para lógica de desativação
    }

    onMouseDown(event) {
        // Método abstrato
    }

    onMouseMove(event) {
        // Método abstrato
    }

    onMouseUp(event) {
        // Método abstrato
    }

    getMouseCoords(event) {
        const rect = this.canvas.canvasElement.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
}

export default Tool;
