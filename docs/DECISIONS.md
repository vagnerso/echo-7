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

### Ambiente de teste `node`, não `jsdom`

**Contexto:** o Vitest precisa de um ambiente de execução (`node` ou `jsdom`, que simula DOM de navegador).

**Decisão:** `environment: 'node'`.

**Motivo:** a lógica de jogo (`engine/`, `systems/`) não deve depender de DOM, por decisão de arquitetura da Fase 0. Usar `node` reforça esse isolamento — se algum sistema de gameplay algum dia "precisar" de DOM para passar num teste, isso é sinal de que ele está violando a separação entre lógica e UI. Quando chegarmos a testar componentes React (não lógica de jogo), adicionamos `jsdom` como dependência pontual.
