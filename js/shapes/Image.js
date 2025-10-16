import Shape from "./Shape.js";

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
                this.drawingManager.canvas.draw();
            }
        };
        this.image.onerror = () => {
            console.error(`Erro ao carregar imagem: ${imageUrl}`);
        };
    }

    draw(ctx) {
        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }

        if (this.isSelected) {
            this.drawSelectionHandles(ctx);
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

    drawSelectionHandles(ctx) {
        if (!this.loaded) return;
        const handleSize = 5;
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Handles nos cantos
        ctx.fillStyle = "blue";
        ctx.fillRect(
            this.x - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.fillRect(
            this.x + this.width - handleSize / 2,
            this.y - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.fillRect(
            this.x - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
        ctx.fillRect(
            this.x + this.width - handleSize / 2,
            this.y + this.height - handleSize / 2,
            handleSize,
            handleSize
        );
    }
}

export default ImageShape;
