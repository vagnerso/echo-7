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

## Fase 3 — World

### Cada tile de parede vira um AABB, sem mesclar tiles adjacentes

**Decisão:** `getRegionObstacles` gera um retângulo de colisão por tile de parede, mesmo quando vários tiles formam uma parede contínua.

**Motivo:** mesclar tiles adjacentes num único retângulo maior seria uma otimização (menos itens para testar na colisão a cada frame). Na escala atual (algumas dezenas de tiles), isso não é gargalo nenhum — otimizar antes de medir um problema real vai contra a seção 21 do prompt mestre.

### `WorldLoader` não gerencia troca de região

**Decisão:** por enquanto só existem funções puras (`getRegionObstacles`, `getRegionSize`) que derivam dados de um `Region` — nenhuma lógica de "região atual", desbloqueio ou transição.

**Motivo:** só existe uma região (Landing Zone). Construir gerenciamento de troca de região sem uma segunda região para trocar seria especular sobre uma necessidade que ainda não existe.

### `wasActionJustPressed` (borda de subida), não `isActionPressed`, para interação

**Contexto:** `isActionPressed` (já usado no movimento) retorna verdadeiro continuamente enquanto a tecla está segurada — correto para movimento, errado para interação.

**Decisão:** o `InputManager` ganhou `wasActionJustPressed`, que só é verdadeiro no passo fixo em que a tecla foi pressionada, e `clearJustPressed()`, chamado pelo `GameCanvas` ao final de cada `update()`.

**Motivo:** sem essa distinção, seria impossível diferenciar "apertei E uma vez" de "estou segurando E" — segurando a tecla, a interação dispararia a cada um dos ~60 passos fixos por segundo. O guard contra auto-repeat do sistema operacional (`if (!this.pressedKeys.has(event.code))` antes de marcar `justPressed`) garante que isso vale mesmo se o navegador reenviar `keydown` continuamente enquanto a tecla estiver fisicamente pressionada.

### Estado de "ativado" de um objeto interagível fica fora de `content/regions.ts`

**Decisão:** o `GameCanvas` guarda um `Map<string, boolean>` local para saber quais objetos interagíveis já foram ativados nesta sessão — os dados em `content/regions.ts` continuam sendo só a definição estática da região.

**Motivo:** conteúdo (o que existe no mundo) e estado de runtime (o que o jogador já fez) são coisas diferentes. Misturá-los faria `content/regions.ts` deixar de ser dado estático puro, e futuramente dificultaria o save system (Fase 8) — que precisa serializar só o estado, não redefinir o mundo inteiro.

## Fase 4 — Scanner

### `WorldObject.kind` (enum) vira flags de capacidade (`interactable?`, `scannable?`)

**Contexto:** até a Fase 3, um objeto tinha `kind: 'decoration' | 'interactable'`, um enum excludente. O scanner precisava de um terceiro tipo (`scannable`).

**Decisão:** trocar por flags booleanas independentes (`interactable?: boolean`, `scannable?: boolean`); um objeto sem nenhuma é decoração pura.

**Motivo:** um enum não permite um objeto ser ao mesmo tempo interagível e escaneável (ex: um console que se escaneia para aprender sobre ele e se interage para ativar) — plausível no jogo real, dado que a seção 5 do prompt mestre mostra o scanner usado sobre o mesmo tipo de estrutura que consoles/mecanismos interagíveis. Refatorar agora, com um único objeto de cada tipo existindo, é muito mais barato que fazer depois com dezenas de objetos de conteúdo.

### Zustand introduzido agora (`gameStore`, `uiStore`)

**Contexto:** desde a Fase 1.4/2, a decisão era não usar Zustand até que um estado precisasse ser lido por mais de um consumidor. O scanner é o primeiro caso real: a engine (dentro do `GameCanvas`) detecta o alvo escaneado, e um componente de UI novo (`ScannerOverlay`) precisa exibi-lo.

**Decisão:** `state/uiStore.ts` guarda `isScannerActive` e `currentScanTarget` (efêmero, não persiste); `state/gameStore.ts` guarda `discoveries` (o "codex" permanente). Consistente com a distinção Game State / UI State já prevista na Fase 0.

**Motivo da separação entre as duas stores:** "scanner ativo" e "o que está sendo mostrado agora" são estado de tela, descartável a qualquer momento; "o que já foi descoberto" é progresso do jogador, que o save system (Fase 8) vai precisar persistir. Misturar as duas obrigaria decidir manualmente o que salvar e o que não salvar de dentro de uma store só.

### `GameCanvas` escreve nas stores via `getState()`/`setState()`, nunca via hook

**Contexto:** o código que decide o que escrever nas stores roda dentro do callback `update()` do game loop, não durante a renderização do componente React.

**Decisão:** usar a API estática do Zustand (`useUiStore.getState()`, `useGameStore.getState().addDiscovery(...)`) nesse trecho, em vez do hook (`useUiStore()`).

**Motivo:** o hook serve para inscrever um componente a re-renderizar quando o estado muda — é para uso durante o render do React. Dentro de `update()`, que roda a ~60Hz fora do ciclo de render, ler/escrever a store precisa ser uma chamada imperativa direta, sem inscrição.

### Store só é escrita quando o alvo do scanner muda, não a cada passo fixo

**Decisão:** `GameCanvas` compara o alvo escaneado atual com o anterior (`previousTarget?.objectId !== newTargetId`) antes de chamar `setCurrentScanTarget`/`addDiscovery`.

**Motivo:** mesmo raciocínio já aplicado à posição do jogador (Fase 0/1.4) - escrever na store a cada um dos ~60 passos fixos por segundo dispararia re-render do `ScannerOverlay` na mesma frequência, mesmo quando nada mudou de fato para o jogador ver.

### Sem botão [ANALYZE]: detecção por alcance já mostra o resultado

**Contexto:** o mockup da seção 5 do prompt mestre mostra um botão `[ANALYZE]` no painel do scanner, sugerindo um passo de confirmação manual.

**Decisão:** o painel mostra o resultado assim que o objeto entra em alcance com o modo scanner ativo - sem clique extra.

**Motivo:** o roadmap desta fase pede "detecção por raio" e "geração de discovery" (seções 4.1 e 4.3), não um fluxo de confirmação em múltiplas etapas. Adicionar isso agora seria escopo além do que foi pedido; pode ser revisitado se o playtest mostrar que falta alguma intenção do jogador antes de "gastar" a descoberta.

## Fase 5 — Inventory

### Capacidade do inventário é sobre slots distintos, não soma de itens

**Contexto:** `inventoryCapacity: 5` (Fase 0) precisava de uma definição precisa de "capacidade".

**Decisão:** capacidade limita quantos **tipos** de item distintos cabem no inventário (`inventory.length >= inventoryCapacity`), não a soma das quantidades. Empilhar mais unidades de um item que já existe nunca é bloqueado pela capacidade.

**Motivo:** o mockup do prompt mestre mostra o inventário como uma lista de tipos de item, cada um com sua quantidade (`Energy Cell x2`) — a limitação natural é de variedade, não de quantidade total, como na maioria dos jogos com inventário por slots.

### Coletar reaproveita a tecla E (interação), não é um mecanismo novo

**Decisão:** um item coletável no mundo é `interactable: true` com um campo adicional `collectible: InventoryItem`. Apertar E decide o comportamento: se o objeto tem `collectible`, coleta (soma ao inventário, remove do mundo); senão, mantém o comportamento de alternância já existente (como o console).

**Motivo:** já existia detecção de alcance e de borda de subida para interação (Fase 3.3) - criar um mecanismo de coleta separado (ex: coletar automaticamente ao encostar) duplicaria essa lógica sem necessidade.

### Objeto coletado é removido via um `Set` de sessão, não apagado de `content/regions.ts`

**Decisão:** `GameCanvas` mantém um `Set<string>` dos ids já coletados nesta sessão e filtra a lista de objetos ativos a partir disso, em vez de mutar os dados da região.

**Motivo:** mesmo raciocínio já registrado para o estado de "ativado" de um interactable (Fase 3.3) - conteúdo estático e estado de sessão são coisas diferentes, e essa separação é o que vai permitir ao save system (Fase 8) serializar só o progresso, sem reescrever a definição do mundo.

### Item permanece no mundo se o inventário estiver cheio

**Decisão:** `addItem` retorna `false` quando não há espaço para um item de tipo novo; `GameCanvas` só marca o objeto como coletado (some do mundo) se o retorno for `true`.

**Motivo:** sem essa checagem, um item "coletado" com inventário cheio simplesmente desapareceria do mundo sem entrar no inventário - perda de progresso silenciosa. Deixar o item no lugar até haver espaço é o comportamento correto e mais simples de implementar (não precisa de fila de itens pendentes nem de notificação de erro).

## Fase 6 — Upgrades

### Instalação automática ao coletar o componente, sem tecla nova

**Contexto:** o esquema de controles do prompt mestre (seção 3) define só E/Q/I/ESC - nenhuma tecla para "abrir upgrades".

**Decisão:** o upgrade se instala sozinho assim que o inventário tem o componente necessário (consumindo-o na hora); a lista de upgrades vira uma seção dentro do painel de inventário (tecla I) já existente.

**Motivo:** inventar uma tecla nova mudaria um esquema de controles já definido pelo prompt mestre sem necessidade - a informação "o que está instalado" cabe perfeitamente como uma segunda seção do painel que já existe para mostrar progresso do jogador.

### Upgrades gateiam mecânicas existentes, não criam mecânicas novas

**Decisão:** "Deep Scanner" faz `findNearestScannable` (e a renderização do marcador) ignorar objetos com `scanInfo.requiresDeepScanner` até o upgrade estar instalado; "Magnetic Boots" faz um tile `hazard` parar de contar como obstáculo de colisão.

**Motivo:** os dois reaproveitam sistemas já existentes (scanner da Fase 4, colisão da Fase 2/3) - nenhum mecanismo de gameplay novo foi criado, só mais um eixo de condição nos que já existiam. Consistente com "prefira a solução simples" (seção 19 do prompt mestre).

### Sem `scannerLevel`/`hasMagneticBoots` no `Player`

**Decisão:** a engine lê `useGameStore.getState().installedUpgrades.has(...)` diretamente onde precisa (update e render), em vez de espelhar isso em campos na entidade `Player`.

**Motivo:** duplicar o dado (uma vez na store, outra vez no Player) criaria duas fontes de verdade que poderiam divergir. A `gameStore` já é a fonte de verdade sobre progresso do jogador (discoveries, inventário) - upgrades instalados é só mais um campo dela.

### Bug real: reavaliar upgrades instaláveis após cada instalação, não com um snapshot único

**Contexto:** ao implementar a instalação automática, o primeiro código calculava a lista de upgrades instaláveis **uma vez** a partir do inventário no momento da coleta, e instalava todos os retornados num loop.

**O bug:** os dois upgrades do MVP exigem `1x Ancient Component` cada. Coletar **um único** componente tornava os dois elegíveis simultaneamente nesse snapshot único - o loop instalaria os dois, e o segundo `removeItem` simplesmente não teria efeito (item já removido pelo primeiro), mas o resultado final seria dois upgrades instalados a partir de um componente só.

