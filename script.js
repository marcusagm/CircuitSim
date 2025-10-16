import Canvas from "./js/core/Canvas.js";
import Grid from "./js/core/Grid.js";
import DrawingManager from "./js/core/DrawingManager.js";
import ToolManager from "./js/core/ToolManager.js";

// Importar as ferramentas de desenho
import LineTool from "./js/tools/LineTool.js";
import FreehandTool from "./js/tools/FreehandTool.js";
import PointTool from "./js/tools/PointTool.js";
import RectangleTool from "./js/tools/RectangleTool.js";
import CircleTool from "./js/tools/CircleTool.js";
import ThreePointCurveTool from "./js/tools/ThreePointCurveTool.js";
import BezierCurveTool from "./js/tools/BezierCurveTool.js";
import TextBoxTool from "./js/tools/TextBoxTool.js";
import ImageTool from "./js/tools/ImageTool.js";
import SVGTool from "./js/tools/SVGTool.js";

// Importar ferramentas de componente
import ComponentTool from "./js/tools/ComponentTool.js";
import Meter from "./js/components/categories/Meter.js";
import Source from "./js/components/categories/Source.js";
import Switch from "./js/components/categories/Switch.js";
import Passive from "./js/components/categories/Passive.js";
import Active from "./js/components/categories/Active.js";
import Output from "./js/components/categories/Output.js";
import Microcontroller from "./js/components/categories/Microcontroller.js";
import LogicGate from "./js/components/categories/Logic.js";
import Connector from "./js/components/categories/Connector.js";
import Graphic from "./js/components/categories/Graphic.js";
import GeneralControl from "./js/components/categories/GeneralControl.js";

// Importar ferramentas específicas de circuito
import WireTool from "./js/tools/WireTool.js";
import SelectTool from "./js/tools/SelectTool.js";
import MoveTool from "./js/tools/MoveTool.js";
import RotateFlipTool from "./js/tools/RotateFlipTool.js";
import DeleteTool from "./js/tools/DeleteTool.js";
import PropertiesTool from "./js/tools/PropertiesTool.js";
import NodeEditTool from "./js/tools/NodeEditTool.js"; // Importar a nova ferramenta

