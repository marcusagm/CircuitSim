// Ponto de ancoragem para curvas, com linhas de direção em ambos os lados, como as âncoras do Illustrator
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

    draw(context) {
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

        // Desenhar linhas de direção para controlar a curva (semelhante às âncoras do Illustrator)
        // Linhas seguindo a direçnao informada para a esquerda e direita da âncora com um pequeno círculo nas extremidades
        const leftDirection = { x: this.leftDirectionX, y: this.leftDirectionY };
        const rightDirection = { x: this.rightDirectionX, y: this.rightDirectionY };
        this.drawDirectionLine(context, absPos, leftDirection);
        this.drawDirectionLine(context, absPos, rightDirection);
    }

    drawDirectionLine(context, anchorPos, direction) {
        // Normalizar o vetor de direção
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (length === 0) return; // Evitar divisão por zero
        direction.x /= length;
        direction.y /= length;

        // Desenhar a linha de direção
        // A linha deve ter o comprimento correto que influencia a curva
        context.beginPath();
        context.moveTo(anchorPos.x + this.size / 2, anchorPos.y + this.size / 2);
        context.lineTo(anchorPos.x + this.size / 2 + direction.x * length, anchorPos.y + this.size / 2 + direction.y * length);
        context.strokeStyle = this.borderColor; // Cor cinza para as linhas de direção
        context.lineWidth = 1;
        context.stroke();

        // Círculo na extremidade da linha de direção
        const handleRadius = (this.size - this.borderSize) / 4;
        context.beginPath();
        context.arc(
            anchorPos.x + this.size / 2 + direction.x * length,
            anchorPos.y + this.size / 2 + direction.y * length,
            handleRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = this.fillColor;
        context.fill();
        context.strokeStyle = this.borderColor;
        context.lineWidth = 1;
        context.stroke();
    }
}

export default HandleAnchor;
