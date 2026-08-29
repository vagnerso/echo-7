# Registro de Decisões Técnicas — ECHO-7

Este documento existe para que qualquer pessoa lendo o repositório (incluindo o próprio autor, no futuro) entenda não só o que foi construído, mas por que cada escolha técnica foi feita e quais alternativas foram descartadas.

Cada entrada segue o formato: contexto, decisão, alternativas consideradas, motivo.

---

## Fase 0 — Arquitetura

### Câmera: 2D top-down, não isométrico

**Contexto:** o jogo permitia tanto câmera top-down quanto 2.5D/isométrica.

**Decisão:** top-down 2D puro.

**Alternativas consideradas:** isométrico/2.5D.

**Motivo:** isométrico exige depth-sorting de sprites, tiles em formato diamante e mais trabalho de arte, sem adicionar mecânica nova ao jogo. Para um MVP de 15-30 minutos desenvolvido por uma pessoa com apoio de IA, top-down maximiza velocidade de desenvolvimento sem sacrificar legibilidade. Pode ser revisitado após o MVP.

### Posição do jogador fora do Zustand

**Contexto:** o estado do jogo precisa ser compartilhado entre a engine (Canvas) e a UI (React/HUD).

**Decisão:** dados de alta frequência (posição, velocidade, frame de animação) vivem dentro da engine, como estado mutável comum, fora de qualquer store do Zustand. O Zustand só recebe snapshots discretos (item coletado, energia cruzou um limiar, região mudou).

**Alternativas consideradas:** manter todo o estado do jogo, incluindo posição, dentro do Zustand.

**Motivo:** Zustand notifica os componentes React inscritos a cada `set()`. Posição muda a cada frame (potencialmente 60x por segundo); se ficasse no Zustand, ou aceitaríamos re-renderizações do React a 60fps (o próprio prompt mestre do projeto pede para evitar isso), ou complicaríamos o código com seletores e memoização espalhados só para compensar. Manter esse dado fora do React resolve o problema na raiz.

### TypeScript em todo o projeto

**Contexto:** a concepção inicial do projeto sugeria evitar TypeScript para simplificar o início.

**Decisão:** usar TypeScript (`strict: true`) desde o começo, a pedido do desenvolvedor.

**Motivo:** troca deliberada feita pelo desenvolvedor, priorizando segurança de tipos e servindo também ao objetivo pessoal de evoluir conhecimento de arquitetura — tipos explícitos tornam os contratos entre `engine/`, `systems/` e `state/` mais claros de estudar depois.

### CSS Modules em vez de uma lib de CSS

**Contexto:** o projeto precisa de estilos para HUD, menus e overlays com estética sci-fi bem customizada.

**Decisão:** CSS Modules (nativo no Vite, sem dependência nova).

**Alternativas consideradas:** Tailwind CSS, styled-components/emotion (CSS-in-JS).

**Motivo:** CSS Modules dá escopo por componente sem adicionar dependência nem custo de runtime. Tailwind foi considerado uma alternativa válida (também zero-runtime), mas CSS puro dá mais controle fino para uma interface muito customizada (glow, scanlines, bordas técnicas) sem lutar contra um sistema de utilities. CSS-in-JS foi descartado por adicionar overhead de runtime, relevante justamente no código que mais roda durante o gameplay.

---

## Fase 1.1 — Setup do projeto

### oxlint em vez de ESLint

**Contexto:** o scaffold oficial mais recente do Vite (`create-vite`, template `react-ts`) já vem configurado com oxlint, um linter escrito em Rust, em vez do tradicional ESLint.

**Decisão:** manter oxlint como veio no template.

**Motivo:** ele já cobre as regras que precisamos agora (regras de hooks do React) e é significativamente mais rápido. Trocar por ESLint exigiria adicionar uma dependência mais pesada sem ganho concreto para o estágio atual do projeto — o que vai contra a regra do próprio prompt mestre de não adicionar dependência sem justificar.

### `strict: true` explícito no tsconfig

**Contexto:** o scaffold gerado não ativa o modo estrito do TypeScript por padrão — o "linting" de tipos dele vem apenas de `noUnusedLocals`/`noUnusedParameters`, não do strict mode completo.

