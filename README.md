# ECHO-7 — The Last Signal

Jogo de exploração sci-fi para navegador. Você controla ECHO-7, um robô explorador enviado para investigar um planeta alienígena aparentemente abandonado — explorando, escaneando e reconstruindo aos poucos o mistério por trás de uma transmissão misteriosa.

## 🎮 Play

**[vagnerso.github.io/echo-7](https://vagnerso.github.io/echo-7/)**

Roda direto no navegador, sem instalação. Requer teclado (sem suporte a touch/mobile nesta versão). Disponível em **Inglês** (padrão) e **Português do Brasil**, com cor do robô customizável — ambos em Settings, no menu principal.

**Controles:** `WASD`/setas para mover · `E` interagir · `Q` scanner · `I` inventário/upgrades/fragmentos. Também exibidos na tela durante o jogo.

## 📸 Screenshots

| Menu | Exploração |
|---|---|
| ![Menu principal](docs/screenshots/main-menu.png) | ![Explorando a Landing Zone](docs/screenshots/gameplay-landing-zone.png) |

| Scanner | Inventário |
|---|---|
| ![Scanner detectando um objeto](docs/screenshots/scanner-detection.png) | ![Painel de inventário](docs/screenshots/inventory-panel.png) |

## 🧠 AI-Assisted Development

Este projeto é usado deliberadamente como demonstração de **engenharia assistida por IA**, não como "vibe coding": design e arquitetura foram definidos e aprovados antes de qualquer código (Fase 0), o desenvolvimento avançou em fases pequenas e testáveis (dez para o MVP, mais outras depois do release), e toda decisão técnica não óbvia foi documentada com o porquê — inclusive os bugs reais encontrados e corrigidos ao longo do caminho.

- [`docs/AI_DEVELOPMENT.md`](docs/AI_DEVELOPMENT.md) — a metodologia usada, com uma tabela de exemplos reais de onde a IA entrou (brainstorming, arquitetura, implementação, debugging, testes, refactoring, conteúdo, documentação).
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — registro de toda decisão técnica não óbvia, fase a fase, com contexto, alternativas consideradas e motivo.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — visão geral da arquitetura implementada.
- [`PROMPT MESTRE — ECHO-7_ O EXPLORADOR.md`](<PROMPT MESTRE — ECHO-7_ O EXPLORADOR.md>) — a especificação original do jogo (visão, mecânicas, narrativa, restrições) que guiou todo o desenvolvimento.

## 🏗️ Architecture

```
React (App.tsx)
   |
UI / HUD / Menus / Overlays        (components/)
   |
Game State                          (state/ - Zustand)
   |
Game Engine                         (engine/ - loop, input, câmera, partículas, áudio)
   |
Game Systems                        (systems/ - movimento, colisão, interação, scanner, puzzle, upgrades)
   |
World / Entities / Content          (world/, entities/, content/)
```

Nenhuma dessas camadas abaixo de `components/` importa React — é isso que torna a lógica de jogo testável sem DOM. Detalhes completos em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🛠️ Tech Stack

- React + TypeScript (`strict` mode)
- Vite
- Canvas 2D (renderização da engine, fora do ciclo de render do React)
- Zustand (estado discreto de UI/jogo — não dados de alta frequência como posição)
- CSS Modules
- Vitest
- oxlint + Prettier
- Web Audio API (áudio sintetizado por código, sem arquivos de som)

## 🚀 Getting Started

Requer Node.js 22+.

```bash
npm install
npm run dev        # inicia o servidor de desenvolvimento
npm run build      # build de produção (type-check + bundle)
npm run test       # roda os testes (Vitest)
npm run lint       # roda o lint (oxlint)
npm run format     # formata o código (Prettier)
```

## 🧪 Testing

Testes ficam ao lado do código testado (`arquivo.ts` + `arquivo.test.ts`), priorizando lógica de jogo pura (`engine/`, `systems/`, `state/`, `save/`) — 118 testes automatizados no total. Ver critérios de teste em [`docs/DECISIONS.md`](docs/DECISIONS.md).

## 📁 Project Structure

```
src/
  components/    # UI React (HUD, menus, overlays, painéis)
  engine/        # game loop, input, câmera, canvas, partículas, áudio - sem React
  systems/       # lógica de gameplay pura (movimento, colisão, interação, scanner, puzzle, upgrades)
  entities/      # tipos das principais entidades (Player, Discovery, InventoryItem, Puzzle, Upgrade, MemoryFragment)
  world/         # modelo de região/tile/objeto e carregamento de mundo
  content/       # dados estáticos do jogo (regiões, puzzles, upgrades, fragmentos, cores do robô) - só identidade, sem texto
  i18n/          # dicionário de tradução (Inglês/Português-BR)
  state/         # stores Zustand (gameStore, uiStore, settingsStore)
  save/          # persistência em localStorage, versionada (progresso e preferências, separados)
  styles/        # CSS compartilhado entre componentes de UI
  hooks/         # ponte entre React e a engine/i18n
```

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para o propósito de cada pasta em detalhe.

## 🗺️ Roadmap

**MVP (vertical slice):**

- [x] Fase 0 — Planejamento (GDD, arquitetura, decisões técnicas)
- [x] Fase 1 — Bootstrap (setup, canvas responsivo, game loop, tela inicial)
- [x] Fase 2 — Robot (ECHO-7, movimento, câmera, colisão)
- [x] Fase 3 — World (mapa, tiles, interação)
- [x] Fase 4 — Scanner
- [x] Fase 5 — Inventory
- [x] Fase 6 — Upgrades
- [x] Fase 7 — Puzzles (sistema de sequência + Região 2/Ancient Ruins)
- [x] Fase 8 — Narrative (Memory Fragments, missão, Região 3/Signal Core, Puzzle #2, final da vertical slice)
- [x] Fase 9 — Polish (partículas, transição de tela, áudio sintetizado)
- [x] Fase 10 — Release (GitHub Pages, save/load, documentação final)

**Pós-release:**

- [x] Polish visual — robô com chassi/pernas/antena animados, terreno procedural por região, UI com estilo compartilhado (glow, cantos técnicos, scanline), painel de comandos na tela
- [x] Internacionalização — Inglês (padrão) e Português do Brasil, dicionário customizado tipado, tela de Settings
- [x] Customização — cor do robô (5 opções), preferências persistidas separadas do progresso de jogo

**v2.0:**

- [x] Fase A — Controles mobile (suporte a telas de toque)
- [x] Fase B — Tutorial ("HOW TO PLAY" no menu principal)
- [x] Fase C — Região opcional 4 ("Buried Cache")
- [x] Tela inicial — retrato vetorial do ECHO-7 (reaproveitando a paleta de cor do robô), créditos do desenvolvedor no rodapé

**v2.1:**

- [x] Polish visual de mapas e itens — glow/contorno/brilho especular consistente em todo objeto do mundo (porta, coletável, switch, fragmento, scannable), faixas de risco nos tiles de hazard, ícone de cadeado nos tiles selados, bisel nas paredes, cor por tipo de item compartilhada entre o mundo e o inventário
- [x] Correção: entrada secreta da Buried Cache não vazava mais um marcador visível no mapa antes do Deep Scanner instalado
- [x] Anatomia do robô — pés com contorno e friso de esteira, braços laterais com balanço em contrafase ao caminhar, sinal de radar (anéis na antena) quando o scanner está ativo

A vertical slice está completa: dá para jogar do início (Landing Zone) até o final do primeiro arco narrativo (Signal Core), com progresso salvo automaticamente. Próximos passos possíveis: continuação da história (o final termina com um gancho proposital), mais idiomas, sprites/arte de verdade (hoje 100% vetorial).

> Este roadmap é o registro histórico de fases já concluídas. Toda nova funcionalidade deve ser adicionada aqui como um novo item (ou uma nova seção de versão) assim que for concluída — ver regra correspondente no `CLAUDE.md`.
