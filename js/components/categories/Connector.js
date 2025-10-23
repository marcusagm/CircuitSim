'use strict';

import Component from '../Component.js';

class Connector extends Component {
    constructor(x, y, width = 30, height = 30) {
        // Exemplo de SVG para um conector de 2 pinos (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="20" height="20" rx="3" fill="#C0C0C0" stroke="black" stroke-width="1"/>
                <circle cx="10" cy="15" r="3" fill="black"/>
                <circle cx="20" cy="15" r="3" fill="black"/>
                <line x1="0" y1="15" x2="7" y2="15" stroke="black" stroke-width="1"/>
                <line x1="23" y1="15" x2="30" y2="15" stroke="black" stroke-width="1"/>
                <text x="15" y="27" font-family="Arial" font-size="8" text-anchor="middle" fill="black">J1</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = 'Connector';
        this.terminalsFollowTransform = true;
        this.addTerminal('pin1', 0, height / 2);
        this.addTerminal('pin2', width, height / 2);
    }
}

export default Connector;
