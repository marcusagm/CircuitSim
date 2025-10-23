'use strict';

import Component from '../Component.js';

class Active extends Component {
    constructor(positionX, positionY, width = 50, height = 50) {
        // Exemplo de SVG para um transistor NPN simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 5 L25 45 M5 35 L25 35 M25 15 L45 15" stroke="black" stroke-width="2"/>
                <circle cx="25" cy="25" r="10" stroke="black" stroke-width="2" fill="white"/>
                <polygon points="25,10 20,15 30,15" fill="black" transform="rotate(180 25 12.5)"/>
                <text x="25" y="48" font-family="Arial" font-size="8" text-anchor="middle" fill="black">Q</text>
            </svg>
        `;
        super(positionX, positionY, width, height, svgContent);
        this.name = 'Active Component';

        this.terminalsFollowTransform = true;
        this.addTerminal('collector', width / 2, 0); // Top
        this.addTerminal('base', 0, height * 0.7); // Left
        this.addTerminal('emitter', width / 2, height); // Bottom
    }
}

export default Active;
