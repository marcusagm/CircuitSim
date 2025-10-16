import Shape from "./Shape.js";
import HandleBox from "../components/HandleBox.js";

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
    }

    draw(context) {
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        context.fillStyle = this.color;
        context.textBaseline = "top"; // Alinha o texto ao topo da caixa
        context.fillText(this.text, this.x, this.y);

        // Calcula a largura do texto para a caixa delimitadora
        const metrics = context.measureText(this.text);
        this.width = metrics.width;

        if (this.isSelected) {
            this.drawSelectionHandles(context);
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

    drawSelectionHandles(context) {
        // Desenha a borda da caixa de seleção
        new HandleBox(
            this.x,
            this.y,
            this.width,
            this.height,
            this,
            false
        ).draw(context);
    }
}

export default TextBox;
