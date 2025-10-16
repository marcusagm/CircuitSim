class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "#000000";
        this.lineWidth = 1;
        this.isSelected = false;
    }

    draw(ctx) {
        // Método abstrato, deve ser implementado pelas subclasses
        throw new Error("Method 'draw()' must be implemented.");
    }

    isHit(x, y) {
        // Método abstrato, deve ser implementado pelas subclasses
        throw new Error("Method 'isHit()' must be implemented.");
    }

    // Métodos para seleção
    select() {
        this.isSelected = true;
    }

    deselect() {
        this.isSelected = false;
    }

    // Método para mover a forma
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    // Método abstrato para edição, a ser implementado pelas subclasses
    edit(newProps) {
        throw new Error("Method 'edit()' must be implemented.");
    }
}

export default Shape;
