import Shape from './Shape.js';

class ThreePointCurve extends Shape {
    constructor(x1, y1, cx, cy, x2, y2) {
        super(x1, y1);
        this.x1 = x1;
        this.y1 = y1;
        this.cx = cx;
        this.cy = cy;
        this.x2 = x2;
        this.y2 = y2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.moveTo(this.x1, this.y1);
        ctx.quadraticCurveTo(this.cx, this.cy, this.x2, this.y2);
        ctx.stroke();

        if (this.isSelected) {
            this.drawSelectionHandles(ctx);
        }
    }

    isHit(x, y) {
        const minX = Math.min(this.x1, this.cx, this.x2);
        const maxX = Math.max(this.x1, this.cx, this.x2);
        const minY = Math.min(this.y1, this.cy, this.y2);
        const maxY = Math.max(this.y1, this.cy, this.y2);

        if (x >= minX - 5 && x <= maxX + 5 && y >= minY - 5 && y <= maxY + 5) {
            return true;
        }
        return false;
    }

    move(dx, dy) {
        super.move(dx, dy);
        this.x1 += dx;
        this.y1 += dy;
        this.cx += dx;
        this.cy += dy;
        this.x2 += dx;
        this.y2 += dy;
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined) this.lineWidth = newProps.lineWidth;
        if (newProps.x1 !== undefined) this.x1 = newProps.x1;
        if (newProps.y1 !== undefined) this.y1 = newProps.y1;
        if (newProps.cx !== undefined) this.cx = newProps.cx;
        if (newProps.cy !== undefined) this.cy = newProps.cy;
        if (newProps.x2 !== undefined) this.x2 = newProps.x2;
        if (newProps.y2 !== undefined) this.y2 = newProps.y2;
    }

    drawSelectionHandles(ctx) {
        const handleSize = 5;
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;

        ctx.fillRect(this.x1 - handleSize / 2, this.y1 - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(this.x1 - handleSize / 2, this.y1 - handleSize / 2, handleSize, handleSize);

        ctx.fillRect(this.cx - handleSize / 2, this.cy - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(this.cx - handleSize / 2, this.cy - handleSize / 2, handleSize, handleSize);

        ctx.fillRect(this.x2 - handleSize / 2, this.y2 - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(this.x2 - handleSize / 2, this.y2 - handleSize / 2, handleSize, handleSize);
    }
}

export default ThreePointCurve;

