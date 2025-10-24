import Component from '../Component.js';

class Graphic extends Component {
    constructor(x, y, width = 60, height = 40) {
        // Exemplo de SVG para um display gráfico simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="50" height="30" rx="3" fill="#E6E6FA" stroke="black" stroke-width="1"/>
                <line x1="10" y1="10" x2="50" y2="30" stroke="gray" stroke-width="1"/>
                <line x1="10" y1="30" x2="50" y2="10" stroke="gray" stroke-width="1"/>
                <text x="30" y="25" font-family="Arial" font-size="10" text-anchor="middle" fill="black">LCD</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = 'Graphic Display';
        this.terminalsFollowTransform = true;
        // Adiciona terminais de exemplo
        this.addTerminal('data0', 0, height * 0.25);
        this.addTerminal('data1', 0, height * 0.75);
        this.addTerminal('vcc', width * 0.25, height);
        this.addTerminal('gnd', width * 0.75, height);
    }
}

export default Graphic;
