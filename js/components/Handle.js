class Handle {
    static TYPES = {
        SQUARE: "square", // Quadrado
        DOT: "dot", // Ponto simples
        DIRECTIONAL: "directional", // Para indicar direção de fluxo, como em diodos
        CROSS: "cross" // Cruz para indicar pontos de interseção
    };

    constructor(x, y, type, parentComponent, size = 10, fillColor = "#00ccff66", borderSize = 2, borderColor = "#00ccffff") {
        // 1177ddcc é um azul semi-transparente
        // 0055aacc é um azul mais escuro semi-transparente
        this.x = x;
        this.y = y;
        this.parentComponent = parentComponent;
        this.type = type || Handle.TYPES.SQUARE;
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

    draw(context) {
        switch (this.type) {
            case Handle.TYPES.SQUARE:
                this.drawSquareHandle(context);
                break;
            case Handle.TYPES.DOT:
                this.drawDotHandle(context);
                break;
            case Handle.TYPES.DIRECTIONAL:
                this.drawDirectionalHandle(context);
                break;
            case Handle.TYPES.CROSS:
                this.drawCrossHandle(context);
                break;
            default:
                this.drawSquareHandle(context);
        }
    }

    drawSquareHandle(context) {
        const absPos = this.getAbsolutePosition();
        context.fillStyle = this.fillColor;
        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderSize;

        context.fillRect(
            absPos.x,
            absPos.y,
            this.size - this.borderSize,
            this.size - this.borderSize
        );
        context.strokeRect(
            absPos.x,
            absPos.y,
            this.size,
            this.size
        );
    }

    drawDotHandle(context) {
        const absPos = this.getAbsolutePosition();
        context.beginPath();
        context.arc(
            absPos.x + this.size / 2,
            absPos.y + this.size / 2,
            (this.size - this.borderSize) / 2,
            0,
            Math.PI * 2
        );
        context.fillStyle = this.fillColor;
        context.fill();

        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderSize;
        context.stroke();
    }

    drawDirectionalHandle(context) {
        const absPos = this.getAbsolutePosition();
        const centerX = absPos.x + this.size / 2;
        const centerY = absPos.y + this.size / 2;
        const halfSize = (this.size - this.borderSize) / 2;

        context.fillStyle = this.fillColor;
        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderSize;

        context.beginPath();
        context.moveTo(centerX + halfSize, centerY);
        context.lineTo(centerX - halfSize, centerY - halfSize);
        context.lineTo(centerX - halfSize, centerY + halfSize);
        context.closePath();
        context.fill();
        context.stroke();
    }

    drawCrossHandle(context) {
        const absPos = this.getAbsolutePosition();
        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderSize;

        context.beginPath();
        context.moveTo(absPos.x, absPos.y);
        context.lineTo(absPos.x + this.size, absPos.y + this.size);
        context.moveTo(absPos.x + this.size, absPos.y);
        context.lineTo(absPos.x, absPos.y + this.size);
        context.stroke();
    }
}

export default Handle;
