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

### Ambiente de teste `node`, não `jsdom`

**Contexto:** o Vitest precisa de um ambiente de execução (`node` ou `jsdom`, que simula DOM de navegador).

**Decisão:** `environment: 'node'`.

**Motivo:** a lógica de jogo (`engine/`, `systems/`) não deve depender de DOM, por decisão de arquitetura da Fase 0. Usar `node` reforça esse isolamento — se algum sistema de gameplay algum dia "precisar" de DOM para passar num teste, isso é sinal de que ele está violando a separação entre lógica e UI. Quando chegarmos a testar componentes React (não lógica de jogo), adicionamos `jsdom` como dependência pontual.