**Correção:** reavaliar `findInstallableUpgrades` com `useGameStore.getState()` fresco a cada instalação dentro de um `while`, não um `for` sobre uma lista pré-computada. Peguei isso revisando o próprio código antes de testar no navegador, e travei com um teste (`gameStore.test.ts`) que reproduz exatamente esse cenário.

**Como isso foi encontrado:** ao planejar a verificação visual, percebi que a lógica dependia da ordem de avaliação e da mutação do estado entre iterações - um lembrete de que "escrever um loop que consome e reage ao mesmo estado que está mudando" é um padrão que merece atenção extra, mesmo em código simples.

### Marcador de objeto "oculto" também não é renderizado sem o upgrade

**Contexto:** a primeira versão só escondia o **resultado do scan** de um objeto com `requiresDeepScanner`, mas continuava desenhando o losango dele no mapa.

**Decisão:** `renderScannables` também ignora objetos com `requiresDeepScanner` quando o jogador não tem o upgrade - o objeto fica completamente invisível, não só "sem informação".

**Motivo:** encontrado na própria verificação visual desta fase - via um losango claramente visível ao lado do jogador enquanto o painel dizia "NO SIGNAL", o que não fazia sentido narrativo nem de UX ("hidden signal" deveria estar de fato escondido, não só sem detalhes).

## Fase 7 — Puzzles

### Escopo redefinido: Região 2 + Puzzle 1 agora, Região 3/Puzzle 2 na Fase 8

**Contexto:** o roadmap original (escrito na Fase 0) colocava "Puzzle #1 na Região 2" e "Puzzle #2 no Signal Core (Região 3)", mas nenhuma das duas regiões existia - só a Landing Zone (Região 1).

**Decisão:** criar a Região 2 (Ancient Ruins) e o sistema de transição entre regiões agora, para o primeiro puzzle de verdade. O Signal Core (Região 3) e o segundo puzzle ficam para a Fase 8, que já previa um "trigger pós-puzzle final" no encerramento - faz mais sentido construir aquela região junto com o conteúdo narrativo real do final, em vez de criar um placeholder que seria refeito depois.

**Motivo:** confirmado com o desenvolvedor antes de começar (ver conversa) - evita trabalho descartável.

### Só um tipo de puzzle, sem "registry" de tipos

**Decisão:** `systems/puzzleSystem.ts` implementa diretamente a lógica de sequência (`activateSwitch`), sem uma camada de despacho por `puzzle.type`.

**Motivo:** só existe um tipo (`sequence`) neste MVP. Construir um sistema de plugins para tipos que não existem ainda seria especular sobre necessidade futura - "três linhas parecidas" (aqui, zero linhas de um segundo tipo) vencem uma abstração prematura.

### "Resolvido" (permanente) e "progresso da tentativa" (sessão) são estados diferentes

**Decisão:** `solvedPuzzles` mora na `gameStore` (vai para o save system na Fase 8); o progresso parcial de uma sequência em andamento fica num `Map` local no `GameCanvas`, perdido ao recarregar.

**Motivo:** mesma distinção já aplicada a discoveries/upgrades/itens coletados - o que é "progresso do jogador" de verdade é permanente; o que é "estado de uma tentativa em andamento" não precisa sobreviver a um reload, e a maioria dos jogos com esse tipo de puzzle já reseta tentativas ao sair da área mesmo.

### Recompensa do puzzle reaproveita o padrão de gating já existente

**Decisão:** resolver o puzzle libera uma área selada (tile `sealed`, mesmo mecanismo condicional do `hazard` da Fase 6, mas gateado por `solvedPuzzles` em vez de `installedUpgrades`) contendo um objeto escaneável de recompensa (`requiresPuzzleSolved`).

**Motivo:** "resolver puzzle → obter acesso a uma nova área" é literalmente o que a seção 8 do prompt mestre descreve como o loop de progressão. Reaproveitar o mecanismo condicional de obstáculo (em vez de inventar outro) e o gating por `requires*` (já usado para o Deep Scanner) evita duplicar conceitos.

**Nota sobre o marcador do objeto de recompensa:** ao contrário do "sinal oculto" gateado por Deep Scanner (Fase 6), o `ruins-archive` **continua visível** no mapa mesmo antes do puzzle ser resolvido - só fica inacessível fisicamente pela parede selada. Isso é intencional, não uma inconsistência: a parede já comunica "você não pode chegar aí ainda", e ver a recompensa ao longe é um incentivo a resolver o puzzle, diferente do caso do sinal oculto, onde não havia nenhuma barreira física e o marcador visível contradiria o próprio scanner dizendo "sem sinal".

### `TileType 'sealed'` está fixado a um único puzzle (limitação assumida)

**Decisão:** o tile `sealed` sempre verifica `solvedPuzzles.has('ruins-puzzle-01')` - o id do puzzle está fixo no código (`SEALED_TILE_PUZZLE_ID`), não é um dado por tile.

**Motivo:** só existe um puzzle no MVP, então não há ambiguidade sobre qual puzzle destrava qual área seladas. Documentado explicitamente (no tipo `TileType` e no `GameCanvas`) como uma simplificação que precisará de metadado por tile (ex: `{ type: 'sealed', puzzleId }`) se um segundo puzzle com área selada aparecer.

### Bug evitado por pouco: ponto de retorno dentro de área já gateada

**Contexto:** ao definir o ponto de spawn para quando o jogador volta da Ancient Ruins para a Landing Zone, a primeira escolha (`(17,11)`) caía **dentro** da alcova magnética da Fase 6.

**O problema:** um jogador sem o upgrade Magnetic Boots que voltasse para esse ponto ficaria fisicamente preso - a única saída da alcova é a hazard tile, intransponível sem o upgrade. Um softlock real.

**Como foi pego:** relendo a posição escolhida contra o layout da Fase 6 antes de testar no navegador, não durante o teste - vale a pena revisar pontos de spawn/teleporte contra toda a geometria de colisão da região de destino, não só contra os objetos visíveis nela.

**Correção:** ponto de retorno movido para `(10,10)`, uma área aberta longe de qualquer estrutura gateada.

## Fase 8 — Narrative

### Direção narrativa confirmada com o desenvolvedor antes de implementar

**Contexto:** a seção 27 do prompt mestre define "direção narrativa final (o twist, tom, quanto revelar)" como decisão do desenvolvedor, não da IA.

**Decisão:** propus um esboço do arco (fragmentos ligando as três regiões, a descoberta de que o Signal Core reconhece o ECHO-7 como "parente" mecânico, não humano) e só escrevi o texto final depois de aprovação - incluindo o pedido explícito de fechar com um gancho de continuação ("TO BE CONTINUED"), já que a vertical slice não é o jogo completo.

### Puzzle #2 reaproveita o tipo `sequence`, sem um segundo tipo de puzzle

**Decisão:** o puzzle do Signal Core usa o mesmo `type: 'sequence'` do puzzle da Ancient Ruins, só com 4 nós em vez de 3.

**Motivo:** um tipo novo (ex: `energy-routing`, cogitado no design original) exigiria `WorldObject` novo, renderização nova e lógica nova só por variedade visual - escopo não pedido pelo roadmap. Reaproveitar o tipo já testado e dar mais peso ao puzzle final só com mais nós é a solução mais simples que atende ao pedido.

### Núcleo do Signal Core não usa tile `sealed` - o gate é só no objeto

**Decisão:** o objeto `signal-core` fica inacessível via `requiresPuzzleSolved` diretamente nele, sem nenhuma barreira física (tile) ao redor.

**Motivo:** evita esbarrar na limitação já documentada do tile `sealed` (fixado a um único puzzle, `ruins-puzzle-01`) - se o Signal Core também precisasse de uma parede selada, o hardcode atual quebraria (não saberia dizer qual dos dois puzzles libera qual parede). Gatear só o objeto, sem parede, contorna o problema sem precisar generalizar o mecanismo agora.

### Fragmentos de memória: revelação temporária + registro permanente

**Decisão:** coletar um fragmento mostra um painel por alguns segundos (`FragmentRevealOverlay`, auto-esconde) e também fica registrado permanentemente numa seção do painel de inventário (tecla I) - mesma solução já usada para upgrades na Fase 6 (sem tecla dedicada nova).

**Motivo:** o mockup do prompt mestre (seção 6) mostra o fragmento como uma revelação pontual ("SIGNAL CORRUPTED" / texto / "DATA RECOVERED: %"), mas o jogador também precisa poder reler fragmentos já vistos depois - sem isso, perder a janela de alguns segundos significaria perder o conteúdo para sempre.

### `resetGame`/`resetUi`: bug real de estado que sobrevivia entre partidas

**Contexto:** sem save/load, o estado do Zustand (inventário, upgrades, progresso, e agora `hasReachedEnding`) é um singleton que sobrevive ao desmonte do `GameCanvas` - só o estado local do componente (posição, câmera) resetava ao trocar de tela.

**O problema:** clicar em NEW GAME depois de terminar o jogo levaria direto para a tela de encerramento de novo (`hasReachedEnding` continuava `true`), com o inventário e upgrades da partida anterior ainda presentes.

**Como foi pego:** ao implementar o encerramento, pensando no fluxo "jogador termina, quer jogar de novo" - não foi um bug relatado, foi antecipado revisando o que "NEW GAME" deveria significar antes de testar.

**Correção:** `resetGame()`/`resetUi()` restauram os stores para o estado inicial, chamados no clique de NEW GAME (`App.tsx`), não ao simplesmente voltar para o menu - assim uma futura tela de "CONTINUE" (quando o save system existir) pode restaurar progresso sem esse reset.

## Fase 9 — Polish

### Áudio sintetizado via Web Audio API, sem arquivos de som

**Decisão:** `engine/audio.ts` gera tons simples com osciladores (`AudioContext`/`OscillatorNode`) para passos, scanner, interação, coleta e puzzle resolvido - nenhum arquivo de áudio no projeto.

**Motivo:** a seção 23 do prompt mestre marca áudio como mínimo/opcional; sintetizar por código atende a lista pedida (passos, scanner, interação, confirmação) sem precisar de um pipeline de assets de áudio nem de dependências novas.

**Limitação assumida:** não tenho como ouvir o resultado - verifiquei apenas que o código executa sem erros (via console do navegador) em cada ponto de disparo. A qualidade/adequação sonora real precisa de validação manual sua, jogando de verdade.

### Partículas: matemática testável, emissão (posição/cor/aleatoriedade) não

**Decisão:** `engine/particleSystem.ts` (mover, decair, expirar, limitar quantidade) é puro e testado; os parâmetros de emissão (onde nasce, direção aleatória, cor) ficam direto no `GameCanvas`, sem teste - mesmo critério já usado para o "bounce" de depuração da Fase 1.3.

**Motivo:** a lógica determinística (o que muda dado um estado + dt) vale a pena travar com teste; os parâmetros cosméticos de uma emissão aleatória não teriam uma asserção significativa além de "não quebra".

### Limite de partículas (`MAX_PARTICLES = 150`, descarta as mais antigas)

**Decisão:** `spawnParticles` descarta as partículas mais antigas (FIFO) se o total passar de 150.

**Motivo:** a seção 21 do prompt mestre pede atenção a "particle limits" - sem um teto, algo emitindo mais rápido do que as partículas expiram cresceria sem controle. Descartar as mais antigas (não as mais novas) prioriza o efeito visual mais recente, que é o que o jogador acabou de causar.

### Transição de região congela o jogo durante o fade

