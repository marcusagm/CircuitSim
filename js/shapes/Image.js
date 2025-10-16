import Shape from "./Shape.js";
import HandleBox from "../components/HandleBox.js";

class ImageShape extends Shape {
    constructor(x, y, imageUrl, width = 0, height = 0) {
        super(x, y);
        this.imageUrl = imageUrl;
        this.image = new Image();
        this.image.src = imageUrl;
        this.width = width;
        this.height = height;
        this.loaded = false;

        this.image.onload = () => {
            this.loaded = true;
            if (this.width === 0) this.width = this.image.naturalWidth;
            if (this.height === 0) this.height = this.image.naturalHeight;
            // Redesenhar o canvas após a imagem carregar
            if (this.drawingManager && this.drawingManager.canvas) {
                this.drawingManager.canvas.requestRender();
            }
        };
        this.image.onerror = () => {
            console.error(`Erro ao carregar imagem: ${imageUrl}`);
        };
    }

    draw(context) {
        if (this.loaded) {
            context.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }

        if (this.isSelected) {
            this.drawSelectionHandles(context);
        }
    }

    isHit(x, y) {
        if (!this.loaded) return false;
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
        if (newProps.imageUrl !== undefined) {
            this.imageUrl = newProps.imageUrl;
            this.loaded = false; // Força recarregamento
            this.image.src = newProps.imageUrl;
        }
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.width !== undefined) this.width = newProps.width;
        if (newProps.height !== undefined) this.height = newProps.height;
    }

    drawSelectionHandles(context) {
        if (!this.loaded) return;
        // Desenha a borda da caixa de seleção
        new HandleBox(this.x, this.y, this.width, this.height, this, true).draw(
            context
        );
    }
}

export default ImageShape;
