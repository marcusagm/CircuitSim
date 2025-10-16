import Tool from "./Tool.js";

class ComponentTool extends Tool {
    constructor(canvas, drawingManager, componentClass, componentName) {
        super(canvas, drawingManager);
        this.componentClass = componentClass;
        this.componentName = componentName;
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        // Instancia o componente com as coordenadas do clique
        const newComponent = new this.componentClass(x, y);
        newComponent.drawingManager = this.drawingManager; // Permite que o componente force um redraw ao carregar SVG
        this.drawingManager.addElement(newComponent);
        this.canvas.requestRender();
    }

    onMouseMove(event) {
        // Não faz nada para a ferramenta de componente
    }

    onMouseUp(event) {
        // Não faz nada para a ferramenta de componente
    }
}

export default ComponentTool;
