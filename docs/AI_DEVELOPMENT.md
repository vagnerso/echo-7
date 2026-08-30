# Metodologia de Desenvolvimento Assistido por IA — ECHO-7

Este documento descreve a técnica de desenvolvimento assistido por IA aplicada no projeto ECHO-7, para fins de transparência e como material de referência do processo usado.

## Nome da abordagem

**Desenvolvimento incremental orientado por especificação, com portões de aprovação humana** (spec-driven incremental development with human approval gates).

A ideia central: a IA nunca avança para a próxima unidade de trabalho sem que a anterior tenha sido especificada, implementada, testada e aprovada explicitamente pelo desenvolvedor humano. Não é "vibe coding" — é engenharia com IA como ferramenta, não como piloto automático.

## Princípios aplicados

### 1. Design antes de código

Nenhuma linha de código de jogo foi escrita antes da conclusão da Fase 0: Game Design Document, arquitetura técnica, estrutura de pastas, modelo de dados, roadmap, riscos técnicos e definição exata do MVP. Só depois de aprovação explícita do desenvolvedor a implementação começa.

### 2. Divisão em fases pequenas e testáveis

O roadmap completo (10 fases) é decomposto em tarefas pequenas o suficiente para serem implementadas e testadas isoladamente (ver roadmap na documentação de arquitetura). Nunca múltiplas fases são implementadas de uma vez.

### 3. Ciclo por tarefa

Para cada tarefa, a IA segue a sequência:

1. explicar o objetivo da tarefa;
2. explicar a decisão técnica envolvida;
3. listar os arquivos que serão criados ou modificados;
4. implementar;
5. mostrar o código;
6. explicar como testar;
7. identificar possíveis problemas;
8. só então avançar para a próxima tarefa.

### 4. IA em postura de revisão crítica, não concordância automática

A IA atua como Tech Lead: quando uma decisão do desenvolvedor tem um problema técnico identificável, isso deve ser dito explicitamente, junto com uma alternativa, em vez de implementar a ideia como pedida. O mesmo vale para sinalizar aumento de escopo antes que ele aconteça, não depois.

Exemplo já aplicado neste projeto: a IA recomendou câmera 2D top-down (em vez de isométrica) e recomendou manter dados de alta frequência (posição do jogador) fora do estado gerenciado por Zustand, para evitar re-renderizações desnecessárias do React durante o gameplay — ambos pontos levantados antes de qualquer código ser escrito.

### 5. Separação de responsabilidades como facilitador de geração de testes

A lógica de jogo (`systems/`, `engine/`) é isolada de React deliberadamente. Isso não é só uma preferência arquitetural — torna possível pedir à IA testes de unidade com alta confiança, já que cada sistema tem contrato de entrada/saída claro e não depende de renderização ou DOM.

### 6. Conteúdo separado de lógica

Dados narrativos e de balanceamento (itens, regiões, fragmentos de memória, puzzles, upgrades) ficam em `content/`, separados do código que os processa (`systems/`). Isso permite que a IA gere ou ajuste rascunhos de conteúdo (texto de fragmentos, descrições de scan) sem tocar em lógica que já foi revisada e testada.

## Divisão de responsabilidades: IA vs. desenvolvedor

| Tarefa | Responsável |
|---|---|
| Scaffolding (Vite, configs, estrutura de pastas) | IA |
| Sistemas com contrato claro (movement, collision, energy, save/load) | IA, com revisão humana |
| Geração de casos de teste a partir das regras descritas | IA |
| Rascunho de texto narrativo (fragmentos, descrições) | IA propõe, humano ajusta tom |
| Documentação (README, comentários de arquitetura) | IA |
| Refatoração e detecção de code smells | IA |
| Calibração de "feel" do jogo (velocidade, drenagem de energia, dificuldade) | Desenvolvedor |
| Direção narrativa final (tom, quanto revelar, o twist) | Desenvolvedor |
| Cortes de escopo | Desenvolvedor |
| Aprovação de qualquer mudança de arquitetura | Desenvolvedor |
| Direção de arte final | Desenvolvedor |

## Onde a IA foi usada, com exemplos reais deste projeto

| Categoria | Como apareceu neste projeto |
|---|---|
| **Brainstorming** | Fase 8: antes de escrever qualquer fragmento de memória, a IA propôs um esboço do arco narrativo (o que cada região revela, a natureza do Signal Core) para o desenvolvedor aprovar ou ajustar - incluindo o pedido explícito de fechar com um gancho de continuação, incorporado depois do esboço inicial. |
| **Arquitetura** | A Fase 0 inteira (GDD, camadas, modelo de dados, riscos) foi produzida antes de qualquer código. Decisões estruturais continuaram surgindo depois: por exemplo, `WorldObject.kind` (um enum) virou flags de capacidade independentes (`interactable?`, `scannable?`...) na Fase 6, quando um segundo caso de uso mostrou que o enum não escalava. |
| **Implementação** | As dez fases do roadmap do MVP, cada uma com sistemas isolados e testados antes de avançar para a próxima (movimento, colisão, scanner, puzzle, upgrades, narrativa, polish). O mesmo processo (objetivo → decisão → arquivos → implementação → teste → riscos, uma fase por vez) continuou depois do MVP: polish visual (robô, cenário, UI, comandos) e depois internacionalização + customização de cor, cada uma dividida e aprovada em fases separadas. |
| **Debugging** | Um bug real foi encontrado em revisão própria antes de testar no navegador (Fase 6): a primeira versão da instalação automática de upgrades usava um snapshot único do inventário, o que permitiria que um único componente "pagasse" por dois upgrades que exigem 1 unidade cada. Corrigido reavaliando o estado a cada instalação. Outro exemplo (Fase 7): um ponto de retorno entre regiões foi projetado, sem querer, dentro de uma área que só é acessível com um upgrade específico - um softlock em potencial, pego relendo a posição contra a geometria da região antes de testar. |
| **Testes** | 118 testes automatizados, escritos ao lado de cada sistema (`arquivo.ts` + `arquivo.test.ts`), priorizando lógica de jogo pura conforme a seção 20 do prompt mestre. |
| **Refactoring** | Fase 6: o enum de tipo de objeto virou flags (acima). Fase 7: `getRegionObstacles` (só paredes) foi generalizado para `getObstaclesForTileType` quando o tile `hazard` precisou do mesmo tratamento, evitando duplicar a função inteira. |
| **Conteúdo** | Rascunhos de texto (os seis fragmentos de memória, as descrições dos objetos escaneáveis) foram propostos pela IA e aprovados/ajustados pelo desenvolvedor antes de entrarem no jogo - nunca decididos unilateralmente, já que direção narrativa é explicitamente decisão do desenvolvedor (seção 27 do prompt mestre). |
| **Documentação** | Os três documentos deste projeto (`AI_DEVELOPMENT.md`, `DECISIONS.md`, `ARCHITECTURE.md`) e o README foram escritos pela IA e atualizados a cada fase concluída, não só no final. |

## Convenções de código resultantes deste processo

- TypeScript em todo o projeto, modo `strict`.
- Comentários de código em português do Brasil.
- Sem emojis em comentários de código.
- Comentário apenas quando o "porquê" não é óbvio pelo código (uma decisão não evidente, uma restrição escondida, um workaround) — nunca descrevendo o que o código já deixa claro pelos nomes usados.
