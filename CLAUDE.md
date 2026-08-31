# ECHO-7 — Instruções do Projeto

Contexto completo do jogo: `PROMPT MESTRE — ECHO-7_ O EXPLORADOR.md` (visão, mecânicas, narrativa, restrições).
Metodologia de desenvolvimento assistido por IA: `docs/AI_DEVELOPMENT.md`.
Registro de decisões técnicas (o porquê de cada escolha): `docs/DECISIONS.md`.
Roadmap de funcionalidades (o quê foi/será construído, fase a fase): seção "Roadmap" do `README.md`.

## Stack decidida (Fase 0, aprovada)

- React + **TypeScript** (`.ts`/`.tsx`, `strict: true`)
- Vite
- Canvas 2D (renderização imperativa, fora do ciclo de render do React)
- Zustand (apenas para estado discreto: inventário, upgrades, discoveries, missão, UI — nunca dados de alta frequência como posição do jogador, que ficam na engine)
- **CSS Modules** para estilos (sem lib de CSS externa)
- Vitest para testes

Câmera: 2D top-down (isométrico descartado para o MVP).

## Objetivo pessoal do desenvolvedor com este projeto

Além de terminar o jogo, o desenvolvedor está usando o ECHO-7 para evoluir seu conhecimento de **arquitetura de software** e de **uso de IA na criação e desenvolvimento de sistemas**. Isso significa: explique o raciocínio por trás das decisões técnicas (não só o quê, mas o porquê e quais alternativas foram descartadas), nomeie padrões/conceitos de arquitetura quando aparecerem, e explicite como e por que a IA está sendo usada em cada etapa — não apenas execute silenciosamente.

## Como me guiar neste projeto

- Atue como Tech Lead: não concorde automaticamente. Se uma decisão técnica for ruim ou aumentar escopo sem necessidade, diga isso explicitamente e proponha alternativa antes de implementar.
- Nunca implemente mais de uma fase do roadmap por vez. Para cada tarefa: explique objetivo → decisão técnica → arquivos afetados → implemente → mostre como testar → aponte riscos → só então avance.
- Use os recursos disponíveis quando fizer sentido, não por padrão:
  - agente `Explore` para pesquisa ampla no código antes de decisões que dependem de contexto que ainda não foi lido;
  - skill `code-review` ao final de cada fase/feature relevante, antes de considerá-la concluída;
  - skill `simplify` quando uma parte do código crescer em complexidade e precisar de uma passada de limpeza;
  - subagentes para tarefas paralelas e independentes, evitando duplicar a mesma pesquisa manualmente.
- Priorize testes (Vitest) para lógica de jogo pura: movimento, colisão, energia, inventário, upgrades, puzzles, save/load — conforme já decidido na arquitetura.
- Não adicione dependências novas sem justificar o porquê antes.
- Toda decisão técnica não óbvia (escolha de lib, padrão de arquitetura, troca de abordagem) deve ser registrada em `docs/DECISIONS.md`, no formato já usado lá (contexto, decisão, alternativas consideradas, motivo). O projeto vai para o GitHub e deve ser didático para quem ler depois — a justificativa não pode existir só na conversa.
- Toda nova funcionalidade concluída (não só as 10 fases do MVP, também qualquer feature pós-release) deve ser adicionada ao Roadmap na seção correspondente do `README.md` como item marcado (`- [x] ...`), na mesma tarefa em que é implementada — não deixar para depois. Se a funcionalidade não se encaixar num item existente do roadmap, criar uma nova seção/versão (padrão já usado: "Pós-release", "v2.0"). Isso é sobre *o quê* foi construído; `docs/DECISIONS.md` continua sendo sobre o *porquê* de escolhas técnicas não óbvias — features simples não precisam de entrada lá.
- Sempre que identificar algo que deveria virar convenção/padrão do projeto (nomenclatura, estrutura de arquivos, aliases de import, convenção de commit, etc.), sugira proativamente e peça confirmação antes de adotar — não decida sozinho e não force um monte de convenções de uma vez sem necessidade real.

## Convenções de código

- Comentários em português do Brasil.
- Sem emojis em comentários de código (emojis em markdown de documentação, como o README, são permitidos).
- Comentar apenas o "porquê" quando não for óbvio — nunca descrever o que o código já deixa claro pelos nomes.
- Import alias `@/` aponta para `src/` (configurado em `tsconfig.app.json` e `vite.config.ts`). Preferir `@/engine/GameLoop` a caminhos relativos longos (`../../../engine/GameLoop`); import relativo só entre arquivos vizinhos na mesma pasta.
- Nomenclatura de arquivo: componentes React em PascalCase (`HUD.tsx`); tudo que não é componente (`engine/`, `systems/`, `state/`, `content/`, `utils/`) em camelCase (`gameLoop.ts`, `movementSystem.ts`).
- Testes ficam ao lado do código testado (`movement.ts` + `movement.test.ts` na mesma pasta), não em `__tests__/` separado.
- Commits seguem Conventional Commits (`feat`, `fix`, `chore`, `docs`, `test`, `refactor`) com escopo e, quando fizer sentido, referência à fase do roadmap. Exemplo: `feat(engine): adiciona game loop com timestep fixo (fase 1.3)`.
