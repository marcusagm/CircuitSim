import Component from '../Component.js';

class Source extends Component {
    constructor(x, y, width = 50, height = 50) {
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="20" stroke="black" stroke-width="2" fill="#FFFF00"/>
                <line x1="25" y1="5" x2="25" y2="45" stroke="black" stroke-width="2"/>
                <line x1="5" y1="25" x2="45" y2="25" stroke="black" stroke-width="2"/>
                <text x="25" y="30" font-family="Arial" font-size="12" text-anchor="middle" fill="black">V</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Source";
        this.addTerminal("pos", width / 2, 0); // Terminal superior
        this.addTerminal("neg", width / 2, height); // Terminal inferior
    }
}

export default Source;

