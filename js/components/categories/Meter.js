import Component from '../Component.js';

class Meter extends Component {
    constructor(x, y, width = 50, height = 50) {
        // Exemplo de SVG para um medidor simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="40" height="40" rx="5" fill="#ADD8E6" stroke="black" stroke-width="2"/>
                <circle cx="25" cy="25" r="15" fill="white" stroke="black" stroke-width="1"/>
                <line x1="25" y1="25" x2="35" y2="15" stroke="red" stroke-width="2"/>
                <text x="25" y="40" font-family="Arial" font-size="10" text-anchor="middle" fill="black">V</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Meter";
        // Adiciona terminais (exemplo: dois terminais para um voltímetro)
        this.addTerminal("in", 0, height / 2); // Terminal esquerdo
        this.addTerminal("out", width, height / 2); // Terminal direito
    }
}

export default Meter;

