import Shape from "./Shape.js";
import HandleBox from "../components/HandleBox.js";
import Canvas from "../core/Canvas.js";

class TextBox extends Shape {
    constructor(
        x,
        y,
        text = "",
        fontSize = 16,
        fontFamily = "Arial",
        color = "#000000"
    ) {
        super(x, y);
        this.text = text;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
        this.width = 0; // Será calculado na renderização
        this.height = fontSize; // Altura inicial baseada no tamanho da fonte
        this.textBaseline = "top";
        this.textAlign = "left";
        this.textRendering = "auto";
        this.wordSpacing = "0px";
        this.direction = "ltr";
    }

    /**
     *
     * @param {Canvas} canvas
     */
    draw(canvas) {
        canvas
            .setFont(this.fontSize + "px " + this.fontFamily)
            .setFillColor(this.color)
            .setTextBaseline(this.textBaseline)
            .setTextAlign(this.textAlign)
            .setDirection(this.direction)
            .setTextRendering(this.textRendering)
            .setWordSpacing(this.wordSpacing)
            .fillText(this.text, this.x, this.y)
            .restore();

        // Calcula a largura do texto para a caixa delimitadora
        const metrics = canvas.measureText(this.text);
        this.width = metrics.width;

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }
    }

    isHit(x, y) {
        // Verifica se o ponto está dentro da caixa delimitadora do texto
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
        if (newProps.text !== undefined) this.text = newProps.text;
        if (newProps.fontSize !== undefined) this.fontSize = newProps.fontSize;
        if (newProps.fontFamily !== undefined)
            this.fontFamily = newProps.fontFamily;
        if (newProps.color !== undefined) this.color = newProps.color;
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        // Desenha a borda da caixa de seleção
        new HandleBox(
            this.x,
            this.y,
            this.width,
            this.height,
            this,
            false
        ).draw(canvas);
    }
}

export default TextBox;
