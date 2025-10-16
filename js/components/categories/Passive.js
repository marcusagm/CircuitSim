import Component from "../Component.js";

class Passive extends Component {
    constructor(x, y, width = 50, height = 20) {
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="10" x2="10" y2="10" stroke="black" stroke-width="2"/>
                <rect x="10" y="5" width="30" height="10" stroke="black" stroke-width="2" fill="#D3D3D3"/>
                <line x1="40" y1="10" x2="50" y2="10" stroke="black" stroke-width="2"/>
                <text x="25" y="14" font-family="Arial" font-size="8" text-anchor="middle" fill="black">R</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Passive";
        this.addTerminal("left", 0, height / 2);
        this.addTerminal("right", width, height / 2);
    }
}

export default Passive;
