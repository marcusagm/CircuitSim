# Tasks

## Desenho

 - [ ] Permitir mesclagem de formas e linhas de desenho.
 - [ ] Ferramenta de snap na grid


### Linha Reta

 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [ ] Permitir tracejados
 - [ ] Deve permitir o desenho contínuo até que o desenho seja confirmado com o botão direito
 - [ ] Após confirmado, deve ser possivel editar cada posição das contas e conexões entre retas


### Linha Livre

 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [ ] Permitir tracejados


### Ponto

 - [ ] Permitir alterar cor
 - [ ] Permitir alterar tamanho


### Curva de 3 pontos

 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [ ] Permitir tracejados
 - [ ] Deve permitir a edição da curva atravês de anoras que podem ser reposicionadas


### Curva Bezier

 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [ ] Permitir tracejados
 - [ ] Deve permitir a edição da curva atravês de anoras que podem ser reposicionadas, assim como definir a curva em cada ancora atravês de duas alças, uma para cada lado da ancora


### Retângulo

 - [x] Permitir alterar cor da borda e preenchimento
 - [x] Permitir alterar espessura da borda
 - [ ] Permitir borda tracejada
 - [ ] Deve permitir redimencionar


### Círculo

 - [x] Permitir alterar cor da borda e preenchimento
 - [x] Permitir alterar espessura da borda
 - [ ] Permitir borda tracejada
 - [ ] Deve permitir redimencionar
 - [ ] Deve permitir alterar a altura ou lagura transformando em uma elipse


### Caixa de texto

 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [x] Permitir alterar tamanho da fonte
 - [x] Permitir alterar fonte
 - [ ] Deve permitir digitar o texto diretamente no canvas
 - [ ] A área da caixa de texto pode ser redimencionada


### Adicionar imagem

 - [x] Permitir carregar URL
 - [ ] Permitir carregar do computador
 - [ ] Permitir redimencionar


### Adicionar SVG

 - [x] Permitir carregar URL
 - [ ] Permitir carregar do computador
 - [ ] Permitir redimencionar


## Ferramentas básicas

 - [x] Permitir seleção de um ou mais elementos
 - [ ] Permitir fazer seleção de elementos definindo uma area ao clicar e arrastar o mouse
 - [x] Permitir mover elementos selecionados
 - [x] Permitir rotacionar elementos
 - [x] Permitir inverter horizontalmente componentes selecionados
 - [x] Permitir inverter verticalmente componentes selecionados
 - [x] Permitir excluir um elemento
 - [x] Permitir editar propriedades
 - [ ] Permitir copiar, colar e duplicar
 - [ ] Permitir agrupar e desagrupar
 - [ ] Permitir excluir um elemento ao clicar com o botão direito através do menu de contexto

## Fios

 - [x] Permitir editar nós do fio
 - [x] Permitir alterar cor
 - [x] Permitir alterar espessura
 - [x] Permitir fios tracejados
 - [ ] Um fio só pode iniciar e terminar em um terminal ou em um fio (ele mesmo ou outro já existente).
 - [ ] Permitir fazer conexões no meio do fio
 - [ ] Habilitar e desativar snap to grid
 - [ ] Permitir adicionar nós intermediarios para posicionalos quando for necessário, assim como deve permitir excluir nós.
 - [ ] Nós muito que estão na mesma posição devem ser unificados, ficando apenas um nó


## Terminais

 - [ ] Permitir conectar um terminal a outro diretamente


## Componentes

 - [ ] Criar padrões parâmetros de componentes
 - [ ] Permitir criar componentes novos atravês de arquivos JSON
 - [ ] Permitir criar desenhos e associar a componentes
 - [ ] Permitir criar cricuitos lógicos para componentes
 - [ ] Permitir executar um script e associar a um componente
 - [ ] Lista de componentes no projetos
 - [ ] Lista de componentes disponíveis
 - [ ] Busca na lista de componentes
 - [ ] Permitir nomear componentes
 - [ ] Permitir adicionar descrição
 - [ ] Permitir associar a uma documentações de auxilio de uso


## Interface

 - [ ] Salvar projeto
 - [ ] Abrir projeto
 - [ ] Possibilidade de multiplos canvas
 - [ ] Ferramenta de zoom no canvas (Zoom livre, Enquadra todos os componentes na tela, zoom para elementos selecionados, restuara zoom)
 - [ ] Ferramenta de pan (movimentar o canvas)
 - [ ] Tela de edição de propriedades
 - [ ] Permitir tradução da interface
 - [ ] Mostra ou omitir a grade
 - [ ] Mostra ou omitir barra de rolagem
 - [ ] Barra de descrição e auxilio com componentes
 - [ ] Temas


## Simulação

 - [ ] Animação da simulação
 - [ ] Tempo de atualização de tela
 - [ ] Definir velocidade da simulação
 - [ ] Painel de console
 - [ ] Painel com estatísticas de simulação ( Tempo de simulação, Velocidade configurada vs real, Uso de processamento, FPS)


## Aplicação

 - [x] Utilizar sistema de Handle componentizado
 - [x] Utilizar renderização incrmental no canvas usando requestAnimationFrame
 - [ ] Completar a classe canvas e verificar arquitetura e documentação
 - [ ] Utilizar electron
 - [ ] Sistema de atualização

### Atalhos

- [ ] Adicionar escopo para grupos de atalhos (ex: quando um modal estiver aberto, usar um conjunto diferente de atalhos)
- [ ] Adicionar suporte para atalhos sequenciais (ex: 'g' seguido de 'h' para ir para a home)
- [ ] Adicionar suporte para atalhos contextuais (ex: diferentes atalhos dependendo do foco do elemento)
- [ ] Adicionar suporte para atalhos que envolvem o clique do mouse (ex: Ctrl + clique)
- [ ] Adicionar suporte para atalhos que envolvem o scroll do mouse (ex: Ctrl + scroll)
- [ ] Adicionar suporte para atalhos que envolvem gestos de toque (ex: deslizar com três dedos)
- [ ] Adicionar suporte para atalhos que envolvem dispositivos de entrada alternativos (ex: caneta stylus, controladores de jogos)
- [ ] Adicionar suporte para atalhos que envolvem o estado da aplicação (ex: diferentes atalhos quando a aplicação está em modo de edição)

#### References

 - https://github.com/RobertWHurst/KeyboardJS
 - https://github.com/dmauro/Keypress/
 - https://github.com/madrobby/keymaster


## Outros

 - [ ] Auto backup
 - [ ] Permitir adicionar notas (bolões que podem ser posicionados no canvas e colapsados em um icone para omitir quando necessário)
 - [ ] Imprimir projeto


# Projetos de referência

## Circuits

- https://github.com/pfalstad/circuitjs1
- https://github.com/SimulIDE/SimulIDE
- https://github.com/logisim-evolution/logisim-evolution
- https://github.com/PySpice-org/PySpice
- https://github.com/SpiceSharp/SpiceSharp
- https://github.com/circuitsim/circuit-simulator
- https://github.com/ra4king/CircuitSim
- https://github.com/hneemann/Digital
- https://github.com/kazuhikoarase/simcirjs
- https://github.com/OpenCircuits/OpenCircuits
- https://github.com/drahnr/oregano

## Drawing

- https://github.com/pfalstad/canvas2svg
