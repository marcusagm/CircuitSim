import Shape from "./Shape.js";

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
        const handleSize = 5;
        ctx.fillStyle = "blue";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;

        // Top-left
        ctx.fillRect(
            this.x - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            this.x - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        // Top-right
        ctx.fillRect(
            this.x + this.width - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            this.x + this.width - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        // Bottom-left
        ctx.fillRect(
            this.x - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            this.x - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
        // Bottom-right
        ctx.fillRect(
            this.x + this.width - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.strokeRect(
            this.x + this.width - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
    }
}

export default Rectangle;
