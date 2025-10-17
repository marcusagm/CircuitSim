/**
 * HandleBox class represents a bounding box with interactive handles for resizing and manipulating components.
 * It provides various types of handles for different purposes, such as resizing, anchoring, and directional indicators.
 *
 * Each handle is represented by an instance of the Handle class, which defines its appearance and behavior.
 *
 * Example usage:
 * import HandleBox from './HandleBox';
 *
 * const handleBox = new HandleBox(x, y, width, height, parentComponent);
 * handleBox.draw(canvasContext);
 *
 */
import Handle from "./Handle.js";
import Canvas from "../core/Canvas.js";

class HandleBox {
    static TYPES = {
        SQUARE: "square", // Quadrado
        DOT: "dot", // Ponto simples
        DIRECTIONAL: "directional", // Para indicar direção de fluxo, como em diodos
        ANCHOR: "anchor", // Ponto de ancoragem para curvas
        CROSS: "cross" // Cruz para indicar pontos de interseção
    };

    constructor(x, y, width, height, parentComponent, showCenterHandles = true, isDashed = true, borderSize = 1, borderColor = "#00ccffff") {
        // 1177ddcc é um azul semi-transparente
        // 0055aacc é um azul mais escuro semi-transparente
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.parentComponent = parentComponent;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
        this.isDashed = isDashed;
        this.showCenterHandles = showCenterHandles;
    }

    getAbsolutePosition() {
        // Considera a posição do componente pai e sua rotação/inversão
        // Por enquanto, apenas a posição do componente pai
        return {
            x: this.x,
            y: this.y,
        };
    }

    /**
     * Draws the handle box and its handles on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle box will be drawn.
     * @returns {void}
     */
    draw(canvas) {
        const absPos = this.getAbsolutePosition();

        canvas
            .setStrokeColor(this.borderColor)
            .setStrokeWidth(this.borderSize);

        if (this.isDashed) {
            canvas.setStrokeDash([5, 3]);
        } else {
            canvas.setStrokeDash([]);
        }

        canvas
            .rectangle(absPos.x, absPos.y, this.width, this.height)
            .stroke()
            .restore();


        new Handle(this.x, this.y, Handle.TYPES.SQUARE).draw(canvas); // Top-left
        new Handle(this.x + this.width, this.y, Handle.TYPES.SQUARE).draw(canvas); // Top-right
        new Handle(this.x, this.y + this.height, Handle.TYPES.SQUARE).draw(canvas); // Bottom-left
        new Handle(this.x + this.width, this.y + this.height, Handle.TYPES.SQUARE).draw(canvas); // Bottom-right

        new Handle(this.x + this.width / 2, this.y, Handle.TYPES.DOT).draw(canvas); // Top-center
        new Handle(this.x + this.width / 2, this.y + this.height, Handle.TYPES.DOT).draw(canvas); // Bottom-center
        new Handle(this.x, this.y + this.height / 2, Handle.TYPES.DOT).draw(canvas); // Middle-left
        new Handle(this.x + this.width, this.y + this.height / 2, Handle.TYPES.DOT).draw(canvas); // Middle-right

        if (this.showCenterHandles) {
            new Handle(this.x + this.width / 2, this.y + this.height / 2, Handle.TYPES.CROSS).draw(canvas); // Center
        }
    }
}

export default HandleBox;
