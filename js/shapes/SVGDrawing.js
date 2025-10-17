import Shape from "./Shape.js";
import HandleBox from "../components/HandleBox.js";
import Canvas from "../core/Canvas.js";

class SVGDrawing extends Shape {
    constructor(x, y, svgContent, width = 0, height = 0) {
        super(x, y);
        this.svgContent = svgContent;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.loaded = false;

        this.isSelected = false; // Indica se a linha está selecionada para edição

        this.loadSVG();
    }

    loadSVG() {
        const svgBlob = new Blob([this.svgContent], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);
        this.image.src = url;

        this.image.onload = () => {
            this.loaded = true;
            if (this.width === 0) this.width = this.image.naturalWidth;
            if (this.height === 0) this.height = this.image.naturalHeight;
            if (this.drawingManager && this.drawingManager.canvas) {
                this.drawingManager.canvas.requestRender();
            }
            URL.revokeObjectURL(url);
        };
        this.image.onerror = () => {
            console.error(
                `Erro ao carregar SVG: ${this.svgContent.substring(0, 50)}...`
            );
            URL.revokeObjectURL(url);
        };
    }

    /**
     *
     * @param {Canvas} canvas
     */
    draw(canvas) {
        if (this.loaded) {
            canvas.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
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
        if (newProps.svgContent !== undefined) {
            this.svgContent = newProps.svgContent;
            this.loaded = false; // Força recarregamento
            this.loadSVG();
        }
        if (newProps.x !== undefined) this.x = newProps.x;
        if (newProps.y !== undefined) this.y = newProps.y;
        if (newProps.width !== undefined) this.width = newProps.width;
        if (newProps.height !== undefined) this.height = newProps.height;
    }

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        if (!this.loaded) return;
        // Desenha a borda da caixa de seleção
        new HandleBox(this.x, this.y, this.width, this.height, this, true).draw(
            canvas
        );
    }
}

export default SVGDrawing;
