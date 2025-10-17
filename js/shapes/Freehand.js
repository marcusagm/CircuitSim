import Shape from "./Shape.js";
import Handle from "../components/Handle.js";
import Canvas from "../core/Canvas.js";

class Freehand extends Shape {
    constructor() {
        super(0, 0); // Posição inicial não é relevante para linha livre, será ajustada pelos pontos
        this.points = [];

        this.isSelected = false; // Indica se a linha está selecionada para edição

        this.color = "#000000"; // Cor da linha
        this.lineWidth = 1; // Espessura da linha
        this.lineDash = []; // Padrão de tracejado
        this.lineDashOffset = 0; // Deslocamento do tracejado
        this.lineCap = "butt"; // Estilo da extremidade da linha: 'butt', 'round', 'square'
        this.lineJoin = "miter"; // Estilo da junção da linha: 'bevel', 'round', 'miter'
    }

    addPoint(x, y) {
        this.points.push({ x, y });
    }

    /**
     * Desenha a linha livre no contexto do canvas.
     * @param {Canvas} canvas - O objeto canvas onde a linha será desenhada.
     */
    draw(canvas) {
        if (this.points.length < 2) return;

        canvas
            .setStrokeColor(this.color)
            .setStrokeWidth(this.lineWidth)
            .setStrokeDash(this.lineDash)
            .setStrokeDashOffset(this.lineDashOffset)
            .setStrokeCap(this.lineCap)
            .setStrokeJoin(this.lineJoin);

        canvas.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            canvas.lineTo(this.points[i].x, this.points[i].y);
        }
        canvas.stroke().restore();

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }
    }

    isHit(x, y) {
        // Implementação simplificada: verifica a distância de cada segmento ao ponto
        // Pode ser otimizado para melhor precisão e performance
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];

            const L2 =
                (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
            if (L2 === 0) continue; // É um ponto

            const t =
                ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / L2;
            const projectionX = p1.x + t * (p2.x - p1.x);
            const projectionY = p1.y + t * (p2.y - p1.y);

            let distance;
            if (t < 0) {
                distance = Math.sqrt(
                    Math.pow(x - p1.x, 2) + Math.pow(y - p1.y, 2)
                );
            } else if (t > 1) {
                distance = Math.sqrt(
                    Math.pow(x - p2.x, 2) + Math.pow(y - p2.y, 2)
                );
            } else {
                distance = Math.sqrt(
                    Math.pow(x - projectionX, 2) + Math.pow(y - projectionY, 2)
                );
            }

            if (distance < this.lineWidth + 5) {
                return true;
            }
        }
        return false;
    }

    move(dx, dy) {
        this.points.forEach((p) => {
            p.x += dx;
            p.y += dy;
        });
    }

    edit(newProps) {
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.lineWidth !== undefined)
            this.lineWidth = newProps.lineWidth;
        // Para Freehand, a edição de pontos é mais complexa e geralmente feita via manipulação direta
        // ou substituição completa dos pontos. Por enquanto, apenas propriedades básicas.
        if (newProps.points !== undefined) this.points = newProps.points; // Permite substituir todos os pontos
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        if (this.points.length === 0) return;

        // Desenha handles nos pontos inicial e final
        const firstPoint = this.points[0];
        new Handle(firstPoint.x, firstPoint.y, Handle.TYPES.SQUARE).draw(
            canvas
        );

        const lastPoint = this.points[this.points.length - 1];
        new Handle(lastPoint.x, lastPoint.y, Handle.TYPES.SQUARE).draw(canvas);

        // Opcional: desenha um handle em cada ponto (pode ser poluído visualmente)
        this.points.forEach((p) => {
            new Handle(p.x, p.y, Handle.TYPES.DOT).draw(canvas);
        });
    }
}

export default Freehand;
