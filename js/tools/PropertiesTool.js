import Tool from "./Tool.js";

class PropertiesTool extends Tool {
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    onMouseDown(event) {
        const { x, y } = this.getMouseCoords(event);
        const clickedElement = this.drawingManager.findElementAt(x, y);

        if (clickedElement) {
            // Para simplificar, vamos usar um prompt para cada tipo de elemento
            // Em uma aplicação real, isso seria um painel de propriedades mais sofisticado
            if (clickedElement.constructor.name === "Line") {
                const newColor = prompt(
                    "Nova cor (ex: #FF0000 ou red):",
                    clickedElement.color
                );
                const newLineWidth = prompt(
                    "Nova espessura da linha:",
                    clickedElement.lineWidth
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
            } else if (clickedElement.constructor.name === "Freehand") {
                const newColor = prompt(
                    "Nova cor (ex: #FF0000 ou red):",
                    clickedElement.color
                );
                const newLineWidth = prompt(
                    "Nova espessura da linha:",
                    clickedElement.lineWidth
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
            } else if (clickedElement.constructor.name === "Point") {
                const newColor = prompt(
                    "Nova cor (ex: #FF0000 ou red):",
                    clickedElement.color
                );
                const newRadius = prompt(
                    "Novo raio do ponto:",
                    clickedElement.radius
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newRadius !== null)
                    clickedElement.edit({ radius: parseFloat(newRadius) });
            } else if (
                clickedElement.constructor.name === "ThreePointCurve" ||
                clickedElement.constructor.name === "BezierCurve"
            ) {
                const newColor = prompt(
                    "Nova cor (ex: #FF0000 ou red):",
                    clickedElement.color
                );
                const newLineWidth = prompt(
                    "Nova espessura da linha:",
                    clickedElement.lineWidth
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
            } else if (clickedElement.constructor.name === "Rectangle") {
                const newColor = prompt(
                    "Nova cor da borda:",
                    clickedElement.color
                );
                const newFillColor = prompt(
                    "Nova cor de preenchimento (deixe vazio para sem preenchimento):",
                    clickedElement.fillColor || ""
                );
                const newLineWidth = prompt(
                    "Nova espessura da linha:",
                    clickedElement.lineWidth
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newFillColor !== null)
                    clickedElement.edit({
                        fillColor: newFillColor === "" ? null : newFillColor,
                    });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
            } else if (clickedElement.constructor.name === "Circle") {
                const newColor = prompt(
                    "Nova cor da borda:",
                    clickedElement.color
                );
                const newFillColor = prompt(
                    "Nova cor de preenchimento (deixe vazio para sem preenchimento):",
                    clickedElement.fillColor || ""
                );
                const newLineWidth = prompt(
                    "Nova espessura da linha:",
                    clickedElement.lineWidth
                );
                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newFillColor !== null)
                    clickedElement.edit({
                        fillColor: newFillColor === "" ? null : newFillColor,
                    });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
            } else if (clickedElement.constructor.name === "TextBox") {
                const newText = prompt("Novo texto:", clickedElement.text);
                const newFontSize = prompt(
                    "Novo tamanho da fonte:",
                    clickedElement.fontSize
                );
                const newFontFamily = prompt(
                    "Nova família da fonte:",
                    clickedElement.fontFamily
                );
                const newColor = prompt(
                    "Nova cor do texto:",
                    clickedElement.color
                );
                if (newText !== null) clickedElement.edit({ text: newText });
                if (newFontSize !== null)
                    clickedElement.edit({ fontSize: parseFloat(newFontSize) });
                if (newFontFamily !== null)
                    clickedElement.edit({ fontFamily: newFontFamily });
                if (newColor !== null) clickedElement.edit({ color: newColor });
            } else if (clickedElement.constructor.name === "ImageShape") {
                const newImageUrl = prompt(
                    "Nova URL da imagem:",
                    clickedElement.imageUrl
                );
                if (newImageUrl !== null)
                    clickedElement.edit({ imageUrl: newImageUrl });
            } else if (clickedElement.constructor.name === "SVGDrawing") {
                const newSvgContent = prompt(
                    "Novo conteúdo SVG:",
                    clickedElement.svgContent
                );
                if (newSvgContent !== null)
                    clickedElement.edit({ svgContent: newSvgContent });
            } else if (clickedElement.constructor.name === "Wire") {
                const newColor = prompt(
                    "Nova cor do fio (ex: #FF0000 ou red):",
                    clickedElement.color
                );
                const newLineWidth = prompt(
                    "Nova espessura do fio:",
                    clickedElement.lineWidth
                );
                const newLineDashStr = prompt(
                    "Novo estilo de linha (ex: 5,5 para tracejado, vazio para contínuo):",
                    clickedElement.lineDash.join(",")
                );

                if (newColor !== null) clickedElement.edit({ color: newColor });
                if (newLineWidth !== null)
                    clickedElement.edit({
                        lineWidth: parseFloat(newLineWidth),
                    });
                if (newLineDashStr !== null) {
                    const newLineDash = newLineDashStr
                        .split(",")
                        .map((s) => parseFloat(s.trim()))
                        .filter((n) => !isNaN(n) && n > 0);
                    clickedElement.edit({ lineDash: newLineDash });
                }
                // Para edição de nós, seria necessário uma ferramenta mais interativa
                // ou um prompt para cada nó, o que não é prático aqui.
            }
            this.canvas.draw();
        }
    }

    onMouseMove(event) {}
    onMouseUp(event) {}
}

export default PropertiesTool;