**Decisão:** ao interagir com uma saída, o `GameCanvas` entra num estado de transição (`'out'` → aplica a troca de região → `'in'`) que **pula** todo o resto do `update()` (movimento, interação, scanner) enquanto ativo - o jogo fica "congelado" sob o fade preto.

**Motivo:** mais simples que tentar processar gameplay normalmente por baixo de uma tela momentaneamente preta, e evita que o jogador ative outra interação por engano durante os ~250ms de cada metade da transição. `input.clearJustPressed()` continua sendo chamado durante o congelamento, para não "vazar" uma tecla segurada durante o fade para o instante em que o jogo volta a responder.

**Achado da verificação:** em teste automatizado (Playwright), a transição inteira às vezes acontece num único salto ao invés de progredir suavemente ao longo dos ~500ms esperados. Isso é uma consequência do acumulador de timestep fixo (documentado desde a Fase 1.3): quando o navegador atrasa a entrega de um frame, o loop processa vários passos fixos de uma vez para recompensar o atraso, e isso pode acontecer bem mais em automação com captura de screenshot do que num jogo real rodando a 60fps estável. A matemática em si (`progress += dt / TRANSITION_DURATION_MS`) está correta - confirmei que o fade preto de fato aparece e que a região troca corretamente no meio dele; a suavidade visual completa depende de framerate estável, que é o caso normal de uso.

## Fase 10 — Release

### Lacuna encontrada: save/load nunca foi alocado numa fase do roadmap

**Contexto:** a seção 18 do prompt mestre e a definição de MVP da Fase 0 (seção H: "Entra: Save/load versionado em localStorage") exigem persistência - mas as dez fases do roadmap que propus na Fase 0 nunca reservaram uma tarefa explícita para isso. O botão CONTINUE ficou desabilitado (`hasSave={false}` fixo) desde a Fase 1 sem que ninguém notasse a causa raiz.

**Como foi encontrado:** ao escrever a seção "Project Structure" do README para a Fase 10, notei que uma pasta `save/` estava listada mas nunca tinha sido criada - o que expôs a lacuna.

**Decisão:** implementar agora, antes do release, confirmado com o desenvolvedor.

### Posição exata do jogador não entra no save

**Decisão:** `saveGame`/`loadGame` persistem progresso (inventário, upgrades, puzzles resolvidos, fragmentos, região atual, objetivo, se o final foi alcançado) mas não a posição em pixels do jogador. Ao continuar, ele reaparece no ponto de entrada da região salva (`REGION_SPAWN_POINTS`), não exatamente onde estava.

**Motivo:** a posição do jogador vive fora da `gameStore` de propósito, por performance (Fase 0/1.4) - trazê-la de volta só para o save exigiria reintroduzir exatamente o problema que essa decisão evitou (posição sincronizada com um estado observável). Reaparecer na entrada da região é uma simplificação comum em jogos desse porte e preserva tudo que realmente importa (progresso).

### `StorageLike` injetável, mesmo padrão do `InputManager`/`GameLoop`

**Decisão:** `saveGame`/`loadGame`/`hasSaveGame` recebem um parâmetro opcional de storage (`getItem`/`setItem`/`removeItem`), com o `localStorage` real como padrão.

**Motivo:** permite testar toda a lógica de serialização/versionamento com um storage falso em memória, sem depender de `localStorage` estar disponível no ambiente de teste (`node`) - mesmo raciocínio já aplicado ao alvo de eventos do `InputManager` e às dependências de tempo do `GameLoop`.

### Autosave via `store.subscribe`, sem tecla ou botão de salvar

**Decisão:** o `GameCanvas` assina mudanças na `gameStore` e chama `saveGame()` a cada uma, sem debounce.

**Motivo:** o esquema de controles do prompt mestre não define uma tecla de salvar, e a `gameStore` já só muda em eventos discretos de progresso (nunca a cada frame, por design desde a Fase 0/1.4) - então salvar a cada mudança é barato e não precisa de throttling.

### `NEW GAME` salva imediatamente após resetar

**Decisão:** `handleNewGame` chama `resetGame()` e, na sequência, `saveGame()` explicitamente, antes mesmo de qualquer evento de progresso acontecer.

**Motivo:** sem isso, um jogador que clicasse NEW GAME e fechasse a aba imediatamente ainda veria CONTINUE apontando para o save da partida anterior (o autosave só dispararia no primeiro evento de progresso da nova partida).

### Ambiente de teste `node`, não `jsdom`

**Contexto:** o Vitest precisa de um ambiente de execução (`node` ou `jsdom`, que simula DOM de navegador).

**Decisão:** `environment: 'node'`.

**Motivo:** a lógica de jogo (`engine/`, `systems/`) não deve depender de DOM, por decisão de arquitetura da Fase 0. Usar `node` reforça esse isolamento — se algum sistema de gameplay algum dia "precisar" de DOM para passar num teste, isso é sinal de que ele está violando a separação entre lógica e UI. Quando chegarmos a testar componentes React (não lógica de jogo), adicionamos `jsdom` como dependência pontual.

## Polish visual pós-release

Com o MVP completo (Fases 0-10), o roadmap original não previa uma passada de acabamento visual — o próprio código marcava as formas do jogador e dos objetos como "placeholder até existir arte de verdade" (ver comentários históricos em `GameCanvas.tsx`). Esta seção cobre as decisões dessa passada, feita em fases pequenas (robô → cenário → UI → painel de comandos), cada uma com checkpoint antes de avançar para a próxima.

### Robô continua 100% vetorial (Canvas API), sem sprites

**Contexto:** o jogador via um simples quadrado ciano com um círculo indicando a direção. Para "parecer um robô de verdade" havia duas opções: (1) compor uma forma mais elaborada usando só a Canvas API, como já era feito para todo o resto do jogo; ou (2) introduzir um pipeline de assets (imagens/spritesheets), hoje inexistente no projeto.

**Decisão:** opção 1. `renderPlayer` em `GameCanvas.tsx` agora desenha um chassi (retângulo arredondado com gradiente, via `ctx.roundRect`), pernas/esteiras com leve animação de passada, cabeça/lente com glow (`shadowBlur`) que se desloca na direção do `facing`, e uma antena com ponta pulsante. Nenhuma caixa de colisão foi alterada — a mudança é puramente de desenho, a `size` do `Player` continua a mesma.

**Alternativas consideradas:** sprites desenhados/gerados externamente. Descartada por exigir uma fonte de arte externa (o assistente de IA usado neste projeto não gera imagens) e um pipeline de carregamento de assets que não existe hoje — escopo desproporcional ao pedido de "o robô parecer um robô", que a via vetorial já resolve.

**Motivo:** mantém a arquitetura decidida na Fase 0 (zero dependências novas, tudo desenhado via Canvas 2D) e é consistente com o resto da cena, que já é 100% procedural.

**Detalhe técnico:** a animação (passada, flutuação, pulso da antena) usa um acumulador de tempo (`animationTimeRef`, em ms) incrementado em `update(dt)` e passado ao `render`, com módulo de 100.000 para não perder precisão de ponto flutuante em sessões longas — o valor absoluto do tempo não importa, só a fase dos senos que dependem dele.

### Chão do mundo: textura procedural pré-renderizada por região, não geração por frame

**Contexto:** o fundo do jogo era uma cor sólida (`#12141c`) — os tiles `'floor'` nunca eram desenhados (só paredes/hazards/sealed tinham retângulo visível). Para o cenário "parecer um outro planeta", cada região precisava de solo com textura e identidade visual própria.

**Decisão:** cada região ganhou uma `GroundPalette` (cores de gradiente, manchas, rachaduras/grade, acento) em `REGION_GROUND_PALETTES`, usada por `createGroundTexture` para desenhar **uma única vez** um canvas offscreen do tamanho inteiro do mundo daquela região (gradiente + manchas/rachaduras proceduais via `Math.random()`, ou uma grade técnica para o Signal Core). Esse canvas é cacheado por `region.id` num `Map` mantido pelo componente (`groundTexturesRef`) e, a cada frame, apenas copiado (`ctx.drawImage`) na posição correspondente à câmera — nunca redesenhado tile a tile.

**Alternativas consideradas:**
1. Desenhar a textura tile a tile a cada frame (como os outros elementos da cena) — descartada por custo: dezenas a centenas de tiles com várias formas cada, todo frame, sem necessidade, já que o padrão nunca muda depois de gerado.
2. Usar uma seed determinística (RNG customizado) para a geração, permitindo reproduzir o mesmo padrão entre sessões — descartada por desnecessária: a textura só precisa ser estável *durante* uma sessão (gerada uma vez, cacheada), não entre sessões diferentes; `Math.random()` direto basta, mesmo raciocínio já usado para os parâmetros cosméticos do `particleSystem` (ver decisão da Fase 9 acima).

**Motivo:** mantém o custo por frame igual ao de antes (um único `fillRect`/`drawImage` cobrindo a tela) enquanto adiciona riqueza visual e diferenciação temática entre Landing Zone (solo rochoso ferrugem/roxo), Ancient Ruins (pedra dourada/musgo) e Signal Core (piso técnico com grade ciano, ecoando a estética de "computador de bordo" já usada na UI).

**Risco/limite conhecido:** a criação do `HTMLCanvasElement` só pode acontecer em runtime de navegador (depende de `document`) — por isso o cache vive num `useRef` do componente, não em escopo de módulo; `GameCanvas.tsx` nunca é importado sob o ambiente `node` do Vitest hoje, mas se algum dia for, esse isolamento evita quebrar os testes.

### Decorações de cenário: agrupamento de "pedras" com hash estável, não `Math.random()` por frame

**Decisão:** `renderDecorations` (objetos sem `interactable`/`scannable`, puro cenário) passou de um único círculo cinza para um pequeno agrupamento de 3 círculos, com posição/tamanho derivados de um hash simples do `id` do objeto (`hashString`), não de `Math.random()`.

**Motivo:** precisa parecer aleatório mas **não pode mudar a cada frame** — usar `Math.random()` diretamente no `render` faria o agrupamento "tremer" visualmente a cada redesenho. Um hash do id é determinístico (mesmo objeto sempre gera o mesmo padrão) e não exige guardar estado extra por objeto.

### CSS compartilhado entre painéis via `composes` (CSS Modules), nova pasta `src/styles/`

**Contexto:** os 6 componentes de UI/HUD (Mission, Scanner, Inventory, MemoryFragment, Ending, MainMenu) repetiam manualmente o mesmo bloco de CSS para o visual de "computador de bordo" (fundo translúcido, borda ciano, fonte monoespaçada) - confirmado com o desenvolvedor antes de adotar, por ser uma convenção nova de organização de arquivos (regra do projeto: convenções novas exigem confirmação explícita, não são decididas sozinhas).

**Decisão:** criado `src/styles/hudPanel.module.css` com três classes-base (`.panel`, `.title`, `.button`) que os módulos de cada componente reusam via `composes: <classe> from '@/styles/hudPanel.module.css'` (recurso nativo de CSS Modules - resolvido pelo Vite tanto em dev quanto no build de produção, confirmado gerando o bundle e inspecionando o CSS final). Cada componente continua com seu próprio `.module.css` para layout/posicionamento específico (`position`, `padding`, `top/left`, etc.) - só o *look* do painel foi centralizado.

