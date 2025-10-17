import Shape from "./Shape.js";
import Handle from "../components/Handle.js";
import Canvas from "../core/Canvas.js";

class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;

        this.isSelected = false; // Indica se a linha está selecionada para edição

        this.fillColor = "transparent"; // Cor de preenchimento
        this.color = "#000000"; // Cor do contorno
        this.lineWidth = 1; // Espessura do contorno
        this.lineDash = []; // Padrão de tracejado
        this.lineDashOffset = 0; // Deslocamento do tracejado
    }

    /**
     *
     * @param {Canvas} canvas
     */
    draw(canvas) {
        canvas
            .setStrokeColor(this.color)
            .setStrokeWidth(this.lineWidth)
            .setStrokeDash(this.lineDash)
            .setStrokeDashOffset(this.lineDashOffset)
            .setFillColor(this.fillColor)
            .rectangle(this.x, this.y, this.width, this.height)
            .fill()
            .stroke()
            .restore();

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }
    }

    isHit(x, y) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    move(dx, dy) {
        super.move(dx, dy);
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        if (newProps.lineDash !== undefined) this.lineDash = newProps.lineDash;
        if (newProps.lineDashOffset !== undefined)
            this.lineDashOffset = newProps.lineDashOffset;
        if (newProps.fillColor !== undefined)
            this.fillColor = newProps.fillColor;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.width !== undefined) this.width = newProps.width;
        if (newProps.height !== undefined) this.height = newProps.height;
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        new Handle(this.x, this.y, Handle.TYPES.SQUARE).draw(canvas); // Top-left
        new Handle(this.x + this.width, this.y, Handle.TYPES.SQUARE).draw(
            canvas
        ); // Top-right
        new Handle(this.x, this.y + this.height, Handle.TYPES.SQUARE).draw(
            canvas
        ); // Bottom-left
        new Handle(
            this.x + this.width,
            this.y + this.height,
            Handle.TYPES.SQUARE
        ).draw(canvas); // Bottom-right
        new Handle(this.x + this.width / 2, this.y, Handle.TYPES.DOT).draw(
            canvas
        ); // Top-center
        new Handle(
            this.x + this.width / 2,
            this.y + this.height,
            Handle.TYPES.DOT
        ).draw(canvas); // Bottom-center
        new Handle(this.x, this.y + this.height / 2, Handle.TYPES.DOT).draw(
            canvas
        ); // Middle-left
        new Handle(
            this.x + this.width,
            this.y + this.height / 2,
            Handle.TYPES.DOT
        ).draw(canvas); // Middle-right
        new Handle(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Handle.TYPES.CROSS
        ).draw(canvas); // Center
    }
}

export default Rectangle;
