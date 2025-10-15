import Shape from './Shape.js';

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
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        return distance < (this.radius + 5); // Adiciona uma margem para facilitar o clique
    }

    move(dx, dy) {
        super.move(dx, dy);
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined) this.lineWidth = newProps.lineWidth;
        if (newProps.fillColor !== undefined) this.fillColor = newProps.fillColor;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.radius !== undefined) this.radius = newProps.radius;
    }

    drawSelectionHandles(ctx) {
        const handleSize = 5;
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;

        // Handle no centro
        ctx.fillRect(this.x - handleSize / 2, this.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(this.x - handleSize / 2, this.y - handleSize / 2, handleSize, handleSize);

        // Handle na borda (para redimensionar)
        ctx.fillRect(this.x + this.radius - handleSize / 2, this.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(this.x + this.radius - handleSize / 2, this.y - handleSize / 2, handleSize, handleSize);
    }
}

export default Circle;

