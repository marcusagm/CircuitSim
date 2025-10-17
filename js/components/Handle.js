/**
 * Represents a handle for user interaction on components.
 * Handles can be of various types, such as square, dot, directional, or cross.
 */
import Canvas from "../core/Canvas.js";

class Handle {
    static TYPES = {
        SQUARE: "square", // Quadrado
        DOT: "dot", // Ponto simples
        DIRECTIONAL: "directional", // Para indicar direção de fluxo, como em diodos
        CROSS: "cross", // Cruz para indicar pontos de interseção
    };

    constructor(
        x,
        y,
        type,
        parentComponent,
        size = 10,
        fillColor = "#00ccff66",
        borderSize = 2,
        borderColor = "#00ccffff"
    ) {
        // 1177ddcc é um azul semi-transparente
        // 0055aacc é um azul mais escuro semi-transparente
        this.x = x;
        this.y = y;
        this.parentComponent = parentComponent;
        this.type = type || Handle.TYPES.SQUARE;
        this.size = size;
        this.fillColor = fillColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
    }

    getAbsolutePosition() {
        return {
            x: this.x - this.size / 2 - this.borderSize / 2,
            y: this.y - this.size / 2 - this.borderSize / 2,
        };
    }

    draw(canvas) {
        switch (this.type) {
            case Handle.TYPES.SQUARE:
                this.drawSquareHandle(canvas);
                break;
            case Handle.TYPES.DOT:
                this.drawDotHandle(canvas);
                break;
            case Handle.TYPES.DIRECTIONAL:
                this.drawDirectionalHandle(canvas);
                break;
            case Handle.TYPES.CROSS:
                this.drawCrossHandle(canvas);
                break;
            default:
                this.drawSquareHandle(canvas);
        }
    }

    /**
     * Draws a square handle on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle will be drawn.
     * @returns {void}
     */
    drawSquareHandle(canvas) {
        const absPos = this.getAbsolutePosition();

        canvas
            .setStrokeColor(this.borderColor)
            .setFillColor(this.fillColor)
            .setStrokeWidth(this.borderSize)
            .rectangle(
                absPos.x,
                absPos.y,
                this.size - this.borderSize,
                this.size - this.borderSize
            )
            .fill()
            .rectangle(absPos.x, absPos.y, this.size, this.size)
            .stroke()
            .restore();
    }

    /**
     * Draws a dot handle on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle will be drawn.
     * @returns {void}
     */
    drawDotHandle(canvas) {
        const absPos = this.getAbsolutePosition();

        canvas
            .setStrokeColor(this.borderColor)
            .setFillColor(this.fillColor)
            .setStrokeWidth(this.borderSize)
            .circle(
                absPos.x + this.size / 2,
                absPos.y + this.size / 2,
                (this.size - this.borderSize) / 2
            )
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Draws a directional handle (triangle) on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle will be drawn.
     * @returns {void}
     */
    drawDirectionalHandle(canvas) {
        const absPos = this.getAbsolutePosition();
        const centerX = absPos.x + this.size / 2;
        const centerY = absPos.y + this.size / 2;
        const halfSize = (this.size - this.borderSize) / 2;

        canvas
            .setStrokeColor(this.borderColor)
            .setFillColor(this.fillColor)
            .setStrokeWidth(this.borderSize)
            .line(
                centerX,
                centerY - halfSize,
                centerX - halfSize,
                centerY + halfSize
            )
            .line(
                centerX,
                centerY + halfSize,
                centerX + halfSize,
                centerY + halfSize
            )
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Draws a cross handle on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle will be drawn.
     * @returns {void}
     */
    drawCrossHandle(canvas) {
        const absPos = this.getAbsolutePosition();

        canvas
            .setStrokeColor(this.borderColor)
            .setStrokeWidth(this.borderSize)
            .line(
                absPos.x,
                absPos.y,
                absPos.x + this.size,
                absPos.y + this.size
            )
            .stroke()
            .line(
                absPos.x + this.size,
                absPos.y,
                absPos.x,
                absPos.y + this.size
            )
            .stroke()
            .restore();
    }
}

export default Handle;
