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

## Convenções de código resultantes deste processo

- TypeScript em todo o projeto, modo `strict`.
- Comentários de código em português do Brasil.
- Sem emojis em comentários de código.
- Comentário apenas quando o "porquê" não é óbvio pelo código (uma decisão não evidente, uma restrição escondida, um workaround) — nunca descrevendo o que o código já deixa claro pelos nomes usados.