**Decisão:** adicionar `"strict": true` manualmente em `tsconfig.app.json` e `tsconfig.node.json`.

**Motivo:** já era uma decisão de arquitetura aprovada na Fase 0; o scaffold sozinho não entregava isso.

### Prettier e Vitest adicionados por cima do scaffold

**Contexto:** o scaffold não inclui formatador de código nem test runner.

**Decisão:** adicionar as duas dependências.

**Motivo:** Prettier cobre a exigência de "formatação básica" do roadmap; Vitest é pré-requisito de infraestrutura já nesta fase porque a Fase 1.3 (game loop testável) e toda a seção de testes do prompt mestre dependem dele existir configurado.

### Configuração do Vitest unificada em `vite.config.ts`

**Contexto:** era possível criar um arquivo `vitest.config.ts` separado.

**Decisão:** usar `import { defineConfig } from 'vitest/config'` dentro do `vite.config.ts` já existente, com um bloco `test`.

**Motivo:** é o padrão recomendado pelo próprio Vitest quando já existe um `vite.config.ts` — evita duplicar configuração de build em dois arquivos.

### Alias de import `@/` para `src/`

**Contexto:** a estrutura de pastas planejada (`components/`, `engine/`, `systems/`, `entities/`, `world/`, `content/`, `state/`, `save/`, `hooks/`, `utils/`) vai gerar imports entre pastas distantes entre si.

**Decisão:** configurar `@/*` apontando para `src/*`, tanto no `tsconfig.app.json` (`compilerOptions.paths`) quanto no `vite.config.ts` (`resolve.alias`) — os dois precisam ser configurados porque resolvem contextos diferentes: um para checagem de tipos, outro para o bundler em tempo de build/dev.

**Alternativas consideradas:** manter apenas imports relativos.

**Motivo:** evita caminhos como `../../../engine/GameLoop` e torna mover um arquivo de pasta uma operação que não quebra imports em cascata. Custo de configuração é baixo e único (feito uma vez, na Fase 1).

**Nota lateral:** ao configurar, o TypeScript 6 já não aceita mais `baseUrl` (opção depreciada, será removida na v7) — `paths` agora resolve relativo à localização do próprio `tsconfig.json`, usando entradas com `./` explícito (`"./src/*"`).

### Nomenclatura de arquivo: PascalCase para componentes, camelCase para o resto

**Decisão:** componentes React em PascalCase (`HUD.tsx`, `ScannerOverlay.tsx`); módulos de engine/sistemas/estado/conteúdo em camelCase (`gameLoop.ts`, `movementSystem.ts`, `gameStore.ts`).

**Motivo:** é a convenção mais comum no ecossistema React/TS — componente é uma "entidade" nomeada como classe/tipo, o resto é módulo utilitário nomeado como valor. Facilita reconhecer, só pelo nome do arquivo, se algo é uma peça de UI ou de lógica de jogo.

### Testes ao lado do código

**Decisão:** `arquivo.ts` e `arquivo.test.ts` na mesma pasta, em vez de uma pasta `__tests__/` separada.

**Motivo:** facilita ver de imediato, ao abrir uma pasta, o que já tem teste e o que não tem — relevante porque a seção de testes do prompt mestre prioriza cobertura da lógica de jogo (`engine/`, `systems/`), e queremos que a ausência de teste salte aos olhos.

### Conventional Commits