**Alternativas consideradas:**
1. Duplicar o novo CSS em cada um dos 6 arquivos - rejeitada explicitamente pelo desenvolvedor: qualquer ajuste futuro no visual do painel exigiria editar 6 lugares em vez de 1.
2. Uma lib de CSS-in-JS ou Tailwind para compartilhar estilos - fora de cogitação, já que CSS Modules foi decisão de arquitetura da Fase 0 justamente para manter controle fino sem dependência nova.

**Motivo:** `composes` é a forma idiomática de compartilhar estilo entre CSS Modules sem sair do que já foi decidido (sem pré-processador, sem lib nova) - é conceitualmente parecido com um "mixin", mas resolvido pelo bundler na composição de classes, não por duplicação de regras.

**O que mudou visualmente:** cantos cortados (`clip-path`, no lugar de bordas retas) para reforçar a estética angulosa já pretendida; glow externo via `filter: drop-shadow` (acompanha o contorno recortado, ao contrário de `box-shadow`, que iluminaria como um retângulo por baixo de um painel com cantos cortados); textura sutil de scanline (`repeating-linear-gradient` em baixa opacidade) simulando uma tela CRT; título com leve `text-shadow` para todos os cabeçalhos de painel. Botões (`MainMenu`, `EndingScreen`) passaram a usar a mesma classe `.button` compartilhada, com cantos cortados e glow no hover.

### Painel de comandos (`ControlsHint`) deriva os rótulos de `ACTION_TO_KEYS`, não duplica as teclas

**Contexto:** o jogo não mostrava em lugar nenhum quais teclas fazem o quê (WASD/setas para mover, `E` interagir, `Q` scanner, `I` inventário) - o mapeamento só existia em `engine/inputManager.ts`, internamente ao módulo (`ACTION_TO_KEYS` não era exportado).

**Decisão:** `ACTION_TO_KEYS` passou a ser exportado, e ganhou uma função irmã `formatKeyLabel` (também exportada, testada em `inputManager.test.ts`) que converte um `code` de tecla no rótulo curto de exibição (`'KeyW'` → `'W'`, `'ArrowUp'` → `'↑'`). O novo componente `components/Controls/ControlsHint.tsx` monta a lista exibida **a partir** desses dados, sem repetir nenhum nome de tecla como string solta.

**Alternativa considerada:** escrever a lista de comandos como strings fixas direto no componente (`{ keys: 'WASD', action: 'Move' }`, etc.) - mais simples de ler, mas duplicaria o mapeamento de teclas em dois lugares; se o esquema de controles mudasse (rebind, nova tecla), o painel na tela poderia ficar desatualizado silenciosamente, sem nenhum erro de compilação avisando.

**Motivo:** `engine/inputManager.ts` já é a fonte de verdade sobre o que cada tecla faz - fazer a UI ler dali (em vez de replicar o conhecimento) é a mesma ideia de "single source of truth" já aplicada em outros pontos do projeto (ex: `SEALED_TILE_PUZZLE_ID`), e elimina uma categoria inteira de bug (UI desatualizada em relação ao input real).

**Posicionamento:** canto inferior esquerdo, único canto ainda livre entre os HUDs existentes (Scanner ocupa o superior esquerdo, Mission o superior direito, revelação de fragmento o inferior central). Painel sempre visível durante o gameplay (mesmo padrão de Mission/Scanner: `pointer-events: none`, sem toggle) - mais simples do que introduzir uma tecla de "ajuda" dedicada, e a lista é curta o bastante para não poluir a tela.

## Internacionalização (Inglês/Português-BR) e tela de Settings

Pedido do desenvolvedor: o jogo passa a suportar dois idiomas (Inglês, padrão; Português do Brasil), configurável numa tela de Settings nova. Levantamento inicial mostrou que o volume real de texto do jogo está concentrado no *conteúdo* (`content/*.ts`), não na UI de botões - e que a UI já misturava inglês com português sem querer (algumas descrições de upgrade e mensagens do inventário já estavam em PT-BR, soltas). Esta fase corrige essa inconsistência ao mesmo tempo que introduz o sistema de idiomas.

### Dicionário customizado, sem biblioteca de i18n

**Contexto:** bibliotecas como `react-i18next` resolvem pluralização, interpolação avançada, detecção de idioma do navegador, carregamento assíncrono de traduções, etc.

**Decisão:** um dicionário próprio (`src/i18n/`) - uma interface `Translations` (tipo) descrevendo o formato completo da UI e do conteúdo, e dois arquivos (`en.ts`, `ptBR.ts`) que implementam essa interface. Um hook `useTranslations()` (`src/hooks/useTranslations.ts`) lê o idioma atual do `settingsStore` e devolve o dicionário inteiro; componentes destroem direto (`t.mainMenu.title`), sem uma função `t(chave)` genérica.

**Alternativas consideradas:** `react-i18next` (ou similar) - descartada por adicionar dependência nova, mais uma camada de configuração (namespaces, carregadores, contexto de provider) e recursos (plural complexo, interpolação ICU, `Suspense` para carregamento assíncrono) que este jogo não precisa - todo o texto é estático, conhecido em build time, sem plural nem gênero variável relevante além de um `%` e algumas contagens simples, resolvidos com funções comuns (`slots: (count, capacity) => ...`) em vez de um mini-motor de template.

**Motivo:** confirmado com o desenvolvedor antes de implementar (pergunta explícita sobre abordagem). O ganho de segurança de uma lib de verdade (chave faltando não quebra o build, só falha em runtime com um `key not found`) é justamente invertido aqui: como `en`/`ptBR` são tipados como `Translations`, **esquecer uma chave em qualquer um dos dois idiomas é erro de compilação**, não bug em produção - o TypeScript faz o trabalho que a lib faria em runtime, de graça, porque o dicionário é só dado estático.

### `settingsStore` separado de `gameStore`/`uiStore`, com sua própria persistência

**Contexto:** idioma (e futuramente cor do robô) são preferências do dispositivo/jogador, não progresso de uma partida.

**Decisão:** um novo `state/settingsStore.ts` (Zustand), com persistência própria em `save/settingsStorage.ts` (chave `echo7-settings` no localStorage, versionada, mesmo padrão `StorageLike` injetável já usado em `save/saveGame.ts` - inclusive reaproveita o mesmo tipo `StorageLike`, importado de lá). `resetGame()`/`resetUi()` (disparados por NEW GAME) nunca tocam nesse store.

**Alternativas consideradas:** guardar `locale` dentro da `gameStore` (junto do progresso) ou da `uiStore` (junto do estado efêmero) - ambas descartadas: a primeira faria NEW GAME resetar o idioma escolhido (e poluiria o formato de save versionado com uma preferência que não é progresso); a segunda faria a preferência se perder a cada `resetUi()`, que hoje roda tanto em NEW GAME quanto em CONTINUE.

**Detalhe técnico:** a leitura inicial (`loadSettings()`) acontece uma única vez, síncrona, no momento em que o módulo `settingsStore.ts` é importado (não num `useEffect`) - assim a tela de menu já nasce no idioma salvo, sem um frame piscando em inglês antes de aplicar a preferência. A gravação (`saveSettings`) fica a cargo de um `useSettingsStore.subscribe(...)` em `App.tsx` (não dentro do próprio store) - mesmo padrão de autosave-via-`subscribe` já usado para o progresso (Fase 10), e colocado em `App.tsx` (não em `GameCanvas.tsx`, como o do progresso) porque a preferência de idioma precisa valer já na tela de menu, antes de qualquer partida começar.

### Conteúdo passa a guardar só identidade (`id`), nunca texto de exibição

**Contexto:** `content/regions.ts`, `content/upgrades.ts` e `content/fragments.ts` guardavam o texto em inglês (às vezes em português, por engano) direto nos dados - `name: 'Energy Cell'`, `label: 'UNKNOWN STRUCTURE'`, `text: 'Log 03 - ...'`. Para dois idiomas, esse texto não pode morar nos dados: precisa ser resolvido no idioma atual, na hora de renderizar.

**Decisão:** remover todo campo de texto de exibição de `InventoryItem`, `Upgrade`, `MemoryFragment` e do (agora extinto) `ScanInfo`; manter só `id`s estáveis. As telas resolvem o texto via `t.items[id]`, `t.upgrades[id]`, `t.fragments[id]`, `t.scanInfo[objectId]` no idioma atual. `WorldObject.scanInfo?: ScanInfo` virou `WorldObject.requiresDeepScanner?: boolean` direto (o objeto-wrapper não tinha mais motivo de existir sem nenhum campo de texto dentro).

**Efeito colateral desejado - `Discovery` (o "log" de objetos escaneados, salvo em `gameStore.discoveries`) também perdeu `label`/`age`/`material`:** antes, esses campos eram copiados do `scanInfo` no momento do scan e ficavam congelados no idioma de quando o jogador escaneou aquele objeto - um jogador que escaneasse algo em português e depois trocasse para inglês veria essa entrada específica presa em português para sempre (se essa lista algum dia ganhar uma tela própria). Agora `Discovery` guarda só `objectId`, e qualquer UI futura que a exiba resolveria o texto ao vivo, sempre no idioma atual - o mesmo princípio já aplicado ao `ScannerOverlay` ao vivo.

**Objetivo da missão (`currentObjective`) virou `ObjectiveKey`, não mais a sentença:** `gameStore.setObjective`/`currentObjective` guardam uma chave simbólica (`'investigateAncientRuins'`, etc.), tipada contra o union `ObjectiveKey` exportado de `src/i18n` - um erro de digitação numa chamada `setObjective(...)` em `GameCanvas.tsx` vira erro de compilação, não uma missão com texto errado em produção. Um save antigo (de antes desta mudança) trazia a sentença literal em inglês no lugar da chave; `MissionHUD` trata isso com um fallback (`t.objectives[key] ?? key`) - o jogador só veria a sentença antiga sem tradução, nunca uma tela quebrada.

**Alternativa considerada:** manter o texto nos dados e só *adicionar* uma camada de tradução por cima (um mapa `texto em inglês -> texto em português`) - descartada por ser frágil (qualquer mudança de pontuação/capitalização no texto original quebra o mapeamento) e por preservar a causa raiz do problema (dado e apresentação continuariam acoplados).

### Testes: remover o campo, não só ignorá-lo

**Decisão:** todos os testes que construíam `InventoryItem`/`Upgrade`/`MemoryFragment`/`Discovery`/`ScanInfo` com um campo de texto (`name`, `label`, `text`, etc.) tiveram esse campo removido do fixture, em vez de deixado ali sem uso.

**Motivo:** com os tipos atualizados, manter esses campos nos testes teria sido um erro de compilação (excess property check do TypeScript em literais de objeto) - a correção "obrigatória" coincidiu com uma simplificação real dos fixtures de teste (menos campos para configurar em cada um).

## Cor do robô customizável (Settings)

Pedido do desenvolvedor: o jogador poder escolher a cor do robô entre ~5 opções, em Settings, sem conflitar com o cenário.

### Paleta por cor num `content/robotColors.ts` novo, não dentro de `GameCanvas.tsx`

**Contexto:** as paletas de fundo por região (`REGION_GROUND_PALETTES`) vivem dentro de `GameCanvas.tsx` porque só são usadas ali. A paleta de cor do robô precisa ser lida em dois lugares: pela renderização (`GameCanvas.tsx`, para desenhar) e pela tela de Settings (`SettingsScreen.tsx`, para mostrar as amostras de cor clicáveis).

