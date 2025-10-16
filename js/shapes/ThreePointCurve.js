import Shape from "./Shape.js";
import Handle from "../components/Handle.js";
import HandleAnchor from "../components/HandleAnchor.js";

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

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.moveTo(this.x1, this.y1);
        context.quadraticCurveTo(this.cx, this.cy, this.x2, this.y2);
        context.stroke();

        if (this.isSelected) {
            this.drawSelectionHandles(context);
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
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        if (newProps.x1 !== undefined) this.x1 = newProps.x1;
        if (newProps.y1 !== undefined) this.y1 = newProps.y1;
        if (newProps.cx !== undefined) this.cx = newProps.cx;
        if (newProps.cy !== undefined) this.cy = newProps.cy;
        if (newProps.x2 !== undefined) this.x2 = newProps.x2;
        if (newProps.y2 !== undefined) this.y2 = newProps.y2;
    }

    // Desenha Ancoras de edição da curva (3 pontos: início, controle, fim)
    // Cada âncora é um ponto com linhas de direção para controle da curva
    // Semelhante às âncoras do Illustrator
    drawSelectionHandles(context) {
        const handleSize = 8;
        const handleColor = "#00ccff66";
        const handleBorderColor = "#00ccffff";
        const handleBorderSize = 2;

        // Ponto inicial
        const startHandle = new Handle(
            this.x1,
            this.y1,
            Handle.TYPES.SQUARE,
            this,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        );
        startHandle.draw(context);

        // Ponto de controle
        const controlHandle = new HandleAnchor(
            this.cx,
            this.cy,
            (this.x1 - this.cx) / 2,
            (this.y1 - this.cy) / 2,
            (this.x2 - this.cx) / 2,
            (this.y2 - this.cy) / 2,
            this,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        );
        controlHandle.draw(context);

        // Ponto final
        const endHandle = new Handle(
            this.x2,
            this.y2,
            Handle.TYPES.SQUARE,
            this,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        );
        endHandle.draw(context);
    }
}

export default ThreePointCurve;