**Decisão:** mensagens de commit no formato `tipo(escopo): descrição`, com `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, referenciando a fase do roadmap quando fizer sentido.

**Motivo:** o projeto será publicado no GitHub com intenção de ser apresentável profissionalmente (seção 26 do prompt mestre); Conventional Commits é um padrão amplamente reconhecido, gera histórico legível e facilita futuramente gerar um changelog automatizado, se quisermos.

### Verificação visual com Playwright avulso (não é dependência do projeto)

**Contexto:** mudanças visuais (canvas, HUD, telas) precisam ser conferidas rodando de fato no navegador, não só validadas por build/lint/teste.

**Decisão:** usar `npx playwright` pontualmente para abrir a aplicação num Chromium headless, tirar screenshots em tamanhos de viewport diferentes e checar o console por erros — sem adicionar Playwright como dependência do `package.json`.

**Motivo:** é uma ferramenta de verificação do processo de desenvolvimento (equivalente a "eu olhei no navegador"), não algo que o projeto em si precisa para rodar ou para os testes automatizados. Adicionar como dependência permanente seria escopo desnecessário no `package.json` para algo usado sob demanda.

## Fase 1.3 — Game loop

### Separação update/render com timestep fixo e alpha de interpolação

**Contexto:** o game loop podia simplesmente rodar toda a lógica dentro do callback do `requestAnimationFrame`.

**Decisão:** separar em dois callbacks — `update(dt)`, chamado zero ou mais vezes por frame em incrementos de tempo sempre iguais (o "passo fixo"), e `render(alpha)`, chamado uma vez por frame, recebendo a fração (0-1) do próximo passo já decorrida.

**Motivo:** se a simulação rodasse direto atrelada ao rAF, o resultado dependeria da taxa de atualização da tela do jogador (60Hz, 144Hz, um notebook que cai para 30Hz sob carga...) — o jogo ficaria mais rápido ou mais lento dependendo do hardware. Com passo fixo, a simulação sempre avança em incrementos do mesmo tamanho. O `alpha` existe para não perder suavidade visual: quando o `render` acontece entre dois passos fixos, ele interpola a posição entre o estado anterior e o atual em vez de "pular" para a posição do último passo. É um padrão clássico de game loop (fixed timestep with interpolation), não uma invenção deste projeto.

### Dependências do `GameLoop` injetáveis (`now`, `requestFrame`, `cancelFrame`)

**Contexto:** o roadmap pedia explicitamente um game loop "testável sem browser".

**Decisão:** `GameLoop` recebe `now`, `requestFrame` e `cancelFrame` como opções, com `performance.now`/`requestAnimationFrame`/`cancelAnimationFrame` reais como padrão.

**Motivo:** nos testes, essas três dependências são substituídas por versões falsas controladas manualmente pelo teste (um "scheduler" que só dispara o próximo frame quando o teste mandar, com o tempo que o teste escolher) — isso permite testar determinística e instantaneamente comportamento que dependeria de tempo real e do navegador. A matemática do timestep em si (`advanceAccumulator`) nem precisa dessa injeção: é uma função pura, sem estado, testável diretamente.

### `erasableSyntaxOnly` proíbe "parameter properties" do TypeScript

**Contexto:** o atalho `constructor(private readonly callbacks: X)` (que declara e atribui o campo da classe automaticamente) quebrou o build com `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled`.

**Decisão:** declarar o campo explicitamente na classe e atribuir no corpo do construtor, em vez de usar o atalho.

**Motivo:** o build usa esbuild (via Vite) para transpilar TypeScript, que só *apaga* tipos — não entende açúcares sintáticos do TS que precisam gerar código extra em tempo de execução, como parameter properties ou enums com valor. `erasableSyntaxOnly` (que já tínhamos ativado, dentro do bloco de linting do tsconfig gerado pelo scaffold) existe para pegar esse tipo de incompatibilidade em tempo de type-check, antes de chegar no build.

### Não mutar refs do React durante o render

**Contexto:** o oxlint acusou `callbacksRef.current = callbacks` (atribuído direto no corpo da função do hook, fora de qualquer efeito) com o aviso `react(refs): Cannot access refs during render`.

**Decisão:** mover essa atribuição para dentro de um `useEffect` sem array de dependências (roda depois de todo render).

**Motivo:** o React pode chamar a função de um componente mais de uma vez para um único render "confirmado" (Strict Mode, renders interrompidos em modo concorrente). Mutar uma ref direto no corpo da função soma esse risco de inconsistência. Fazer a mutação dentro de um efeito garante que ela só acontece depois que o render foi de fato confirmado.

## Fase 1.4 — Tela inicial

### CONTINUE e SETTINGS desabilitados, não escondidos nem falsos

**Contexto:** o mockup do prompt mestre (seção 22) mostra os três botões (NEW GAME, CONTINUE, SETTINGS), mas ainda não existe save system nem tela de configurações implementados.

**Decisão:** renderizar os três botões, mas `CONTINUE` (quando não há save) e `SETTINGS` ficam com `disabled` e um `title` explicando o motivo.

**Alternativas consideradas:** esconder os botões que ainda não funcionam; deixá-los clicáveis sem fazer nada.

**Motivo:** esconder muda o layout do mockup aprovado sem necessidade — o botão devia aparecer, só não fazer nada ainda. Deixar clicável sem ação é pior: engana o jogador, que clica e não entende por que nada acontece. Desabilitado com motivo explícito no `title` é a opção honesta, e o código já fica pronto para reativar (`hasSave` já é uma prop, será alimentada pelo save system real na Fase 8).

### Transição menu/jogo em `useState`, não no `uiStore` do Zustand

**Contexto:** a arquitetura da Fase 0 já previa um `uiStore` no Zustand cobrindo "menu aberto" como um dos exemplos de estado de UI.

**Decisão:** por enquanto, qual tela mostrar (`menu` ou `game`) fica em `useState` dentro do `App.tsx`, não no Zustand.

**Motivo:** Zustand resolve o problema de compartilhar estado entre componentes que não têm relação direta de pai/filho. Hoje só o `App.tsx` decide o que renderizar — não há esse problema ainda. Introduzir uma store global para um estado usado por um único componente seria complexidade sem benefício (seção 19 do prompt mestre: preferir a solução simples). Assim que um segundo componente (por exemplo o HUD, mais adiante) precisar saber em que tela o jogo está, esse estado deve subir para o `uiStore`.

### Verificação de componentes de UI simples via navegador, não teste unitário com jsdom

**Contexto:** a decisão de ambiente de teste `node` (Fase 1.1) previa adicionar `jsdom` "quando chegarmos a testar componentes React". O `MainMenu` é o primeiro componente de UI de verdade do projeto.

**Decisão:** por ora, verificar componentes puramente apresentacionais (sem lógica condicional complexa) rodando a aplicação de verdade num Chromium headless (mesma abordagem já usada nas Fases 1.2/1.3), em vez de adicionar `jsdom` + React Testing Library agora.

**Motivo:** o prompt mestre (seção 20) prioriza testes unitários para lógica de jogo (movimento, colisão, energia, inventário, upgrades, puzzles, save/load, progressão) — não para telas de UI. O `MainMenu` de hoje não tem lógica condicional complexa o bastante para justificar a infraestrutura de teste de componente (que exigiria duas dependências novas). Quando algum componente de UI acumular lógica condicional que valha a pena cobrir exaustivamente com testes (não só visualmente), essa é a hora de adicionar `jsdom` + Testing Library.

## Fase 2 — Robot

### Ações de jogo em vez de teclas cruas no `InputManager`

**Decisão:** o `InputManager` expõe `isActionPressed('moveUp' | 'moveDown' | ...)`, não `isKeyPressed('KeyW')`. Um mapa interno (`ACTION_TO_KEYS`) faz a tradução.

**Motivo:** o sistema de movimento não deveria precisar saber que "W" existe. Isso também deixa pronto o remapeamento de teclas (se um dia for pedido) sem tocar em nenhum outro sistema.

### `event.code`, não `event.key`

**Decisão:** o mapeamento de teclas usa `event.code` (posição física da tecla).

**Motivo:** `code` identifica a tecla pela posição no teclado, independente do layout — em AZERTY, a tecla na posição de W tem `code: 'KeyW'` mas `key: 'z'`. Para WASD, `code` é o padrão correto; usar `key` quebraria o jogo para jogadores fora do QWERTY.

### `InputManager` rastreia teclas cruas, não ações, internamente

**Contexto:** duas teclas diferentes (`KeyW` e `ArrowUp`) mapeiam para a mesma ação (`moveUp`).

**Decisão:** o `Set` interno guarda os `code` das teclas pressionadas; `isActionPressed` deriva a resposta verificando se **alguma** das teclas daquela ação está no set.

**Motivo:** se o estado guardado fosse a ação diretamente (`pressedActions.add('moveUp')` / `.delete(...)`), soltar uma das duas teclas apagaria a ação mesmo que a outra ainda estivesse pressionada — um bug real e fácil de não perceber em teste manual rápido (a maioria dos testers usa só uma tecla por vez). Guardando as teclas cruas, isso não acontece.

### Player não ganha `integrity`/`energy`/`scannerLevel` ainda

**Decisão:** o `Player` desta fase só tem `position`, `velocity`, `facing` e `size` — não o modelo de dados completo já esboçado na Fase 0.

**Motivo:** nenhum sistema usa esses outros campos ainda (energia, scanner e integridade chegam em fases futuras). Declarar campos sem lógica por trás é exatamente o tipo de coisa que a seção 19 do prompt mestre pede pra evitar. Entram quando os sistemas correspondentes existirem.

### Normalização de movimento diagonal

**Decisão:** ao mover em dois eixos ao mesmo tempo, o vetor de direção é normalizado antes de multiplicar pela velocidade.

**Motivo:** sem isso, mover na diagonal resultaria em velocidade ~41% maior (raiz de 2) do que mover num eixo só — um erro clássico de jogos 2D, fácil de implementar errado e só perceber quando alguém nota que anda mais rápido na diagonal.

### `updatePlayerMovement` muta o `Player` em vez de retornar um novo objeto

**Motivo:** consistente com a decisão de que o estado "quente" da engine é mutável comum (Fase 0) — evita criar objetos novos a cada um dos ~60 passos por segundo, o que geraria lixo de memória (garbage collection) desnecessário num loop contínuo.

### Câmera sem suavização, mais grade de depuração temporária

**Decisão:** a câmera centraliza exatamente na posição interpolada do jogador a cada frame, sem lag. Para provar visualmente que a transformação mundo→tela funciona antes de existir mapa de verdade, uma grade de referência é desenhada em coordenadas de mundo e passada pela mesma transformação da câmera.

**Motivo:** suavização de câmera é polimento (Fase 9), não uma mecânica que afeta o jogo — adicionar agora seria complexidade sem necessidade imediata. A grade existe só porque, sem ela, o jogador aparece sempre no centro da tela e não dá pra distinguir visualmente "câmera funcionando" de "nada sendo transformado". Some quando o mapa real (Fase 3) existir.

### Colisão resolve os eixos X e Y separadamente

**Decisão:** `resolveCollisions` testa o eixo X isoladamente (mantendo Y anterior) e depois o eixo Y (já com X resolvido), em vez de rejeitar o movimento inteiro ao detectar qualquer colisão.

**Motivo:** produz o comportamento de "deslizar" ao longo de uma parede quando o movimento é diagonal, sem precisar de física de verdade. Testado explicitamente (mover na diagonal contra uma parede vertical desliza no eixo livre; um canto que bloqueia os dois eixos trava o jogador por completo).

### Obstáculos de depuração temporários no `GameCanvas`

**Decisão:** um array fixo (`DEBUG_OBSTACLES`) com um retângulo é desenhado e usado para colisão, antes de existir mundo/mapa real.

**Motivo:** mesma lógica da grade de depuração — sem algo para colidir, não dá pra verificar visualmente que a colisão funciona. Será substituído pelos obstáculos reais de cada região na Fase 3.

### Ambiente de teste `node`, não `jsdom`

**Contexto:** o Vitest precisa de um ambiente de execução (`node` ou `jsdom`, que simula DOM de navegador).

**Decisão:** `environment: 'node'`.

**Motivo:** a lógica de jogo (`engine/`, `systems/`) não deve depender de DOM, por decisão de arquitetura da Fase 0. Usar `node` reforça esse isolamento — se algum sistema de gameplay algum dia "precisar" de DOM para passar num teste, isso é sinal de que ele está violando a separação entre lógica e UI. Quando chegarmos a testar componentes React (não lógica de jogo), adicionamos `jsdom` como dependência pontual.
