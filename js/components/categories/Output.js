import Component from "../Component.js";

class Output extends Component {
    constructor(x, y, width = 40, height = 40) {
        // Exemplo de SVG para um LED simples (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="15" stroke="black" stroke-width="2" fill="#FF0000"/>
                <line x1="5" y1="20" x2="10" y2="20" stroke="black" stroke-width="2"/>
                <line x1="30" y1="20" x2="35" y2="20" stroke="black" stroke-width="2"/>
                <path d="M10 15 L5 10 M10 10 L5 15" stroke="gray" stroke-width="1"/>
                <path d="M15 20 L10 15 M15 15 L10 20" stroke="gray" stroke-width="1"/>
                <text x="20" y="25" font-family="Arial" font-size="10" text-anchor="middle" fill="white">LED</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Output";
        this.addTerminal("anode", 0, height / 2);
        this.addTerminal("cathode", width, height / 2);
    }
}

export default Output;
