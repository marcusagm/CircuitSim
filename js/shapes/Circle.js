import Handle from "../components/Handle.js";
import Shape from "./Shape.js";
import Canvas from "../core/Canvas.js";

class Circle extends Shape {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;

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
            .circle(this.x, this.y, this.radius)
            .stroke()
            .fill()
            .restore();

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }
    }

    isHit(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)
        );
        return distance < this.radius + 5; // Adiciona uma margem para facilitar o clique
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
        if (newProps.radius !== undefined) this.radius = newProps.radius;
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        new Handle(this.x, this.y, Handle.TYPES.CROSS).draw(canvas);
        new Handle(this.x + this.radius, this.y, Handle.TYPES.DOT).draw(canvas);
    }
}

export default Circle;
