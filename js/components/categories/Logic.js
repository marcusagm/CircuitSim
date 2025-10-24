import Component from '../Component.js';

class LogicGate extends Component {
    constructor(x, y, width = 60, height = 40) {
        // Exemplo de SVG para uma porta AND simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10 L20 10 L20 30 L5 30 L5 10 Z" stroke="black" stroke-width="2" fill="#DDA0DD"/>
                <path d="M20 10 A20 20 0 0 1 20 30" stroke="black" stroke-width="2" fill="#DDA0DD"/>
                <line x1="0" y1="15" x2="5" y2="15" stroke="black" stroke-width="2"/>
                <line x1="0" y1="25" x2="5" y2="25" stroke="black" stroke-width="2"/>
                <line x1="40" y1="20" x2="60" y2="20" stroke="black" stroke-width="2"/>
                <text x="25" y="25" font-family="Arial" font-size="10" text-anchor="middle" fill="black">AND</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = 'Logic Gate';
        this.terminalsFollowTransform = true;
        this.addTerminal('in1', 0, height * 0.375);
        this.addTerminal('in2', 0, height * 0.625);
        this.addTerminal('out', width, height / 2);
    }
}

export default LogicGate;