**Decisão:** `content/robotColors.ts` novo (mesmo padrão de `content/regions.ts`, `upgrades.ts`, etc. - dado estático do jogo), exportando `ROBOT_COLOR_PALETTES` (hex de cada cor) e `ROBOT_COLOR_KEYS` (ordem de exibição). As chaves (`RobotColorKey` - `'cyan' | 'amber' | 'rose' | 'green' | 'azure'`) moram em `src/i18n` (mesmo lugar de `ObjectiveKey`), porque cada uma precisa de um nome traduzido em Settings (`t.settings.robotColors[key]`) - mas os valores hex em si **não** moram no dicionário, já que cor não varia por idioma.

**Motivo:** separa claramente três responsabilidades que poderiam ter sido misturadas numa só: *quais cores existem e seus valores hex* (`content/robotColors.ts`, dado visual), *como cada uma se chama em cada idioma* (`i18n`, texto), e *qual está selecionada agora* (`settingsStore`, estado). Nenhuma dependeria de reimportar de dentro do componente de Canvas para a tela de UI (ou vice-versa) se tivesse ficado tudo junto em `GameCanvas.tsx`.

### Só chassi/pernas mudam de cor - sensor e antena ficam fixos

**Decisão:** `renderPlayer` passou a receber um parâmetro `palette: RobotPalette` (`body`/`light`/`dark`/`outline`/`leg`) usado só no chassi e nas pernas. A lente (`PLAYER_LENS_COLOR`/`PLAYER_LENS_GLOW`) e a antena (`PLAYER_ANTENNA_COLOR`/`PLAYER_ANTENNA_TIP_COLOR`) continuam constantes fixas, iguais em todas as cores.

**Motivo:** o "sensor" ciano é a assinatura visual do ECHO-7 (referência comum em ficção científica: o robô pode mudar de cor de pintura, mas o "olho" mantém sua identidade) - variar tudo tornaria as 5 opções mais uma questão de "5 robôs diferentes" do que "5 pinturas do mesmo robô". `cyan` como cor padrão (`DEFAULT_ROBOT_COLOR`) usa exatamente os mesmos valores hex da Fase 1 - quem nunca abrir Settings não percebe nenhuma mudança.

### 5 cores escolhidas evitando as paletas de fundo já existentes

**Decisão:** ciano (padrão), âmbar, rosa, verde e azul - evitando roxo (paleta de fundo da Landing Zone e cor de `SEALED`/`SWITCH`) e tons muito próximos do dourado/musgo (Ancient Ruins).

**Motivo:** o jogo já usa boa parte do espectro de cor para sinalizar coisas diferentes (paredes, hazards, interagíveis, coletáveis, fragmentos de memória, etc. - ver constantes no topo de `GameCanvas.tsx`) e cada região tem sua própria paleta de fundo (Fase 2 do polish visual). Escolher tons claramente distintos entre si e das cores de fundo evita que o robô "suma" visualmente contra o cenário ou seja confundido com um marcador do mapa. Sobreposição perfeita de zero seria impossível dado quantas cores já têm significado no jogo; a barra usada foi "razoavelmente distinto", não "matematicamente único".

### Preferência persiste e sobrevive a formato antigo de `Settings` (sem migração de versão)

**Decisão:** `robotColor` foi adicionado a `Settings`/`SettingsData` sem incrementar `SETTINGS_VERSION`. `loadSettings` usa `data.robotColor ?? DEFAULT_ROBOT_COLOR` para preencher o campo que não existia num arquivo salvo antes desta mudança (Fase A só tinha `locale`).

**Alternativa considerada:** incrementar `SETTINGS_VERSION` para 2 e invalidar preferências antigas (mesmo mecanismo usado em `saveGame.ts` para o save de progresso) - descartada porque, ao contrário do save de progresso (onde um formato incompatível vira "começa um jogo novo", uma perda aceitável), aqui invalidar o arquivo inteiro faria o jogador perder o **idioma** que já tinha escolhido só porque um campo novo e independente foi adicionado - pior experiência do que simplesmente preencher o campo que falta com o padrão.

**Motivo:** campo aditivo e opcional-na-migração, não uma mudança de formato incompatível - o padrão de fallback por campo é mais amigável aqui do que o padrão de invalidação total já usado no save de progresso.

### Bug encontrado e corrigido: `:hover` do botão compartilhado escondia o estado `[data-active]`

**Contexto:** ao testar visualmente o seletor de cor, a amostra selecionada não mostrava nenhum destaque enquanto o mouse estava sobre ela (o que acontece sempre logo após o clique, inclusive em teste automatizado).

**Causa raiz:** `.button:hover:not(:disabled)` (`src/styles/hudPanel.module.css`, compartilhado desde a Fase 3 do polish visual) tem especificidade (0,3,0) - maior que `.swatchButton[data-active]` (0,2,0) definida em `SettingsScreen.module.css`. Passar o mouse sobre a amostra já selecionada fazia o hover (ciano) vencer o destaque de "selecionada" (branco/glow da própria cor), mascarando visualmente a seleção. O mesmo bug já existia desde a Fase 3 no seletor de idioma, mas era invisível ali porque a cor de hover e a cor de "ativo" do idioma são coincidentemente idênticas (`#5ee6c8`).

**Decisão:** `.button:hover:not(:disabled)` virou `.button:hover:not(:disabled):not([data-active])` - a regra compartilhada agora explicitamente não se aplica a um botão marcado como `[data-active]`, não importa a especificidade de quem definiu esse estado.

**Motivo:** corrigir na classe compartilhada, não em cada consumidor - "hover não deve mascarar um estado de seleção ativa" é uma regra de UI genérica o suficiente para viver no componente de botão comum, e resolve o problema para qualquer uso futuro de `[data-active]` de uma vez, não só para o seletor de cor.

## v2.0 — Fase A: Mobile

Pedido do desenvolvedor: o jogo funcionar em telas de toque. Plano completo (as 3 frentes da v2.0) ficou registrado antes de começar; aqui só a fase de mobile, decidida com o desenvolvedor como D-pad + botões virtuais (não "tocar para andar").

### `InputManager` ganha `pressVirtual`/`releaseVirtual`, sem um segundo mecanismo de input

**Contexto:** todo o resto do jogo (`systems/`, `GameCanvas.tsx`) já consumia input só via `isActionPressed`/`wasActionJustPressed` do `InputManager` - nunca lia teclas diretamente. Isso significava que qualquer fonte nova de input (toque) só precisava alimentar o mesmo `InputManager`, não criar um caminho paralelo.

**Decisão:** cada `GameAction` ganhou uma "tecla" sintética reservada (`Virtual:moveUp`, etc., geradas a partir das próprias chaves de `ACTION_TO_KEYS` - nunca hardcoded uma a uma) somada ao mesmo `KEY_TO_ACTION` já usado para teclado. Dois métodos novos, `pressVirtual(action)`/`releaseVirtual(action)`, só chamam os `handleKeyDown`/`handleKeyUp` privados já existentes com essa tecla sintética - reaproveitando 100% da lógica de `pressedKeys`/`justPressedActions` (inclusive o caso de duas fontes ativando a mesma ação ao mesmo tempo, já tratado desde a Fase 1 para teclas duplicadas como `KeyW`/`ArrowUp`).

**Alternativa considerada:** uma classe `TouchInputManager` separada, combinada ao `InputManager` de teclado via um "OR" nos consumidores (`isActionPressed = keyboard.isActionPressed(a) || touch.isActionPressed(a)`) - descartada por introduzir um segundo objeto com seu próprio estado interno e exigir que `GameCanvas` e `movementSystem` conhecessem as duas fontes, quando o objetivo é justamente esconder essa diferença deles.

**Bug encontrado ao escrever o teste:** `isActionPressed` conferia só as teclas reais listadas em `ACTION_TO_KEYS[action]`, nunca a tecla virtual - `pressVirtual` marcava `pressedKeys` corretamente, mas a ação nunca aparecia como pressionada. Corrigido conferindo também `VIRTUAL_KEY_BY_ACTION[action]`.

### `TouchControls` vive dentro do `GameCanvas`, não como irmão em `App.tsx`

**Decisão:** o componente novo (`components/TouchControls/`) recebe `inputRef` (o mesmo `useRef<InputManager|null>` que o `GameCanvas` já mantém internamente) e é renderizado dentro do próprio `<div>` retornado por `GameCanvas`, não ao lado dele em `App.tsx` (como `ScannerOverlay`/`MissionHUD`/etc, que só leem stores).

**Motivo:** evita duas alternativas piores - criar uma segunda instância de `InputManager` (duas fontes de verdade sobre teclas pressionadas) ou promover a instância única a um singleton em escopo de módulo (que chamaria `window.addEventListener` na importação do arquivo, quebrando os testes de `inputManager.ts`, que rodam em `environment: 'node'` sem `window` - a mesma categoria de armadilha já documentada para `document`/canvas na Fase 2 do polish visual).

### Visibilidade por `@media (pointer: coarse)`, sem detecção de dispositivo em JS

**Decisão:** `TouchControls` fica sempre no DOM (`display: none` por padrão), visível só via `@media (pointer: coarse)` no CSS. Mesma media query esconde o `ControlsHint` (HUD de teclado) - os dois nunca aparecem juntos, e os próprios botões do D-pad já servem de legenda visual em telas de toque.

**Motivo:** `pointer: coarse` é a forma padrão (sem JS, sem risco de falso-negativo) de perguntar "o dispositivo primário de apontamento é impreciso o bastante para precisar de alvos de toque maiores" - mais confiável e mais simples que checar `'ontouchstart' in window` (que dá falso-positivo em alguns notebooks touch-screen híbridos de qualquer forma, então o comportamento nesse caso de borda é o mesmo dos dois jeitos).

### Layout responsivo: breakpoints por painel, não um sistema de grid geral

**Contexto:** nenhum `@media` existia no projeto antes desta fase - todos os painéis de HUD usavam `px` fixos.

**Decisão:** um `@media (max-width: 480px)` por `.module.css` de painel (Scanner, Mission, Controls, Inventory), reduzindo padding/font-size/min-width individualmente - não uma abstração de breakpoint compartilhada (variável CSS, mixin, etc.).

**Motivo:** só 4-5 painéis existem e cada um tem métricas próprias (larguras mínimas diferentes, alguns `min-width`, outros `max-width`) - uma abstração compartilhada economizaria poucas linhas hoje e acopraria painéis que não precisam mudar em conjunto. Repetir o breakpoint em cada arquivo é mais simples de ler isoladamente (mesmo raciocínio já usado para não criar uma paleta genérica de zoom de câmera antes de precisar de uma).

**Achado durante o teste visual:** o `FragmentRevealOverlay` (revelação de fragmento, rodapé-centro) e o `InventoryPanel` (`min-width: 280px` fixo, que pode vencer `max-width: 90vw` num viewport bem estreito) precisaram de ajustes específicos - o primeiro sobe (`bottom: 90px` só em `pointer: coarse`) para não ficar atrás do D-pad/botões de ação; o segundo troca `min-width` por `width: 92vw` abaixo de 480px.

### `z-index`: primeiro uso no projeto, `TouchControls` fica abaixo de modais

