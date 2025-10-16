import Shape from "./Shape.js";
import Handle from "../components/Handle.js";

class Line extends Shape {
    constructor(x1, y1, x2, y2) {
        super(x1, y1);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        if (this.isSelected) {
            this.drawSelectionHandles(ctx);
        }
    }

    isHit(x, y) {
        // Implementação simplificada para verificação de clique na linha
        // Calcula a distância do ponto (x,y) à linha
        const L2 =
            (this.x2 - this.x1) * (this.x2 - this.x1) +
            (this.y2 - this.y1) * (this.y2 - this.y1);
        if (L2 === 0) return false; // É um ponto, não uma linha

        const t =
            ((x - this.x1) * (this.x2 - this.x1) +
                (y - this.y1) * (this.y2 - this.y1)) /
            L2;
        const projectionX = this.x1 + t * (this.x2 - this.x1);
        const projectionY = this.y1 + t * (this.y2 - this.y1);

        // Verifica se a projeção está dentro dos limites da linha
        if (t < 0 || t > 1) return false;

        const distance = Math.sqrt(
            Math.pow(x - projectionX, 2) + Math.pow(y - projectionY, 2)
        );
        return distance < this.lineWidth + 5; // Adiciona uma margem para facilitar o clique
    }

    move(dx, dy) {
        super.move(dx, dy);
        this.x1 += dx;
        this.y1 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        if (newProps.x1 !== undefined) this.x1 = newProps.x1;
        if (newProps.y1 !== undefined) this.y1 = newProps.y1;
        if (newProps.x2 !== undefined) this.x2 = newProps.x2;
        if (newProps.y2 !== undefined) this.y2 = newProps.y2;
    }

    drawSelectionHandles(ctx) {
        new Handle(this.x1, this.y1, Handle.TYPES.DOT).draw(ctx);
        new Handle(this.x2, this.y2, Handle.TYPES.DOT).draw(ctx);
    }
}

export default Line;
