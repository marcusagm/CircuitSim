import Component from '../Component.js';

class Microcontroller extends Component {
    constructor(x, y, width = 80, height = 60) {
        // Exemplo de SVG para um microcontrolador simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="70" height="50" rx="5" fill="#E0FFFF" stroke="black" stroke-width="2"/>
                <text x="40" y="35" font-family="Arial" font-size="12" text-anchor="middle" fill="black">MCU</text>
                <circle cx="10" cy="15" r="2" fill="black"/>
                <circle cx="10" cy="25" r="2" fill="black"/>
                <circle cx="10" cy="35" r="2" fill="black"/>
                <circle cx="10" cy="45" r="2" fill="black"/>
                <circle cx="70" cy="15" r="2" fill="black"/>
                <circle cx="70" cy="25" r="2" fill="black"/>
                <circle cx="70" cy="35" r="2" fill="black"/>
                <circle cx="70" cy="45" r="2" fill="black"/>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Microcontroller";
        // Adiciona alguns terminais de exemplo
        this.addTerminal("P0", 5, 15);
        this.addTerminal("P1", 5, 25);
        this.addTerminal("P2", 5, 35);
        this.addTerminal("P3", 5, 45);
        this.addTerminal("P4", width - 5, 15);
        this.addTerminal("P5", width - 5, 25);
        this.addTerminal("P6", width - 5, 35);
        this.addTerminal("P7", width - 5, 45);
    }
}

export default Microcontroller;