**Decisão:** `.controls` (TouchControls) recebeu `z-index: 1`; `.backdrop` (InventoryPanel) recebeu `z-index: 2` - garantindo que um modal sempre cubra os botões de toque, mesmo que ambos "existam" na tela ao mesmo tempo.

**Verificação:** confirmado via `document.elementFromPoint` (não só inspeção visual) que, com o inventário aberto, tocar onde um botão do D-pad estaria realmente aciona o backdrop, não o botão - a sobreposição visual remanescente (bordas dos botões ainda fracamente visíveis através do backdrop semi-transparente) é cosmética e consistente com o comportamento já existente de outros painéis de HUD atrás do mesmo modal (o backdrop sempre foi semi-transparente, não opaco).

### Zoom de câmera: adiado de propósito

**Decisão:** não implementar zoom de câmera para telas estreitas nesta fase, mesmo a câmera sendo 1:1 pixel (sem zoom) desde a Fase 0.

**Motivo:** registrado no plano da v2.0 como algo a avaliar só depois de jogar de verdade num viewport móvel com D-pad e HUD responsivo já prontos - adicionar um mecanismo de zoom (e os testes que ele exigiria) para um problema que pode não incomodar na prática seria escopo especulativo.

### Correções pós-teste em dispositivo real (Fase A)

Dois problemas reportados pelo desenvolvedor depois de testar a Fase A num celular de verdade (não só emulação de viewport).

#### Inventário ficava impossível de fechar no toque

**Causa raiz:** o próprio fix de `z-index` desta fase (`TouchControls` abaixo de modais, para o D-pad não vazar por baixo do `InventoryPanel`) tem um efeito colateral: o botão de ação "I" - que abre e fecha o inventário - também fica atrás do backdrop assim que o modal abre. Abrir funciona (o backdrop ainda não existe no momento do toque); fechar pelo mesmo botão não, porque nesse momento o backdrop já está por cima dele. Teclado não sofre disso (listener global, não depende de hit-test do DOM), por isso o problema só aparecia no toque.

**Decisão:** `InventoryPanel` ganhou dois caminhos novos de fechar, nenhum dependente do `TouchControls`: um botão "×" (`aria-label` traduzido) dentro do próprio painel, e fechar ao tocar/clicar fora dele (no backdrop) - checando `event.target === event.currentTarget` para não fechar ao clicar em conteúdo interno que borbulha o evento até o backdrop.

**Motivo:** a causa raiz (z-index intencional, documentado acima) não deveria ser revertida - continua correto o D-pad não funcionar por baixo de um modal aberto. A correção certa é um modal sempre ter uma saída própria, sem depender de nenhum controle que ele mesmo possa estar cobrindo - um princípio de UI geral, não um workaround específico de mobile (por isso o botão "×" também aparece no desktop).

#### Texto do `FragmentRevealOverlay` "grande demais" e ilegível no celular

**Causa raiz dupla:** (1) o painel nunca teve `font-size` próprio - herdava o padrão do navegador (~16px), maior que todos os outros painéis do jogo (12-14px); (2) a correção anterior desta mesma fase (subir o painel para `bottom: 90px` no toque, para não ficar atrás do D-pad) não bastava para um fragmento de texto longo (várias linhas) - a altura do próprio texto ainda alcançava os botões, só com uma folga maior antes de colidir.

**Decisão:** `.panel` ganhou `font-size: 14px` (era implícito, ~16px) com `12px` adicional no breakpoint de toque; e o posicionamento em toque trocou de "ancorado no rodapé, deslocado para cima" para **centralizado verticalmente** (`top: 50%; transform: translate(-50%, -50%)`), com `max-height: 70vh; overflow-y: auto` como proteção adicional.

**Alternativa considerada:** aumentar ainda mais o deslocamento do `bottom` - descartada por ser um ajuste manual calibrado para o comprimento do texto de UM fragmento específico; qualquer fragmento mais longo (ou fonte do usuário maior via acessibilidade do navegador) voltaria a colidir. Centralizar verticalmente resolve a causa (posição fixa competindo por espaço com outro elemento de altura variável) em vez de calibrar a distância uma vez.

**Lição:** os dois problemas só apareceram em teste num dispositivo real, não na emulação de viewport usada para verificar a Fase A - a emulação (Playwright + viewport de iPhone) confirma layout e alcançabilidade por hit-test, mas não substitui jogar de verdade uma sessão inteira (abrir e fechar o inventário repetidamente, coletar um fragmento com texto longo).

## v2.0 — Fase B: Tutorial ("HOW TO PLAY")

Pedido do desenvolvedor: uma seção no menu com um tutorial/briefing, para o jogador entender o objetivo antes de jogar - sem spoiler de história (decidido no plano da v2.0), coerente com a seção 6 do prompt mestre ("a história deve ser contada principalmente através de... o jogador deve montar mentalmente o que aconteceu").

### Lista de controles extraída para `engine/controlsDisplay.ts`, não duplicada

**Contexto:** `ControlsHint.tsx` (HUD in-game, Fase 4 do polish visual) já montava a lista de controles a partir de `ACTION_TO_KEYS`/`formatKeyLabel` (`engine/inputManager.ts`). A tela de tutorial precisa exatamente da mesma lista.

**Decisão:** `formatKeyGroup` e `CONTROL_ROWS` saíram de `ControlsHint.tsx` para um módulo novo, `engine/controlsDisplay.ts` - ambos os componentes (`ControlsHint`, `TutorialScreen`) importam de lá.

**Alternativa considerada:** duplicar a lista em `TutorialScreen.tsx` (só 4 linhas) - descartada pelo mesmo motivo já registrado quando `ControlsHint` foi criado: duplicar o mapeamento de teclas cria uma segunda fonte que pode desalinhar silenciosamente de `ACTION_TO_KEYS` se o esquema de controles mudar.

**Por que `engine/`, não dentro de um dos componentes:** a lista deriva de dados do `engine/inputManager.ts` e não depende de React - cabe na mesma camada, ao lado de `formatKeyLabel`, e fica igualmente acessível para qualquer novo consumidor futuro sem criar uma dependência de componente para componente.

### `TutorialScreen` replica o esqueleto do `SettingsScreen`, sem generalizar em um "componente de tela"

**Decisão:** `TutorialScreen.tsx` (`{ onBack }`, `useTranslations()`, mesma estrutura de `.screen`/`.title`/`.section`/botão de voltar via `composes: button`) repete o padrão manualmente, em vez de extrair um componente `Screen` genérico compartilhado entre `SettingsScreen`/`TutorialScreen`/`MainMenu`/`EndingScreen`.

**Motivo:** só existem 4 telas cheias no projeto, cada uma com pequenas diferenças de layout (número de seções, se tem formulário ou só texto) - uma abstração agora encapsularia 3-4 linhas de CSS repetidas em troca de indireção; vale revisitar se uma 5ª tela mostrar um padrão mais forte se repetindo.

### Conteúdo do briefing: premissa já pública, não lore nova

**Decisão:** o texto de "MISSION BRIEFING" resume o que já está no README/prompt mestre (ECHO-7, robô explorador, sinal misterioso, planeta presumidamente abandonado) - não menciona Kade, as ruínas, o Signal Core, nem qualquer coisa revelada só nos fragmentos de memória ou no final.

**Motivo:** confirmado no plano da v2.0 antes de implementar - o objetivo é o jogador entender o que fazer (explorar, escanear, coletar), não o que a história significa. Rascunho de texto narrativo segue a mesma divisão já documentada em `AI_DEVELOPMENT.md` (IA propõe, desenvolvedor ajusta tom).

### Botão novo no menu não reordena os existentes

**Decisão:** "HOW TO PLAY" entra como 3º botão (depois de NEW GAME/CONTINUE, antes de SETTINGS), sem alterar a ordem nem o estilo dos outros três.

**Motivo:** mantém `NEW GAME`/`CONTINUE` nas duas primeiras posições (as ações mais prováveis para quem já conhece o jogo), com o tutorial posicionado antes de `SETTINGS` por ser mais relevante a um jogador novo decidindo o que fazer a seguir.

## v2.0 — Fase C: 4ª região (área opcional)

Pedido do desenvolvedor: uma 4ª região jogável. Decidido no plano da v2.0 e confirmado antes de implementar: área **opcional/secreta** dentro do arco atual (não altera o final já escrito do Signal Core), reaproveitando mecanismos existentes (puzzle `sequence`, upgrades já existentes), com tema escolhido pelo desenvolvedor entre opções apresentadas: um **depósito subterrâneo da expedição humana anterior** ("Buried Cache") - aprofunda o lado humano do mistério (Kade, a expedição) em vez do lado alienígena, sem tocar no gancho final.

### Bug/lacuna encontrada ao desenhar a entrada oculta: `requiresDeepScanner` não gateava interação

**Contexto:** o padrão já existente (`hidden-signal-01`) é só `scannable + requiresDeepScanner`, nunca `interactable` ao mesmo tempo - então nunca foi testado se interagir com um objeto assim era bloqueado antes do upgrade. Para a entrada da Buried Cache, o objeto precisa ser as duas coisas (escaneável para ser descoberto, interagível para funcionar como porta).

**Causa raiz:** `findNearestInteractable` (`systems/interactionSystem.ts`) só filtrava por `requiresPuzzleSolved` - nunca verificava `requiresDeepScanner`. Um objeto com as duas flags seria invisível ao scanner sem o upgrade (correto), mas ainda seria **interagível por tecla E** para quem soubesse a posição exata sem nunca ter escaneado nada.

**Decisão:** `findNearestInteractable` ganhou um 5º parâmetro (`hasDeepScanner = false`) e um filtro simétrico ao já existente para `requiresPuzzleSolved`. `GameCanvas.tsx` passa `installedUpgrades.has('deep-scanner')` no mesmo lugar onde já lê essa informação para o scanner.

**Motivo:** a intenção semântica de `requiresDeepScanner` sempre foi "isto não deveria ser alcançável antes do upgrade" - até agora só tinha sido testada pela metade (só o scanner), porque nenhum objeto antes precisava das duas capacidades ao mesmo tempo. Corrigido no sistema (`interactionSystem.ts`), não com um caso especial em `content/regions.ts`, para qualquer objeto futuro com essa combinação de flags se beneficiar automaticamente.

### Sem tile `sealed`, sem `ObjectiveKey` nova - só reaproveitando o que já existe

**Decisão:** `region-4` não introduz nenhum tile `sealed` (evitando a limitação documentada na Fase 7, onde esse tipo está fixado a `ruins-puzzle-01`) - o prêmio (dois fragmentos) é gateado só por `requiresPuzzleSolved` direto no objeto, mesmo padrão do Signal Core (Fase 8). Também não há chamada nova a `setObjective` em `applyExit` para `region-4` - entrar/sair da área não altera `currentObjective`, porque não é uma etapa obrigatória da missão principal.

**Motivo:** ambos os pontos já estavam mapeados como armadilhas conhecidas no plano da v2.0, antes de escrever qualquer conteúdo - a decisão foi só seguir o plano.

### Numeração dos logs (07, 15) encaixa cronologicamente entre os já existentes

**Decisão:** os dois fragmentos novos (`fragment-07`, `fragment-08`) são "Log 07" e "Log 15" - números que caem entre os logs já existentes (03, 11, 19, 24, 31, 33), não depois do último. Ambos são atribuídos a "Kade" (um nome já mencionado, nunca com voz própria, nos logs 11 e 24 do narrador principal) e formam uma pequena subtrama: um achado que ele decide não reportar, e a razão de ele estar isolado na "câmara leste" mencionada depois no Log 24.

