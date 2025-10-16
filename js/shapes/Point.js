import Shape from "./Shape.js";
import Handle from "../components/Handle.js";

class Point extends Shape {
    constructor(x, y, radius = 3) {
        super(x, y);
        this.radius = radius;
        this.color = "#000000";
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.isSelected) {
            this.drawSelectionHandles(ctx);
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

    drawSelectionHandles(ctx) {
        new Handle(this.x, this.y, Handle.TYPES.DOT).draw(ctx);
    }
}

export default Point;
