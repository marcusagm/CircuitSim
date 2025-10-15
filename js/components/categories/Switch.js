import Component from '../Component.js';

class Switch extends Component {
    constructor(x, y, width = 50, height = 30) {
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="5" y1="15" x2="20" y2="15" stroke="black" stroke-width="2"/>
                <circle cx="20" cy="15" r="3" fill="black"/>
                <line x1="20" y1="15" x2="35" y2="5" stroke="black" stroke-width="2"/>
                <circle cx="35" cy="5" r="3" fill="black"/>
                <line x1="35" y1="15" x2="45" y2="15" stroke="black" stroke-width="2"/>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "Switch";
        this.addTerminal("in", 5, height / 2); // Terminal esquerdo
        this.addTerminal("out", width - 5, height / 2); // Terminal direito
    }
}

export default Switch;