**Motivo:** reforça que esta é uma descoberta paralela na mesma linha do tempo da expedição (não um epílogo nem um prólogo), e dá a Kade uma voz própria pela primeira vez - consistente com a diretriz do prompt mestre de história contada por fragmentos que o jogador monta mentalmente, não exposição direta. Rascunho de texto aprovado seguindo o mesmo processo já documentado em `AI_DEVELOPMENT.md`.

### `REGION_GROUND_PALETTES`/`REGION_SPAWN_POINTS`: entradas adicionadas antes de esquecer

**Decisão:** `region-4` ganhou paleta própria (tons terrosos escuros, sem nada alienígena - contraste deliberado com as outras 3) e ponto de spawn para "Continue" - os dois pontos que o plano da v2.0 já sinalizava como fáceis de esquecer (fallback silencioso para a paleta da Landing Zone; jogador preso na região errada ao continuar um save).

**Verificação:** fluxo completo testado de ponta a ponta via injeção de save (Deep Scanner instalado) + navegação real no dev server - escanear a entrada, entrar, resolver o puzzle na ordem certa, coletar os dois fragmentos, conferir a contagem no inventário (atualiza para "/8" automaticamente, sem nenhuma mudança de código além do conteúdo) e sair de volta à Landing Zone. Confirmado por leitura do estado salvo (`localStorage`), não só pela tela - o objetivo da missão (`currentObjective`) permaneceu `exploreLandingZone` durante todo o percurso, confirmando que a área realmente não interfere na progressão principal.

### Correções pós-revisão do desenvolvedor (Fase C)

Dois problemas reportados depois de jogar a Fase C de verdade.

#### Fragmentos "travados" (antes do puzzle resolvido) pareciam quebrados, não bloqueados

**Causa raiz:** `renderInteractables` (`GameCanvas.tsx`) só verificava `object.interactable` para decidir o que desenhar - nunca `requiresPuzzleSolved`. Um objeto gateado por um puzzle ainda não resolvido renderizava **idêntico** a um já liberado (mesma cor, mesmo formato, sem nenhuma pista visual), mas não respondia à tecla E porque `findNearestInteractable` (corretamente) o excluía. Resultado: o jogador via um triângulo de fragmento, andava até ele, apertava E, e "nada acontecia" - sem nenhuma explicação na tela.

**Por que só apareceu agora:** é a primeira vez que um objeto do tipo `memoryFragment` (ou qualquer tipo renderizado nesta função) usa `requiresPuzzleSolved` - o único precedente (`signal-core`) tem o mesmo problema em teoria, mas na prática o jogador resolve o puzzle bem ao lado dele antes de tentar interagir, o que mascarava o bug.

**Decisão:** `renderInteractables` ganhou um parâmetro `solvedPuzzles` e passou a desenhar qualquer objeto com `requiresPuzzleSolved` não satisfeito a **35% de opacidade** (`ctx.globalAlpha`), independente do seu tipo (fragmento, switch, círculo genérico) - reaproveitando o mesmo `solvedPuzzles` que `findNearestInteractable` já usa, então as duas funções nunca podem discordar sobre o que está bloqueado.

**Motivo:** corrigido na função de renderização genérica, não com um caso especial para `memoryFragment` - o mesmo problema existia (silenciosamente) para `signal-core` e vale para qualquer objeto futuro com essa combinação de flags. Opacidade reduzida (em vez de esconder o objeto por completo) foi escolhida porque o jogador já pode ver o objeto fisicamente na sala (não há parede escondendo-o, diferente do antigo tile `sealed`) - esconder completamente seria inconsistente com o que os olhos do jogador já mostram.

**Verificação:** não só visual - o teste amostrou o pixel do canvas no centro do triângulo antes e depois de resolver o puzzle (`ctx.getImageData`) e confirmou opacidade efetiva de ~0,30 travado contra ~0,85 destravado (a cor-base do fragmento já tem alpha 0,85; 0,85 × 0,35 ≈ 0,30), batendo com o valor esperado.

#### Botões de cor do robô em Settings ficavam com fundo transparente

**Causa raiz:** mesma categoria do bug do hover/`[data-active]` já corrigido na Fase A - `.swatchButton { background: var(--swatch-color) }` e a regra compartilhada `.button { background: rgba(11, 13, 18, 0.4) }` têm a **mesma especificidade** (uma classe cada). O desempate depende de qual regra aparece por último no CSS final, e essa ordem mudou ao longo da v2.0 conforme mais componentes passaram a usar `composes: button from hudPanel.module.css` (cada um reinjeta o texto da regra compartilhada na posição do seu próprio arquivo) - em algum ponto, uma dessas reinjeções passou a cair depois de `.swatchButton` no bundle, apagando a cor de fundo de volta para o cinza-escuro padrão.

**Decisão:** `.swatchButton.swatchButton { background: var(--swatch-color) }` - seletor duplicado de propósito, não erro de digitação. Repetir a mesma classe soma especificidade (de 0,1,0 para 0,2,0), o que garante vencer a regra compartilhada **sempre**, não só na ordem de bundling atual.

**Motivo:** mesmo padrão de correção já usado no bug do hover (resolver por especificidade, não torcer para a ordem do bundler ficar favorável) - a raiz é a mesma classe de problema (duas regras de mesma especificidade competindo por uma propriedade, vindas de arquivos `composes` diferentes), então a mesma categoria de fix se aplica. Vale ter em mente para qualquer botão futuro que precise sobrescrever uma propriedade que a classe `.button` compartilhada já define.

**Lição geral desta fase:** os três problemas encontrados via revisão manual (2 aqui + o `requiresDeepScanner`/interação da seção anterior) reforçam algo já registrado antes: combinações de flags/composição **nunca antes exercitadas** - mesmo reaproveitando sistemas "já testados" - podem esconder lacunas que só aparecem quando um caso de uso novo as força a interagir de um jeito novo.

## v2.1 — Polish visual de mapas e itens

Pedido do desenvolvedor: revisar o visual dos mapas (tiles) e itens do mundo, sem alterar mecânica. Escopo mantido só em renderização (`GameCanvas.tsx`) e no painel de inventário - nenhuma mudança em `content/regions.ts`, sistemas de colisão/interação ou nos testes existentes.

### Bug encontrado: `buried-cache-entrance` renderizava visível antes do Deep Scanner

**Contexto:** exatamente a mesma categoria de lacuna já documentada na Fase C (ver "lição geral" acima), agora numa combinação de flags diferente: `buried-cache-entrance` é o primeiro objeto do jogo a ser `scannable + interactable + requiresDeepScanner + exit` ao mesmo tempo. `hidden-signal-01` (único precedente de `requiresDeepScanner`) nunca é `interactable`, então o caminho de código de `renderInteractables` com esse gate nunca tinha sido exercitado.

**Causa raiz:** `renderInteractables` (`GameCanvas.tsx`) filtrava só por `object.interactable`, nunca por `requiresDeepScanner` - diferente de `renderScannables` e de `findNearestInteractable` (`interactionSystem.ts`), que já tinham esse filtro. Resultado: a "porta" da entrada secreta (retângulo cor `EXIT_COLOR`) aparecia no mapa da Landing Zone mesmo sem o Deep Scanner instalado - a tecla E não fazia nada nela (`interactionSystem.ts` bloqueava corretamente), mas o objeto inteiro deixava de ser secreto, bastava o jogador ver o retângulo e ir até lá.

**Decisão:** `renderInteractables` ganhou um parâmetro `hasDeepScanner` e o mesmo `if (object.requiresDeepScanner && !hasDeepScanner) continue;` já usado em `renderScannables`/`interactionSystem.ts` - o objeto some da tela por completo (não fica dimmed como o caso de `requiresPuzzleSolved`), porque semanticamente é "isto não deveria existir aos olhos do jogador ainda", não "isto existe mas está bloqueado".

**Verificação:** navegação real no dev server (Playwright) - screenshot no ponto exato da entrada sem o upgrade (nada visível) e depois de coletar um `ancient-component` (que auto-instala o Deep Scanner via `upgradeSystem`), no mesmo ponto (anel de destaque de "mais próximo interagível" aparece, confirmando que o objeto passou a ser considerado).

### Técnica única de "vidro" para todo objeto do mundo (glow + contorno + brilho especular)

**Contexto:** cada forma-placeholder (porta, coletável, switch, fragmento, scannable) era um preenchimento sólido (`fillRect`/`arc`/triângulo) sem contorno nem profundidade - só o robô (`renderPlayer`) já tinha um tratamento mais trabalhado (gradiente no chassi, glow via `shadowBlur` na lente, ponto de brilho especular).

**Decisão:** todo objeto do mundo (exceto decorações, que já tinham variação orgânica própria) ganhou o mesmo tratamento de três camadas: `shadowBlur` na cor do próprio objeto (glow), `strokeStyle` escuro fixo (`OBJECT_OUTLINE_COLOR`) como contorno, e um pequeno círculo branco translúcido (`OBJECT_HIGHLIGHT_COLOR`) simulando reflexo de luz.

**Alternativas consideradas:** um gradiente radial por objeto (`createRadialGradient`), mais próximo do gradiente do chassi do robô.

**Motivo:** gradiente radial aloca um `CanvasGradient` novo por objeto a cada frame - custo desnecessário para formas pequenas (10-20px) onde a diferença visual contra um glow + brilho especular seria mínima. A combinação escolhida reaproveita exatamente a técnica já validada em `renderPlayer` (lente), em vez de inventar um segundo tratamento visual - um placeholder vetorial e outro não deveriam "pertencer" a linguagens visuais diferentes só porque foram desenhados em funções diferentes.

**Silhuetas mantidas intactas:** nenhuma forma, tamanho ou posição mudou (retângulo=porta, quadrado=coletável, círculo=switch/interagível genérico, triângulo=fragmento, losango=scannable) - o jogador já aprendeu essa linguagem visual; só o "material" de cada forma mudou.

### Tiles ganharam decoração por tipo via callback opcional

**Contexto:** `renderTiles` é uma função genérica compartilhada por wall/hazard/sealed, cada um só variando cor de preenchimento/borda. Hazard e sealed precisavam de um desenho extra (faixas de risco; ícone de cadeado) que não faz sentido no tipo wall, então não podia entrar direto no corpo da função sem um `if` de tipo dentro dela.

**Decisão:** `renderTiles` ganhou um parâmetro opcional `decorate?: TileDecorator` (uma função `(ctx, x, y, w, h) => void`), chamado depois do `fillRect`/`strokeRect` de cada tile. Três funções pequenas (`decorateWallTile`, `decorateHazardTile`, `decorateSealedTile`) implementam o desenho extra de cada tipo e são passadas pelo call site correspondente.

**Alternativas consideradas:** três funções de render totalmente separadas (uma por tipo de tile, sem compartilhar o loop).

**Motivo:** callback opcional mantém o loop principal (iterar tiles + converter para tela) escrito uma única vez, sem duplicar essa parte em três funções quase idênticas - o `TileDecorator` isola só a parte que realmente varia por tipo. Hazard usa clip + linhas diagonais (fita de risco); sealed usa um ícone de cadeado com glow (não deveria se confundir com o hazard, que é "perigo", não "trancado"); wall usa um bisel simples sem `shadowBlur` (tiles de parede se repetem muito - todo o perímetro de cada região -, então evitar glow neles mantém o custo por frame previsível).

