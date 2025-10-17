/**
 * HandleAnchor representa um ponto de ancoragem com linhas de direção para controle de curvas.
 * Semelhante às âncoras do Adobe Illustrator, cada âncora possui linhas de direção que influenciam a curva.
 *
 * Propriedades:
 * - x, y: Coordenadas da âncora.
 * - leftDirectionX, leftDirectionY: Coordenadas da linha de direção esquerda.
 * - rightDirectionX, rightDirectionY: Coordenadas da linha de direção direita.
 * - parentComponent: Referência ao componente pai que utiliza esta âncora.
 * - size: Tamanho do círculo da âncora.
 * - fillColor: Cor de preenchimento do círculo da âncora.
 * - borderSize: Espessura da borda do círculo da âncora.
 * - borderColor: Cor da borda do círculo da âncora.
 *
 * Métodos:
 * - draw(canvas): Desenha a âncora e suas linhas de direção no contexto do canvas fornecido.
 * - drawDirectionLine(canvas, anchorPos, direction): Desenha uma linha de direção com um círculo na extremidade.
 *
 * Exemplo de uso:
 *
 * import Canvas from '../core/Canvas';
 * import HandleAnchor from './HandleAnchor';
 * const canvasInstance = new Canvas(document.getElementById('myCanvas'));
 * const handleAnchor = new HandleAnchor(100, 100, 50, 50, 150, 50, null);
 * handleAnchor.draw(canvasInstance);
 *
 * // Em um sistema de gerenciamento de desenho:
 *
 * import Canvas from '../core/Canvas';
 * import DrawingManager from '../core/DrawingManager';
 * import HandleAnchor from './HandleAnchor';
 *
 * const canvasInstance = new Canvas(document.getElementById('myCanvas'));
 * const drawingManager = new DrawingManager(canvasInstance);
 * const handleAnchor = new HandleAnchor(100, 100, 50, 50, 150, 50, null);
 * drawingManager.addElement(handleAnchor);
 * drawingManager.drawAll();
 *
 * // A classe DrawingManager gerencia múltiplos elementos desenháveis e solicita renderização incremental.
 *
 */
import Canvas from "../core/Canvas.js";

class HandleAnchor {

    constructor(x, y, leftDirectionX, leftDirectionY, rightDirectionX, rightDirectionY, parentComponent, size = 10, fillColor = "#00ccff66", borderSize = 2, borderColor = "#00ccffff") {
        // 1177ddcc é um azul semi-transparente
        // 0055aacc é um azul mais escuro semi-transparente
        this.x = x;
        this.y = y;
        this.leftDirectionX = leftDirectionX;
        this.leftDirectionY = leftDirectionY;
        this.rightDirectionX = rightDirectionX;
        this.rightDirectionY = rightDirectionY;
        this.parentComponent = parentComponent;
        this.size = size;
        this.fillColor = fillColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
    }

    getAbsolutePosition() {
        return {
            x: this.x - this.size / 2 - this.borderSize / 2,
            y: this.y - this.size / 2 - this.borderSize / 2,
        };
    }

    /**
     * Draws the anchor handle and its direction lines on the provided canvas context.
     * @param {Canvas} canvas - The canvas object where the handle will be drawn.
     * @returns {void}
     */
    draw(canvas) {
        const absPos = this.getAbsolutePosition();

        canvas
            .setStrokeColor(this.borderColor)
            .setFillColor(this.fillColor)
            .setStrokeWidth(this.borderSize)
            .circle(absPos.x + this.size / 2, absPos.y + this.size / 2, (this.size - this.borderSize) / 2)
            .fill()
            .stroke();

        // Desenhar linhas de direção para controlar a curva (semelhante às âncoras do Illustrator)
        // Linhas seguindo a direçnao informada para a esquerda e direita da âncora com um pequeno círculo nas extremidades
        const leftDirection = { x: this.leftDirectionX, y: this.leftDirectionY };
        const rightDirection = { x: this.rightDirectionX, y: this.rightDirectionY };
        this.drawDirectionLine(canvas, absPos, leftDirection);
        this.drawDirectionLine(canvas, absPos, rightDirection);
    }

    /**
     * Draws a direction line with a handle at the end.
     * @param {Canvas} canvas - The canvas object where the line will be drawn.
     * @param {Object} anchorPos - The absolute position of the anchor {x, y}.
     * @param {Object} direction - The direction vector {x, y}.
     * @returns {void}
     */
    drawDirectionLine(canvas, anchorPos, direction) {
        // Normalizar o vetor de direção
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (length === 0) return; // Evitar divisão por zero
        direction.x /= length;
        direction.y /= length;

        // Desenhar a linha de direção
        // A linha deve ter o comprimento correto que influencia a curva
        canvas
            .setStrokeColor(this.borderColor)
            .setStrokeWidth(1)
            .line(
                anchorPos.x + this.size / 2,
                anchorPos.y + this.size / 2,
                anchorPos.x + this.size / 2 + direction.x * length,
                anchorPos.y + this.size / 2 + direction.y * length
            )
            .stroke();

        // Círculo na extremidade da linha de direção
        const handleRadius = (this.size - this.borderSize) / 4;

        canvas
            .setFillColor(this.fillColor)
            .setStrokeColor(this.borderColor)
            .setStrokeWidth(1)
            .circle(
                anchorPos.x + this.size / 2 + direction.x * length,
                anchorPos.y + this.size / 2 + direction.y * length,
                handleRadius
            )
            .fill()
            .stroke()
            .restore();
    }
}

export default HandleAnchor;
