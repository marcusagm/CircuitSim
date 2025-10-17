import Shape from "./Shape.js";
import Handle from "../components/Handle.js";
import Canvas from "../core/Canvas.js";

class Point extends Shape {
    constructor(x, y, radius = 3) {
        super(x, y);

        this.isSelected = false; // Indica se a linha está selecionada para edição

        this.radius = radius;
        this.color = "#000000";
    }

    /**
     *
     * @param {Canvas} canvas
     */
    draw(canvas) {
        canvas
            .setStrokeColor("#000000")
            .setFillColor(this.color)
            .setStrokeWidth(1)
            .circle(this.x, this.y, this.radius)
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
        if (newProps.radius !== undefined) this.radius = newProps.radius;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        new Handle(this.x, this.y, Handle.TYPES.DOT).draw(canvas);
    }
}

export default Point;
