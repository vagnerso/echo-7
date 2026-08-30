# Arquitetura — ECHO-7

Este documento descreve a arquitetura implementada, como visão geral. O porquê de cada decisão específica está em [`DECISIONS.md`](DECISIONS.md), organizado por fase de desenvolvimento.

## Camadas

```
React (App.tsx)
   |
UI / HUD / Menus / Overlays        (components/)
   |
Game State                          (state/ - Zustand: gameStore, uiStore)
   |
Bridge                               (hooks/useGameLoop)
   |
Game Engine                         (engine/ - loop, input, camera, canvas, particulas, audio)
   |
Game Systems                        (systems/ - movimento, colisao, interacao, scanner, puzzle, upgrades)
   |
World / Entities / Content          (world/, entities/, content/)
```

**Regra central:** o código de `engine/`, `systems/`, `entities/`, `world/` e `content/` nunca importa nada de React. Isso é o que torna a lógica de jogo testável sem precisar de DOM/jsdom — os 101 testes automatizados do projeto rodam contra essas camadas diretamente.

## Estado: três lugares diferentes, de propósito

| Onde | O quê | Exemplo |
|---|---|---|
| Refs dentro do `GameCanvas` | Estado "quente", muda a cada frame | posição do jogador, câmera, partículas |
| `state/uiStore.ts` (Zustand) | Estado de tela, descartável | scanner ativo, inventário aberto, fragmento em exibição |
| `state/gameStore.ts` (Zustand) | Progresso do jogador, permanente | inventário, upgrades instalados, puzzles resolvidos, região atual |

Dados de alta frequência (posição, velocidade) nunca entram no Zustand: cada `set()` notifica componentes React inscritos, e fazer isso a ~60 vezes por segundo geraria re-renderizações desnecessárias. O `GameCanvas` lê/escreve as stores de forma imperativa (`getState()`/`setState()`) dentro do loop, e só quando um valor realmente muda — nunca via hook, que é para uso em render de componente.

## Game loop

`engine/gameLoop.ts` implementa um loop de passo fixo (fixed timestep) sobre `requestAnimationFrame`: a simulação (`update`) sempre avança em incrementos de tempo idênticos, independente da taxa de atualização da tela; a renderização (`render`) roda uma vez por frame e recebe um `alpha` para interpolar visualmente entre o último passo e o próximo, evitando perda de suavidade. A matemática do acumulador (`engine/fixedTimestep.ts`) é pura e testada isoladamente do `requestAnimationFrame` real.

`hooks/useGameLoop.ts` é a única ponte entre esse loop e o ciclo de vida do React.

## Mundo: regiões, objetos e capacidades

Uma `Region` (`world/region.ts`) é um grid de tiles (`floor`/`wall`/`hazard`/`sealed`) mais uma lista de `WorldObject`. Um objeto do mundo não tem um "tipo" fixo - ele acumula **capacidades** via flags opcionais (`interactable`, `scannable`, `collectible`, `puzzleSwitch`, `exit`, `memoryFragment`, `triggersEnding`, `requiresDeepScanner`, `requiresPuzzleSolved`). Isso permite que um mesmo objeto combine comportamentos (ex: um console poderia ser interagível e escaneável ao mesmo tempo) sem um enum que cresceria a cada novo tipo.

Tiles `hazard` e `sealed` bloqueiam colisão condicionalmente - o primeiro até o jogador ter o upgrade Magnetic Boots, o segundo até um puzzle ser resolvido. O `GameCanvas` monta a lista de obstáculos de cada frame combinando paredes (sempre) com esses tiles condicionais, consultando a `gameStore`.

`content/` guarda os dados de verdade (as três regiões, os puzzles, os upgrades, os fragmentos de memória) - sempre estático e imutável; qualquer coisa que mude durante uma partida (o que já foi coletado, ativado, resolvido) vive em estado de sessão (refs do `GameCanvas`) ou na `gameStore`, nunca mutando o conteúdo.

## Estrutura de pastas

```
src/
  components/    # UI React (HUD, menus, overlays, painéis) - nunca importa engine/systems diretamente, só state/
  engine/        # game loop, input, câmera, canvas, partículas, áudio - sem React
  systems/       # lógica de gameplay pura (movimento, colisão, interação, scanner, puzzle, upgrades)
  entities/      # tipos das principais entidades (Player, Discovery, InventoryItem, Puzzle, Upgrade, MemoryFragment)
  world/         # modelo de região/tile/objeto e funções de carregamento (worldLoader)
  content/       # dados estáticos do jogo (regiões, puzzles, upgrades, fragmentos)
  state/         # stores Zustand (gameStore, uiStore)
  hooks/         # ponte entre React e a engine (useGameLoop)
  assets/        # (reservado; nenhum asset de imagem/áudio ainda - tudo é desenhado por código ou sintetizado)
```

Cada arquivo `*.test.ts` fica ao lado do arquivo testado (ver [`DECISIONS.md`](DECISIONS.md), decisão da Fase 1.1).

## Fluxo de uma interação típica (tecla E)

1. `GameCanvas` calcula `findNearestInteractable` a cada passo fixo, considerando o alcance e quaisquer gates (`requiresPuzzleSolved`).
2. Se a tecla E foi **pressionada agora** (não "está pressionada" - ver `InputManager.wasActionJustPressed`), o objeto mais próximo decide o que acontece, por ordem de prioridade: saída de região → gatilho de encerramento → switch de puzzle → fragmento de memória → item colecionável → alternância padrão.
3. Cada ramo escreve na `gameStore`/`uiStore` conforme o caso (coletar item, resolver puzzle, mudar de região) e dispara o feedback sensorial correspondente (som, partícula).

Essa ordem de prioridade e as decisões por trás de cada capacidade estão detalhadas, fase a fase, em [`DECISIONS.md`](DECISIONS.md).
