class Terminal {
    constructor(id, x, y, parentComponent) {
        this.id = id;
        this.x = x; // Posição relativa ao componente
        this.y = y; // Posição relativa ao componente
        this.parentComponent = parentComponent;
        this.connectedWires = []; // Lista de fios conectados a este terminal
        this.radius = 4; // Raio para detecção de clique e desenho
        this.color = '#0000FF'; // Cor padrão do terminal
    }

    // Retorna a posição absoluta do terminal no canvas
    getAbsolutePosition() {
        // Considera a posição do componente pai e sua rotação/inversão
        // Por enquanto, apenas a posição do componente pai
        return {
            x: this.parentComponent.x + this.x,
            y: this.parentComponent.y + this.y
        };
    }

    draw(ctx) {
        const absPos = this.getAbsolutePosition();
        ctx.beginPath();
        ctx.arc(absPos.x, absPos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    isHit(x, y) {
        const absPos = this.getAbsolutePosition();
        const distance = Math.sqrt(Math.pow(x - absPos.x, 2) + Math.pow(y - absPos.y, 2));
        return distance < this.radius + 2; // Adiciona uma pequena margem
    }

    addWire(wire) {
        this.connectedWires.push(wire);
    }

    removeWire(wire) {
        this.connectedWires = this.connectedWires.filter(w => w !== wire);
    }
}

export default Terminal;

