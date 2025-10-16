import Handle from "./Handle.js";

class HandleBox {
    static TYPES = {
        SQUARE: "square", // Quadrado
        DOT: "dot", // Ponto simples
        DIRECTIONAL: "directional", // Para indicar direção de fluxo, como em diodos
        ANCHOR: "anchor", // Ponto de ancoragem para curvas
        CROSS: "cross" // Cruz para indicar pontos de interseção
    };

    constructor(x, y, width, height, parentComponent, showCenterHandles = true, borderSize = 1, borderColor = "#00ccffff", isDashed = true) {
        // 1177ddcc é um azul semi-transparente
        // 0055aacc é um azul mais escuro semi-transparente
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.parentComponent = parentComponent;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
        this.isDashed = isDashed;
        this.showCenterHandles = showCenterHandles;
    }

    getAbsolutePosition() {
        // Considera a posição do componente pai e sua rotação/inversão
        // Por enquanto, apenas a posição do componente pai
        return {
            x: this.x,
            y: this.y,
        };
    }

    draw(context) {
        const absPos = this.getAbsolutePosition();

        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderSize;
        if (this.isDashed) {
            context.setLineDash([5, 3]);
        } else {
            context.setLineDash([]);
        }
        context.strokeRect(absPos.x, absPos.y, this.width, this.height);
        context.setLineDash([]); // Reseta o dash para outros desenhos


        new Handle(this.x, this.y, Handle.TYPES.SQUARE).draw(context); // Top-left
        new Handle(this.x + this.width, this.y, Handle.TYPES.SQUARE).draw(context); // Top-right
        new Handle(this.x, this.y + this.height, Handle.TYPES.SQUARE).draw(context); // Bottom-left
        new Handle(this.x + this.width, this.y + this.height, Handle.TYPES.SQUARE).draw(context); // Bottom-right

        new Handle(this.x + this.width / 2, this.y, Handle.TYPES.DOT).draw(context); // Top-center
        new Handle(this.x + this.width / 2, this.y + this.height, Handle.TYPES.DOT).draw(context); // Bottom-center
        new Handle(this.x, this.y + this.height / 2, Handle.TYPES.DOT).draw(context); // Middle-left
        new Handle(this.x + this.width, this.y + this.height / 2, Handle.TYPES.DOT).draw(context); // Middle-right

        if (this.showCenterHandles) {
            new Handle(this.x + this.width / 2, this.y + this.height / 2, Handle.TYPES.CROSS).draw(context); // Center
        }
    }
}

export default HandleBox;
