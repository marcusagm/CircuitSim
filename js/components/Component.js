import Shape from "../shapes/Shape.js";
import Terminal from "./Terminal.js";
import HandleBox from "./HandleBox.js";
import Canvas from "../core/Canvas.js";

/**
 * Classe Component - Representa um componente eletrônico com terminais, rotação, flip e SVG customizado.
 * Extende a classe Shape para herdar propriedades básicas de posição e desenho.
 */
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
                    this.drawingManager.canvas.requestRender();
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

    /**
     *
     * @param {Canvas} canvas
     */
    draw(canvas) {
        canvas.save();
        canvas.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.rotation !== 0) {
            canvas.rotate((this.rotation * Math.PI) / 180);
        }
        if (this.flipH) {
            canvas.scale(-1, 1);
        }
        if (this.flipV) {
            canvas.scale(1, -1);
        }
        canvas.translate(
            -(this.x + this.width / 2),
            -(this.y + this.height / 2)
        );

        if (this.loaded) {
            canvas.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else if (!this.svgContent) {
            // Desenha um retângulo placeholder se não houver SVG e ainda não carregou
            canvas
                .setStrokeColor(this.color)
                .setStrokeWidth(this.lineWidth)
                .setFillColor("#f0f0f0")
                .rectangle(this.x, this.y, this.width, this.height)
                .fill()
                .setFillColor("#000000")
                .fillText("Component", this.x + 5, this.y + this.height / 2);
        }

        canvas.restore();

        // Desenha os terminais (sem transformações de rotação/flip do componente)
        this.terminals.forEach((terminal) => {
            terminal.draw(canvas);
        });

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
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

    /**
     *
     * @param {Canvas} canvas
     */
    drawSelectionHandles(canvas) {
        new HandleBox(
            this.x,
            this.y,
            this.width,
            this.height,
            this,
            false
        ).draw(canvas);
    }
}

export default Component;
