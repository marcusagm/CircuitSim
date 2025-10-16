import Shape from "../shapes/Shape.js";
import Terminal from "./Terminal.js";

class Component extends Shape {
    constructor(x, y, width, height, svgContent = "") {
        super(x, y);
        this.width = width;
        this.height = height;
        this.terminals = []; // Array de objetos Terminal
        this.rotation = 0; // Rotação em graus
        this.flipH = false; // Inversão horizontal
        this.flipV = false; // Inversão vertical
        this.svgContent = svgContent;
        this.image = new Image();
        this.loaded = false;

        if (svgContent) {
            const svgBlob = new Blob([svgContent], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(svgBlob);
            this.image.src = url;

            this.image.onload = () => {
                this.loaded = true;
                // Se largura/altura não forem definidas, usa as dimensões intrínsecas do SVG
                if (this.width === 0) this.width = this.image.naturalWidth;
                if (this.height === 0) this.height = this.image.naturalHeight;
                // Redesenhar o canvas após o SVG carregar
                if (this.drawingManager && this.drawingManager.canvas) {
                    this.drawingManager.canvas.draw();
                }
                URL.revokeObjectURL(url); // Libera a URL de dados
            };
            this.image.onerror = () => {
                console.error(
                    `Erro ao carregar SVG para componente: ${svgContent.substring(
                        0,
                        50
                    )}...`
                );
                URL.revokeObjectURL(url); // Libera a URL de dados mesmo em caso de erro
            };
        }
    }

    addTerminal(id, x, y) {
        const terminal = new Terminal(id, x, y, this);
        this.terminals.push(terminal);
        return terminal;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.rotation !== 0) {
            ctx.rotate((this.rotation * Math.PI) / 180);
        }
        if (this.flipH) {
            ctx.scale(-1, 1);
        }
        if (this.flipV) {
            ctx.scale(1, -1);
        }
        ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

        if (this.loaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else if (!this.svgContent) {
            // Desenha um retângulo placeholder se não houver SVG e ainda não carregou
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "#000000";
            ctx.fillText("Component", this.x + 5, this.y + this.height / 2);
        }

        ctx.restore();

        // Desenha os terminais (sem transformações de rotação/flip do componente)
        this.terminals.forEach((terminal) => {
            terminal.draw(ctx);
        });

        if (this.isSelected) {
            this.drawSelectionHandles(ctx);
        }
    }

    isHit(x, y) {
        // Verifica se o ponto está dentro da caixa delimitadora do componente
        // TODO: Considerar rotação e flip para isHit mais preciso
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    move(dx, dy) {
        super.move(dx, dy);
        // Os terminais se movem junto com o componente, pois suas posições são relativas
    }

    rotate(angle) {
        this.rotation = (this.rotation + angle) % 360;
    }

    flipHorizontal() {
        this.flipH = !this.flipH;
    }

    flipVertical() {
        this.flipV = !this.flipV;
    }

    drawSelectionHandles(ctx) {
        const handleSize = 10;
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

export default Component;
