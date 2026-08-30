# ECHO-7 — The Last Signal

Jogo de exploração sci-fi para navegador. Você controla ECHO-7, um robô explorador enviado para investigar um planeta alienígena aparentemente abandonado — explorando, escaneando e reconstruindo aos poucos o mistério por trás de uma transmissão misteriosa.

> 🚧 **Projeto em desenvolvimento inicial.** Ainda não há uma versão jogável publicada. Este README será expandido (com screenshots, vídeo e link para jogar) conforme o desenvolvimento avança — ver [🗺️ Roadmap](#️-roadmap).

## 🧠 AI-Assisted Development

Este projeto é usado deliberadamente como demonstração de **engenharia assistida por IA**, não como "vibe coding": design e arquitetura são definidos e aprovados antes de qualquer código, o desenvolvimento avança em fases pequenas e testáveis, e toda decisão técnica não óbvia é documentada com o porquê.

- [`docs/AI_DEVELOPMENT.md`](docs/AI_DEVELOPMENT.md) — a metodologia usada (como IA e desenvolvedor dividem responsabilidades).
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — registro de decisões técnicas, com contexto, alternativas consideradas e motivo.
- [`PROMPT MESTRE — ECHO-7_ O EXPLORADOR.md`](<PROMPT MESTRE — ECHO-7_ O EXPLORADOR.md>) — a especificação original do jogo (visão, mecânicas, narrativa, restrições).

## 🛠️ Tech Stack

- React + TypeScript (`strict` mode)
- Vite
- Canvas 2D (renderização da engine, fora do ciclo de render do React)
- Zustand (estado discreto de UI/jogo — não dados de alta frequência como posição)
- CSS Modules
- Vitest
- oxlint + Prettier

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

## 📁 Project Structure

```
src/
  components/   # UI React (HUD, menus, overlays)
  engine/       # game loop, input, câmera
  systems/      # lógica de gameplay (movimento, colisão, energia, scanner, puzzles)
  entities/     # definições de entidades do jogo
  world/        # regiões e carregamento de mundo
  content/      # dados estáticos (itens, fragmentos, puzzles, upgrades)
  state/        # stores Zustand
  save/         # persistência (localStorage), versionada
  hooks/        # ponte entre React e a engine
```

A estrutura completa está detalhada em [`docs/DECISIONS.md`](docs/DECISIONS.md); pastas acima são criadas conforme a fase correspondente do roadmap chega nelas.

## 🗺️ Roadmap

- [x] Fase 0 — Planejamento (GDD, arquitetura, decisões técnicas)
- [x] Fase 1 — Bootstrap (setup, canvas responsivo, game loop, tela inicial)
- [x] Fase 2 — Robot (ECHO-7, movimento, câmera, colisão)
- [x] Fase 3 — World (mapa, tiles, interação)
- [x] Fase 4 — Scanner
- [x] Fase 5 — Inventory
- [x] Fase 6 — Upgrades
- [x] Fase 7 — Puzzles (sistema de sequência + Região 2/Ancient Ruins; Puzzle #2 fica com a Região 3 na Fase 8)
- [x] Fase 8 — Narrative (Memory Fragments, missão, Região 3/Signal Core, Puzzle #2, final da vertical slice)
- [x] Fase 9 — Polish (partículas, transição de tela, áudio sintetizado)
- [ ] Fase 10 — Release (build, GitHub Pages, documentação final) *(em andamento)*

## 🧪 Testing

Testes ficam ao lado do código testado (`arquivo.ts` + `arquivo.test.ts`), priorizando lógica de jogo pura (`engine/`, `systems/`) — ver [`docs/DECISIONS.md`](docs/DECISIONS.md).