document.addEventListener("DOMContentLoaded", () => {
    const canvasElement = document.getElementById("circuitCanvas");
    const ctx = canvasElement.getContext("2d");
    const toolbar = document.getElementById("toolbar");

    const canvas = new Canvas(canvasElement, ctx);
    const grid = new Grid(canvas, 10); // 5x5px grid
    const drawingManager = new DrawingManager(canvas);
    const toolManager = new ToolManager(canvas, drawingManager);

    canvas.drawingManager = drawingManager; // Atribui o drawingManager ao canvas
    canvas.grid = grid; // Atribui a grid ao canvas

    // Ajusta o tamanho do canvas para preencher a janela
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.requestRender(); // Redesenha o canvas e a grid
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Chama no carregamento inicial

    // Sobrescreve o método draw do canvas para incluir a grid e os elementos do DrawingManager
    canvas.draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.draw();
        drawingManager.drawAll(ctx); // Desenha todos os elementos gerenciados
    };

    // Adicionar ferramentas ao ToolManager
    const selectTool = new SelectTool(canvas, drawingManager);
    const moveTool = new MoveTool(canvas, drawingManager);
    const rotateFlipTool = new RotateFlipTool(canvas, drawingManager);
    const deleteTool = new DeleteTool(canvas, drawingManager);
    const propertiesTool = new PropertiesTool(canvas, drawingManager);
    const nodeEditTool = new NodeEditTool(canvas, drawingManager); // Instanciar a nova ferramenta

    toolManager.addTool("select", selectTool);
    toolManager.addTool("move", moveTool);
    toolManager.addTool("rotateFlip", rotateFlipTool);
    toolManager.addTool("delete", deleteTool);
    toolManager.addTool("properties", propertiesTool);
    toolManager.addTool("nodeEdit", nodeEditTool); // Adicionar a nova ferramenta
    toolManager.addTool("line", new LineTool(canvas, drawingManager));
    toolManager.addTool("freehand", new FreehandTool(canvas, drawingManager));
    toolManager.addTool("point", new PointTool(canvas, drawingManager));
    toolManager.addTool("rectangle", new RectangleTool(canvas, drawingManager));
    toolManager.addTool("circle", new CircleTool(canvas, drawingManager));
    toolManager.addTool(
        "threePointCurve",
        new ThreePointCurveTool(canvas, drawingManager)
    );
    toolManager.addTool(
        "bezierCurve",
        new BezierCurveTool(canvas, drawingManager)
    );
    toolManager.addTool("textBox", new TextBoxTool(canvas, drawingManager));
    toolManager.addTool("image", new ImageTool(canvas, drawingManager));
    toolManager.addTool("svg", new SVGTool(canvas, drawingManager));

    // Adicionar ferramentas de componente
    toolManager.addTool(
        "meter",
        new ComponentTool(canvas, drawingManager, Meter, "Medidor")
    );
    toolManager.addTool(
        "source",
        new ComponentTool(canvas, drawingManager, Source, "Fonte")
    );
    toolManager.addTool(
        "switch",
        new ComponentTool(canvas, drawingManager, Switch, "Interruptor")
    );
    toolManager.addTool(
        "passive",
        new ComponentTool(canvas, drawingManager, Passive, "Passivo")
    );
    toolManager.addTool(
        "active",
        new ComponentTool(canvas, drawingManager, Active, "Ativo")
    );
    toolManager.addTool(
        "output",
        new ComponentTool(canvas, drawingManager, Output, "Saída")
    );
    toolManager.addTool(
        "microcontroller",
        new ComponentTool(
            canvas,
            drawingManager,
            Microcontroller,
            "Microcontrolador"
        )
    );
    toolManager.addTool(
        "logicGate",
        new ComponentTool(canvas, drawingManager, LogicGate, "Porta Lógica")
    );
    toolManager.addTool(
        "connector",
        new ComponentTool(canvas, drawingManager, Connector, "Conector")
    );
    toolManager.addTool(
        "graphic",
        new ComponentTool(canvas, drawingManager, Graphic, "Gráfico")
    );
    toolManager.addTool(
        "generalControl",
        new ComponentTool(
            canvas,
            drawingManager,
            GeneralControl,
            "Controle Geral"
        )
    );

    // Adicionar ferramenta de fio
    toolManager.addTool("wire", new WireTool(canvas, drawingManager));

    // Função para criar botões de ferramenta
    const createToolButton = (toolName, label, onClickAction = null) => {
        const button = document.createElement("button");
        button.textContent = label;
        button.title = label;
        button.addEventListener("click", () => {
            if (onClickAction) {
                onClickAction();
            } else {
                toolManager.setActiveTool(toolName);
                // Atualiza o estado visual dos botões
                Array.from(toolbar.children).forEach((btn) =>
                    btn.classList.remove("active")
                );
                button.classList.add("active");
            }
        });
        toolbar.appendChild(button);
        return button;
    };

    // Criar botões para as ferramentas de desenho
    createToolButton("select", "Selecionar");
    createToolButton("move", "Mover");
    createToolButton("line", "Linha Reta");
    createToolButton("freehand", "Linha Livre");
    createToolButton("point", "Ponto");
    createToolButton("threePointCurve", "Curva 3 Pontos");
    createToolButton("bezierCurve", "Curva Bezier");
    createToolButton("rectangle", "Retângulo");
    createToolButton("circle", "Círculo");
    createToolButton("textBox", "Caixa de Texto");
    createToolButton("image", "Adicionar Imagem");
    createToolButton("svg", "Adicionar SVG");

    // Criar botões para as ferramentas de componente
    createToolButton("meter", "Medidor");
    createToolButton("source", "Fonte");
    createToolButton("switch", "Interruptor");
    createToolButton("passive", "Passivo");
    createToolButton("active", "Ativo");
    createToolButton("output", "Saída");
    createToolButton("microcontroller", "Microcontrolador");
    createToolButton("logicGate", "Porta Lógica");
    createToolButton("connector", "Conector");
    createToolButton("graphic", "Gráfico");
    createToolButton("generalControl", "Controle Geral");

    // Criar botão para a ferramenta de fio
    createToolButton("wire", "Fio");

    // Botões para rotação e inversão (operam sobre elementos selecionados)
    createToolButton("rotate", "Rotacionar 90°", () =>
        rotateFlipTool.rotateSelected(90)
    );
    createToolButton("flipH", "Inverter H", () =>
        rotateFlipTool.flipSelectedHorizontal()
    );
    createToolButton("flipV", "Inverter V", () =>
        rotateFlipTool.flipSelectedVertical()
    );

    // Botão para a ferramenta de exclusão
    createToolButton("delete", "Excluir");

    // Botão para a ferramenta de propriedades
    createToolButton("properties", "Editar Propriedades");

    // Botão para a ferramenta de edição de nós
    createToolButton("nodeEdit", "Editar Nós do Fio");

    // Ativar a ferramenta de seleção por padrão
    toolManager.setActiveTool("select");
    toolbar.querySelector("button").classList.add("active");

    canvas.requestRender();
});
