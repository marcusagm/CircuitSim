import Handle from "../components/Handle.js";
import Shape from "./Shape.js";

class Circle extends Shape {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
        this.fillColor = null; // Pode ser preenchido ou não
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fill();
        }
        ctx.stroke();

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
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        if (newProps.fillColor !== undefined)
            this.fillColor = newProps.fillColor;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.radius !== undefined) this.radius = newProps.radius;
    }

    drawSelectionHandles(ctx) {
        new Handle(this.x, this.y, Handle.TYPES.CROSS).draw(ctx);
        new Handle(this.x + this.radius, this.y, Handle.TYPES.DOT).draw(ctx);
    }
}

export default Circle;
