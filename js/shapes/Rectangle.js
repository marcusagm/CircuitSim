import Shape from "./Shape.js";
import Handle from "../components/Handle.js";

class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.fillColor = null; // Pode ser preenchido ou não
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.rect(this.x, this.y, this.width, this.height);
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
        if (newProps.fillColor !== undefined)
            this.fillColor = newProps.fillColor;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.width !== undefined) this.width = newProps.width;
        if (newProps.height !== undefined) this.height = newProps.height;
    }

    drawSelectionHandles(ctx) {
        new Handle(this.x, this.y, Handle.TYPES.SQUARE).draw(ctx);  // Top-left
        new Handle(this.x + this.width, this.y, Handle.TYPES.SQUARE).draw(ctx); // Top-right
        new Handle(this.x, this.y + this.height, Handle.TYPES.SQUARE).draw(ctx); // Bottom-left
        new Handle(this.x + this.width, this.y + this.height, Handle.TYPES.SQUARE).draw(ctx); // Bottom-right
        new Handle(this.x + this.width / 2, this.y, Handle.TYPES.DOT).draw(ctx); // Top-center
        new Handle(this.x + this.width / 2, this.y + this.height, Handle.TYPES.DOT).draw(ctx); // Bottom-center
        new Handle(this.x, this.y + this.height / 2, Handle.TYPES.DOT).draw(ctx); // Middle-left
        new Handle(this.x + this.width, this.y + this.height / 2, Handle.TYPES.DOT).draw(ctx); // Middle-right
        new Handle(this.x + this.width / 2, this.y + this.height / 2, Handle.TYPES.CROSS).draw(ctx); // Center
    }
}

export default Rectangle;
