import Shape from "./Shape.js";
import HandleAnchor from "../components/HandleAnchor.js";
import Canvas from "../core/Canvas.js";

class BezierCurve extends Shape {
    constructor(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
        super(x1, y1);
        this.x1 = x1;
        this.y1 = y1;
        this.cx1 = cx1;
        this.cy1 = cy1;
        this.cx2 = cx2;
        this.cy2 = cy2;
        this.x2 = x2;
        this.y2 = y2;

        this.isSelected = false; // Indica se a linha está selecionada para edição

        this.color = "#000000"; // Cor da linha
        this.lineWidth = 1; // Espessura da linha
        this.lineDash = []; // Padrão de tracejado
        this.lineDashOffset = 0; // Deslocamento do tracejado
        this.lineCap = "butt"; // Estilo da extremidade da linha: 'butt', 'round', 'square'
        this.lineJoin = "miter"; // Estilo da junção da linha: 'bevel', 'round', 'miter'
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
            .setStrokeCap(this.lineCap)
            .setStrokeJoin(this.lineJoin)
            .beginPath()
            .bezierCurveTo(
                this.x1,
                this.y1,
                this.cx1,
                this.cy1,
                this.cx2,
                this.cy2,
                this.x2,
                this.y2
            )
            .stroke()
            .restore();

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }
    }

    isHit(x, y) {
        const minX = Math.min(this.x1, this.cx1, this.cx2, this.x2);
        const maxX = Math.max(this.x1, this.cx1, this.cx2, this.x2);
        const minY = Math.min(this.y1, this.cy1, this.cy2, this.y2);
        const maxY = Math.max(this.y1, this.cy1, this.cy2, this.y2);

        if (x >= minX - 5 && x <= maxX + 5 && y >= minY - 5 && y <= maxY + 5) {
            return true;
        }
        return false;
    }

    move(dx, dy) {
        super.move(dx, dy);
        this.x1 += dx;
        this.y1 += dy;
        this.cx1 += dx;
        this.cy1 += dy;
        this.cx2 += dx;
        this.cy2 += dy;
        this.x2 += dx;
        this.y2 += dy;
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        if (newProps.lineDash !== undefined) this.lineDash = newProps.lineDash;
        if (newProps.lineDashOffset !== undefined)
            this.lineDashOffset = newProps.lineDashOffset;
        if (newProps.lineCap !== undefined) this.lineCap = newProps.lineCap;
        if (newProps.lineJoin !== undefined) this.lineJoin = newProps.lineJoin;
        if (newProps.x1 !== undefined) this.x1 = newProps.x1;
        if (newProps.y1 !== undefined) this.y1 = newProps.y1;
        if (newProps.cx1 !== undefined) this.cx1 = newProps.cx1;
        if (newProps.cy1 !== undefined) this.cy1 = newProps.cy1;
        if (newProps.cx2 !== undefined) this.cx2 = newProps.cx2;
        if (newProps.cy2 !== undefined) this.cy2 = newProps.cy2;
        if (newProps.x2 !== undefined) this.x2 = newProps.x2;
        if (newProps.y2 !== undefined) this.y2 = newProps.y2;
    }

    // Desenha Ancoras de edição da curva (4 pontos: início, controle 1, controle 2, fim)
    // Os pontos de controle são pontos com linhas de direção para controle da curva
    // O funcionamento é semelhante a ferramenta pen do Illustrator
    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        const handle1 = new HandleAnchor(
            this.x1,
            this.y1,
            this.cx1,
            this.cy1,
            this.cx2,
            this.cy2,
            canvas
        );
        const handle2 = new HandleAnchor(
            this.x2,
            this.y2,
            this.cx1,
            this.cy1,
            this.cx2,
            this.cy2,
            canvas
        );
        handle1.draw(canvas);
        handle2.draw(canvas);
    }
}

export default BezierCurve;
