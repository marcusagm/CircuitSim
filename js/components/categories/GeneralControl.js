import Component from '../Component.js';

class GeneralControl extends Component {
    constructor(x, y, width = 70, height = 70) {
        // Exemplo de SVG para um dial de controle (placeholder)
        const svgContent = `
            <svg width="${width}" height="${height}" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="35" r="30" stroke="black" stroke-width="2" fill="#D3D3D3"/>
                <line x1="35" y1="10" x2="35" y2="25" stroke="black" stroke-width="3"/>
                <text x="35" y="65" font-family="Arial" font-size="10" text-anchor="middle" fill="black">Dial</text>
            </svg>
        `;
        super(x, y, width, height, svgContent);
        this.name = "General Control";
        this.groupedComponents = []; // Array para armazenar componentes agrupados
    }

    // Método para adicionar um componente ao grupo
    addComponentToGroup(component) {
        if (!this.groupedComponents.includes(component)) {
            this.groupedComponents.push(component);
            console.log(`Componente ${component.name} adicionado ao grupo de ${this.name}`);
        }
    }

    // Método para remover um componente do grupo
    removeComponentFromGroup(component) {
        this.groupedComponents = this.groupedComponents.filter(c => c !== component);
        console.log(`Componente ${component.name} removido do grupo de ${this.name}`);
    }

    // Exemplo de método para controlar os componentes agrupados
    // Em uma simulação real, isso afetaria as propriedades dos componentes agrupados
    controlGroup(value) {
        console.log(`Controlando grupo com valor: ${value}`);
        this.groupedComponents.forEach(component => {
            // Lógica para aplicar o controle aos componentes agrupados
            // Ex: se for um potenciômetro, mudar seu valor de resistência
            // component.setValue(value);
        });
    }
}

export default GeneralControl;