### Cor de item centralizada em `content/itemColors.ts`, compartilhada entre canvas e inventário

**Contexto:** o quadrado do coletável no mundo (`GameCanvas.tsx`) usava uma única cor (`COLLECTIBLE_COLOR`) para qualquer `collectible.type` - `energy-cell` (resource) e `ancient-component` (component) eram visualmente idênticos no chão. O painel de inventário (`InventoryPanel.tsx`), por sua vez, era só texto, sem nenhuma cor.

**Decisão:** novo módulo `content/itemColors.ts`, exportando `ITEM_TYPE_COLORS` (um record por `InventoryItem['type']`) e `FRAGMENT_COLOR`. `GameCanvas.tsx` usa `ITEM_TYPE_COLORS[object.collectible.type]` para colorir o coletável no mundo; `InventoryPanel.tsx` usa a mesma constante para um marcador quadrado ao lado do nome do item (mesma técnica de custom property `--icon-color` já usada em `SettingsScreen.tsx` para os swatches de cor do robô).

**Alternativas consideradas:** manter as cores duplicadas (uma constante em `GameCanvas.tsx`, outra em CSS/inline no `InventoryPanel`).

**Motivo:** sem uma fonte única, as duas telas podiam divergir silenciosamente com o tempo (alguém muda a cor no canvas e esquece o painel, ou vice-versa) - o mesmo raciocínio já aplicado a `content/robotColors.ts` (cor do robô compartilhada entre `GameCanvas` e `SettingsScreen`). Efeito colateral bem-vindo: agora dá pra diferenciar `resource` de `component` também no chão (antes eram a mesma cor), não só no inventário.

**Screenshots:** os quatro screenshots referenciados no `README.md` (`main-menu`, `gameplay-landing-zone`, `scanner-detection`, `inventory-panel`) foram todos regerados via Playwright depois desta fase - o `main-menu.png` já estava desatualizado desde a fase do retrato vetorial do ECHO-7 (v2.0 seguinte), sem ter sido notado antes.

## v2.1 — Anatomia do robô: pés destacados, braços e sinal de radar na antena

Pedido do desenvolvedor: deixar o ECHO-7 mais bonito - pés mais destacados, braços, e a antena "sinalizando" quando o scanner estiver ativo. Escopo só em `renderPlayer` (`GameCanvas.tsx`) e no retrato estático do menu (`MainMenu.tsx`) - nenhuma mudança em colisão, tamanho de sprite (`player.size` continua 32x32) ou em qualquer sistema de jogo.

### Pés e braços desenhados com o mesmo vocabulário visual do chassi

**Contexto:** as "esteiras/pés" existiam desde a Fase 2, mas como um retângulo solido sem contorno - a única peça do robô sem o tratamento de contorno (`palette.outline`) que o chassi já tinha desde o início.

**Decisão:** pernas ganharam contorno (`palette.outline`) e um friso claro (`palette.light`) no meio, simulando uma junta/esteira em vez de um bloco liso; ficaram ligeiramente maiores (11x8 em vez de 10x7). Braços são peças novas - pequenos retângulos (`palette.leg`, mesmo material das pernas) presos nas laterais do chassi, na altura do "ombro", desenhados **antes** do chassi (mesma ordem já usada para as pernas) para que o próprio corpo cubra a junta e só o toco externo do braço fique visível.

**Animação:** braços balançam em contrafase com as pernas (`Math.sin(walkPhase + Math.PI)`, contra `Math.sin(walkPhase)` das pernas) - contrapeso natural de quem anda, reaproveitando a mesma variável `walkPhase` já calculada, sem introduzir um segundo relógio de animação.

**Motivo:** contorno + friso é o mesmo tratamento de duas camadas já usado nos objetos do mundo (v2.1 anterior) e no chassi do robô - em vez de inventar um terceiro vocabulário visual só para os pés. Braços na cor `palette.leg` (não `palette.body`) para se lerem como "acessório mecânico", a mesma categoria visual das pernas, não uma extensão do chassi principal.

### Sinal de radar na antena, condicionado a `isScannerActive`

**Contexto:** a ponta da antena já pulsava (glow ambar) o tempo todo, independente do jogador ter ligado o scanner (`Q`) ou não - não havia nenhuma pista visual no próprio robô de que o scanner estava ativo, só o painel `ScannerOverlay` no canto da tela.

**Decisão:** `renderPlayer` ganhou um parâmetro `isScannerActive`. Quando verdadeiro, dois anéis concêntricos (cor ciano, mesmo tom de `PLAYER_LENS_GLOW`) se expandem e desaparecem a partir da ponta da antena, defasados em meio período um do outro (para nunca haver um instante sem nenhum anel visível). O pulso ambar da ponta (identidade do robô) continua igual, os anéis são só um efeito adicional.

**Alternativas consideradas:** trocar a cor da ponta da antena inteira para ciano enquanto o scanner estivesse ativo.

**Motivo:** anéis concêntricos expandindo é a metáfora visual mais direta de "emitindo um sinal de radar" - o pedido explícito do desenvolvedor. Trocar a cor da ponta foi descartado por conflitar com o comentário já existente no código (`PLAYER_ANTENNA_TIP_COLOR`/`PLAYER_LENS_GLOW` são a "identidade" fixa do ECHO-7, independente de cor escolhida ou de estado) - o efeito precisava ser aditivo, não substituir a identidade visual já estabelecida. Cor ciano reaproveitada de `PLAYER_LENS_GLOW` em vez de uma nova constante, para o "sinal" parecer que sai do mesmo sensor que já é ciano (a lente), não de uma terceira fonte de cor sem relação com o resto do robô.

### Retrato do menu (`MainMenu.tsx`) replicado, sem animação

**Decisão:** o retrato SVG estático do menu ganhou o mesmo contorno nas pernas e os mesmos braços laterais (em SVG puro, sem `walkPhase`/`isScannerActive` - não há conceito de "andando" ou "scanner ligado" na tela de menu).

**Motivo:** evitar que os dois desenhos do mesmo robô (menu vs. jogo) divirjam visualmente depois desta fase - o retrato do menu já existia como cópia deliberada da anatomia do robô do canvas (ver decisão da fase anterior, "Retrato vetorial do ECHO-7"), então manter os dois em sincronia é a continuação natural dessa decisão, não uma nova.

**Verificação:** conferido visualmente via Playwright com zoom (deviceScaleFactor alto + `clip` na região do robô) - parado, andando (braço/perna em contrafase visíveis) e com o scanner ligado (anéis visíveis na antena, ausentes quando desligado). Typecheck, oxlint e os 123 testes automatizados sem alteração - mudança 100% de renderização.

## Correções de mobile: câmera "longe" e seleção de texto vazando do D-pad

Dois problemas reportados pelo desenvolvedor jogando em celular de verdade.

### Câmera parecia muito mais longe no celular do que no desktop

**Causa raiz:** `computeCanvasSize` dimensiona o *buffer* do canvas em `containerSize * devicePixelRatio` (para não borrar em telas retina), mas o `render()` desenhava o mundo usando `canvas.width`/`canvas.height` (o buffer, em pixels de **dispositivo**) como se fossem pixels CSS, sem nenhum `ctx.scale`/`ctx.setTransform` compensando a diferença. Em desktop (`devicePixelRatio` quase sempre 1), buffer e pixels CSS coincidem e o bug fica invisível. Em celular (`devicePixelRatio` tipicamente 2-3), 1 unidade de mundo (ex: um tile de 64) ocupava só 64 pixels de um buffer 2-3x maior que a tela - ou seja, o tile aparecia visualmente em 1/2 ou 1/3 do tamanho devido, com todo o mundo (e a câmera, centrada no robô) parecendo muito mais "longe" do que no desktop.

**Decisão:** `GameCanvas.tsx` passou a guardar o tamanho do canvas em pixels **CSS** (`canvasCssSizeRef`, preenchido no mesmo `resize()` que já calculava `styleWidth`/`styleHeight`). No início de cada `render()`, `ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0)` (com `scaleX/scaleY = canvas.width / cssWidth`) reescala o contexto para que 1 unidade de mundo volte a ocupar `scaleX` pixels de buffer - o valor certo para preencher a tela sem borrar. Todas as chamadas de `worldToScreen`/render que antes recebiam `canvas.width`/`canvas.height` (pixels de buffer) passaram a receber `canvasWidth`/`canvasHeight` (pixels CSS), já que depois do `setTransform` é nesse sistema de unidades que o resto do código desenha.

**Alternativas consideradas:** aplicar um zoom-in adicional só em telas pequenas (ex: multiplicar por 1.5x quando `containerWidth < 500`).

**Motivo:** a causa raiz não era "a câmera precisa de mais zoom no celular" - era um bug de escala que sempre existiu, só mascarado em telas com `devicePixelRatio` 1. Corrigir o `setTransform` resolve o problema pela raiz (mundo sempre no tamanho visual correto, em qualquer densidade de tela) em vez de adicionar um fator de zoom arbitrário por cima de um bug não corrigido - que exigiria escolher magic numbers por breakpoint e ainda deixaria o bug real (a inconsistência entre buffer e unidades de mundo) sem solução.

**Verificação:** Playwright com `deviceScaleFactor: 3` (simulando um iPhone) - antes da correção um tile ocupava ~1/3 do tamanho visual do desktop; depois, robô e tiles renderizam no mesmo tamanho relativo à tela em qualquer densidade de pixel. Sem mudança nos 4 screenshots do README (todos capturados com `deviceScaleFactor` 1, onde `scaleX`/`scaleY` já eram implicitamente 1 - o bug só afeta densidades >1).

### Toque longo num botão do D-pad selecionava texto de outro painel da tela

**Causa raiz:** os botões do D-pad já tinham `touch-action: none; user-select: none` (`TouchControls.module.css`), mas nada no resto da página impedia o gesto nativo de seleção de texto por toque-e-segure do navegador (Android/iOS) - que, uma vez iniciado, seleciona o texto selecionável mais próximo do ponto de toque na página (ex: o painel do `ScannerOverlay`), independente de onde o toque começou.

**Decisão:** `index.css` (reset global) ganhou `user-select: none` + `-webkit-user-select: none` + `-webkit-touch-callout: none` em `*`/`*::before`/`*::after`, ao lado do `box-sizing: border-box` que já era global.

**Alternativas consideradas:** adicionar `user-select: none` só nos painéis de HUD (`ScannerOverlay`, `MissionHUD`, etc.) um por um.

**Motivo:** ECHO-7 não tem nenhum campo de texto ou conteúdo que precise ser selecionável em lugar nenhum da interface (confirmado: zero `<input>`/`<textarea>` no projeto) - desabilitar globalmente resolve a causa (o gesto de seleção nunca deveria existir neste app) em vez de tapar buraco painel por painel, o que deixaria qualquer painel novo futuro vulnerável ao mesmo bug até alguém lembrar de adicionar a regra nele também.

**Verificação:** Playwright emulando toque (`hasTouch: true`) - toque prolongado (2s) num botão do D-pad, seguido de `window.getSelection().toString()`, retorna string vazia.
