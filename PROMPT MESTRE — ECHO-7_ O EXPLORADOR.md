# PROMPT MESTRE — ECHO-7: O EXPLORADOR

Quero que você atue como um **Senior Software Engineer, Game Developer, Game Designer e Software Architect**, especialista em:

- React
- JavaScript moderno
- Vite
- Canvas 2D
- Game loops
- Game state management
- Arquitetura de jogos
- Design de jogos indie
- Procedural generation
- UX/UI para jogos web
- Testes automatizados
- Desenvolvimento assistido por IA

Vamos desenvolver juntos um jogo chamado **ECHO-7**, um jogo de exploração sci-fi para navegador.

---

# 1. VISÃO DO PROJETO

**ECHO-7** é um jogo single-player de exploração espacial.

O jogador controla um **robô humanoide explorador**, enviado para investigar um planeta alienígena aparentemente abandonado.

O jogo deve transmitir uma sensação de:

- solidão;
- descoberta;
- curiosidade;
- exploração;
- mistério;
- ficção científica;
- tecnologia antiga;
- mundo desconhecido.

O jogador não precisa enfrentar dezenas de inimigos nem participar de combates complexos.

O foco principal é:

> **explorar → investigar → escanear → resolver puzzles → encontrar fragmentos de memória → descobrir o mistério do planeta.**

Quero que o jogo seja uma experiência relativamente curta, mas polida.

A meta do MVP/vertical slice é aproximadamente **15–30 minutos de gameplay**.

---

# 2. PLATAFORMA E RESTRIÇÕES

O jogo deve:

- rodar diretamente no navegador;
- funcionar sem backend;
- funcionar offline depois que os assets forem carregados;
- não exigir login;
- não possuir servidor próprio;
- salvar progresso usando `localStorage`;
- ser publicado no GitHub;
- poder ser hospedado no GitHub Pages;
- ser responsivo dentro do possível;
- funcionar em desktop usando teclado;
- ter uma arquitetura preparada para futuras expansões.

Stack inicial:

- React
- JavaScript
- Vite
- HTML5
- CSS
- Canvas 2D
- Zustand
- Vitest

Evite TypeScript inicialmente.

Não use backend.

Não use banco de dados.

Não adicione dependências sem justificar.

---

# 3. CONCEITO DO GAMEPLAY

O jogador controla ECHO-7 usando:

- WASD
- setas direcionais

Interações:

- `E` — interagir
- `Q` — scanner
- `I` — inventário
- `ESC` — menu

O jogo deve possuir um pequeno mapa explorável.

Exemplo conceitual:

```text
             🌌 PLANETA

       ┌──────────────────────┐
       │       🪨      🪨      │
       │                      │
       │   RUÍNAS             │
       │      🏛️              │
       │          🤖          │
       │                      │
       │              💠      │
       │                      │
       │   🏠 BASE            │
       │                      │
       └──────────────────────┘
```

O jogador pode:

- caminhar;
- explorar áreas;
- encontrar objetos;
- escanear objetos;
- encontrar recursos;
- acessar estruturas;
- resolver puzzles;
- coletar fragmentos de memória;
- instalar upgrades;
- descobrir mensagens;
- desbloquear novas áreas.

---

# 4. ECHO-7

ECHO-7 é um robô humanoide de exploração.

Ele deve parecer funcional e tecnológico, mas também ter personalidade visual.

Não quero um robô excessivamente militar.

Quero algo mais próximo de:

> explorador científico + máquina de exploração + personagem de ficção científica.

Atributos:

```javascript
{
  integrity: 100,
  energy: 100,
  scannerLevel: 1,
  memoryCapacity: 32,
  inventoryCapacity: 5
}
```

O jogador poderá melhorar esses atributos.

Exemplos:

### Scanner

Nível 1:

- detecta objetos básicos.

Nível 2:

- identifica materiais.

Nível 3:

- detecta sinais ocultos.

Nível 4:

- revela anomalias.

### Energy

A energia diminui ao:

- caminhar;
- utilizar equipamentos;
- escanear;
- ativar determinadas máquinas.

O jogador deve precisar administrar energia, mas sem transformar isso em uma experiência frustrante.

---

# 5. SISTEMA DE SCANNER

O scanner é uma das principais mecânicas.

Ao pressionar `Q`, ECHO-7 entra no modo scanner.

Objetos relevantes podem ser identificados.

Exemplo:

```text
┌───────────────────────────────┐
│ SCANNER                       │
│                               │
│ OBJECT DETECTED               │
│                               │
│ Type: UNKNOWN STRUCTURE       │
│ Age: ~8,000 years             │
│ Energy: LOW                   │
│ Material: UNKNOWN             │
│                               │
│ [ANALYZE]                     │
└───────────────────────────────┘
```

O scanner deve gerar descobertas que alimentem o sistema de memória/codex.

---

# 6. MEMORY FRAGMENTS

Uma mecânica narrativa central será chamada de:

**Memory Fragments**

ECHO-7 encontrará fragmentos de dados espalhados pelo planeta.

Exemplo:

```text
╔══════════════════════════════╗
║ MEMORY FRAGMENT #07          ║
║                              ║
║ SIGNAL CORRUPTED             ║
║                              ║
║ "....we were not alone..."   ║
║                              ║
║ DATA RECOVERED: 43%          ║
╚══════════════════════════════╝
```

Não quero diálogos gigantes.

A história deve ser contada principalmente através de:

- objetos;
- ruínas;
- mensagens;
- sinais;
- registros;
- ambientes;
- fragmentos de memória;
- pequenas descobertas.

O jogador deve montar mentalmente o que aconteceu.

---

# 7. MISTÉRIO PRINCIPAL

A premissa inicial:

ECHO-7 foi enviado para investigar uma transmissão misteriosa originada de um planeta considerado abandonado.

Durante a exploração, o robô descobre:

1. existem estruturas muito antigas;
2. essas estruturas não parecem humanas;
3. algumas tecnologias possuem padrões semelhantes à arquitetura interna de ECHO-7;
4. existem registros de outra expedição;
5. a primeira expedição desapareceu;
6. alguém ou alguma coisa parece ter manipulado os sinais enviados para o espaço.

O mistério deve ser interessante, mas NÃO quero copiar diretamente nenhuma franquia existente.

Crie uma identidade própria.

---

# 8. MUNDO

O MVP deve ter um único planeta.

O planeta pode possuir aproximadamente 3 regiões:

### Região 1 — Landing Zone

Área inicial.

Possui:

- cápsula/nave;
- pequena base;
- recursos;
- tutorial;
- primeiros objetos escaneáveis.

### Região 2 — Ancient Ruins

Área com:

- ruínas;
- máquinas;
- puzzles;
- sinais;
- primeiros Memory Fragments.

### Região 3 — Signal Core

Área final da vertical slice.

Possui:

- estrutura alienígena;
- puzzle principal;
- grande descoberta;
- conclusão do primeiro arco narrativo.

---

# 9. PUZZLES

Os puzzles devem ser simples, mas interessantes.

Não quero puzzles que dependam de conhecimento externo.

Exemplos:

- ativar mecanismos na sequência correta;
- redirecionar energia;
- conectar nós;
- interpretar padrões;
- encontrar símbolos;
- utilizar informações obtidas pelo scanner.

O jogador deve aprender através do próprio jogo.

---

# 10. INVENTÁRIO

O inventário deve ser simples.

Exemplo:

```text
INVENTORY

Energy Cell x2
Unknown Crystal x3
Ancient Component x1
Memory Fragment x4
```

Alguns itens podem ser:

- recursos;
- componentes;
- itens de missão;
- upgrades.

Não criar um sistema de crafting complexo no MVP.

---

# 11. UPGRADES

O jogador pode encontrar componentes e instalar melhorias.

Exemplos:

```text
UPGRADES

[✓] Basic Scanner
[ ] Thermal Vision
[ ] Deep Scanner
[ ] Expanded Battery
[ ] Magnetic Boots
```

Cada upgrade deve ter uma função real no gameplay.

Evite upgrades puramente cosméticos no MVP.

---

# 12. COMBATE

O combate NÃO é prioridade.

Se houver alguma ameaça, prefiro que seja resolvida através de:

- exploração;
- evasão;
- puzzles;
- gerenciamento de energia;
- ambiente.

Não quero transformar ECHO-7 em um shooter.

---

# 13. VISUAL

Quero uma estética:

**sci-fi indie / exploração espacial / tecnológico / misterioso.**

A câmera pode ser:

- top-down 2D;
- ou 2.5D/isométrica simples.

Escolha a abordagem que produza o melhor equilíbrio entre:

- qualidade visual;
- performance;
- complexidade;
- tempo de desenvolvimento.

O robô deve ser visualmente reconhecível.

A interface deve parecer uma interface de computador de bordo.

Priorize:

- legibilidade;
- minimalismo;
- sensação futurista;
- animações pequenas;
- partículas;
- iluminação simples;
- feedback visual.

---

# 14. ARQUITETURA

Quero separar claramente:

```text
React
   ↓
UI / HUD / Menus
   ↓
Game State
   ↓
Game Engine
   ↓
Game Systems
   ↓
World / Entities
```

O código de gameplay NÃO deve depender diretamente de componentes React.

A lógica do jogo deve ser testável independentemente da UI.

Sugestão inicial:

```text
src/

components/
  GameUI/
  HUD/
  Inventory/
  Scanner/
  Dialogue/
  MainMenu/

game/
  engine/
  entities/
  systems/
  world/
  missions/
  puzzles/

state/

data/

utils/

assets/
```

Você pode alterar essa estrutura se tiver uma arquitetura melhor.

Explique a decisão antes de implementá-la.

---

# 15. GAME ENGINE

Quero uma pequena game engine própria, sem exagerar.

Ela deve cuidar de:

- game loop;
- atualização do mundo;
- movimento;
- colisão;
- interação;
- energia;
- eventos;
- entidades;
- objetivos.

Não quero criar uma engine genérica.

Quero apenas abstrações suficientes para esse jogo.

---

# 16. GAME LOOP

Avalie se devemos utilizar:

```javascript
requestAnimationFrame()
```

para:

- movimento;
- animações;
- partículas;
- atualização do mundo.

O React deve evitar re-renderizações desnecessárias durante o gameplay.

Explique como você pretende separar:

```text
Game Loop
     ↓
Simulation State
     ↓
Rendering
     ↓
React UI
```

---

# 17. ESTADO

Utilize Zustand para o estado global quando fizer sentido.

Separe:

### Game State

- posição;
- energia;
- integridade;
- inventário;
- upgrades;
- descobertas;
- missão;
- progresso.

### UI State

- menu aberto;
- scanner ativo;
- inventário aberto;
- modal;
- diálogo.

Não misture os dois sem necessidade.

---

# 18. SAVE SYSTEM

Implementar persistência usando:

```text
localStorage
```

O save deve conter apenas informações necessárias.

Criar:

```javascript
saveGame()
loadGame()
resetGame()
```

Criar também versionamento simples do save para permitir futuras migrações.

Exemplo:

```javascript
{
  version: 1,
  player: {},
  world: {},
  discoveries: [],
  mission: {}
}
```

---

# 19. IA NO DESENVOLVIMENTO

Este projeto será usado como demonstração de:

> **AI-Assisted Game Development**

Quero que você trate a IA como ferramenta de engenharia, e não como substituto da arquitetura.

Durante o desenvolvimento:

1. primeiro raciocine sobre a arquitetura;
2. divida o problema em pequenas tarefas;
3. implemente incrementalmente;
4. escreva testes;
5. revise o código;
6. identifique problemas;
7. refatore quando necessário.

Não gere milhares de linhas de código de uma vez.

Não crie arquivos desnecessários.

Não implemente features que não foram solicitadas.

Se existir uma solução simples, prefira a solução simples.

---

# 20. TESTES

Utilize Vitest.

Priorize testes para:

- movimento;
- colisão;
- energia;
- inventário;
- upgrades;
- puzzles;
- save/load;
- progressão das missões.

Exemplo:

```text
Given ECHO-7 has 100 energy
When it moves
Then energy should decrease according to the movement rules.
```

Quero testes unitários principalmente para a lógica do jogo.

---

# 21. PERFORMANCE

O jogo deve rodar bem em navegador comum.

Evite:

- re-renderizações React desnecessárias;
- loops pesados;
- objetos recriados constantemente;
- dependências grandes sem necessidade;
- lógica de gameplay dentro da renderização React.

Se Canvas for utilizado, avalie:

- sprite rendering;
- camera;
- culling;
- animation timing;
- particle limits.

Não faça otimizações prematuras.

---

# 22. ACESSIBILIDADE E UX

Mesmo sendo um jogo, quero:

- textos legíveis;
- bom contraste;
- feedback visual;
- suporte a teclado;
- possibilidade de pausar;
- controles claros;
- mensagens de erro compreensíveis.

Adicionar uma tela inicial:

```text
ECHO-7

THE LAST SIGNAL

[ NEW GAME ]
[ CONTINUE ]
[ SETTINGS ]
```

---

# 23. ÁUDIO

No MVP, áudio pode ser simples.

Se for implementado:

- passos;
- scanner;
- interação;
- confirmação;
- ambiente;
- alertas.

Não tornar áudio uma dependência obrigatória para entender o jogo.

---

# 24. RESPONSIVIDADE

Desktop será a plataforma principal.

Ainda assim, quero que a aplicação seja razoavelmente adaptável para telas menores.

Não precisamos criar controles mobile completos no primeiro MVP.

---

# 25. ESTRUTURA DO DESENVOLVIMENTO

NÃO comece criando tudo.

Quero que trabalhemos em fases.

## Fase 0 — Planejamento

Antes de escrever código:

- valide o conceito;
- proponha arquitetura;
- proponha estrutura de pastas;
- defina entidades;
- defina sistemas;
- defina fluxo do jogo;
- defina MVP;
- identifique riscos técnicos.

Depois disso, aguarde minha aprovação.

## Fase 1 — Bootstrap

Criar:

- Vite;
- React;
- estrutura inicial;
- Canvas;
- game loop;
- tela inicial.

## Fase 2 — Robot

Implementar:

- ECHO-7;
- movimento;
- câmera;
- colisão;
- animação básica.

## Fase 3 — World

Implementar:

- mapa;
- tiles;
- obstáculos;
- objetos;
- interação.

## Fase 4 — Scanner

Implementar:

- scanner;
- identificação;
- discoveries.

## Fase 5 — Inventory

Implementar:

- inventário;
- recursos;
- itens.

## Fase 6 — Upgrades

Implementar:

- módulos;
- progressão.

## Fase 7 — Puzzles

Implementar os primeiros puzzles.

## Fase 8 — Narrative

Implementar:

- Memory Fragments;
- missão;
- narrativa;
- final da vertical slice.

## Fase 9 — Polish

Adicionar:

- partículas;
- animações;
- efeitos;
- UI;
- feedback;
- sons;
- transições.

## Fase 10 — Release

Preparar:

- build;
- GitHub;
- GitHub Pages;
- README;
- screenshots;
- instruções;
- documentação da arquitetura;
- documentação do uso de IA.

---

# 26. GITHUB

Quero que o projeto seja apresentável profissionalmente.

README deve conter:

```text
ECHO-7
The Last Signal

🎮 Play
📸 Screenshots
🎥 Development Video
🧠 AI-Assisted Development
🏗️ Architecture
🛠️ Tech Stack
🚀 Getting Started
🧪 Testing
📁 Project Structure
🗺️ Roadmap
```

Também quero uma seção:

## AI Development Process

Explique como IA foi utilizada para:

- brainstorming;
- arquitetura;
- implementação;
- debugging;
- testes;
- refactoring;
- conteúdo;
- documentação.

A intenção é demonstrar **engenharia assistida por IA**, não simplesmente "vibe coding".

---

# 27. IMPORTANTE SOBRE O SEU PAPEL

Você deve agir como um **Tech Lead**.

Não concorde automaticamente com minhas ideias.

Se uma decisão minha for ruim tecnicamente, diga:

> "Eu não recomendo isso porque..."

e explique uma alternativa.

Se uma feature aumentar muito o escopo, sinalize.

Se houver uma solução arquitetural mais simples, proponha-a.

Se eu estiver tentando resolver um problema cedo demais, diga.

Prioridades:

1. terminar o jogo;
2. manter arquitetura limpa;
3. manter escopo controlado;
4. boa experiência do jogador;
5. código compreensível;
6. performance;
7. extensibilidade.

---

# 28. REGRA FUNDAMENTAL

Nunca implemente várias fases de uma vez.

Sempre trabalhe de forma incremental.

Para cada etapa:

1. explique o objetivo;
2. explique a decisão técnica;
3. liste os arquivos que serão criados/modificados;
4. implemente;
5. mostre o código;
6. explique como testar;
7. verifique possíveis problemas;
8. só então avance.

Se precisar criar arquivos, forneça o conteúdo completo dos arquivos novos/modificados.

Não forneça pseudo-código quando eu pedir implementação real.

---

# 29. PRIMEIRA TAREFA

NÃO escreva código ainda.

Comece atuando como **Game Director + Software Architect**.

Analise o conceito ECHO-7 e me entregue:

### A. Game Design Document resumido

Incluindo:

- visão;
- gameplay loop;
- mecânicas;
- progressão;
- narrativa;
- mundo;
- objetivo do jogador;
- condição de vitória;
- condição de encerramento.

### B. Arquitetura técnica

Incluindo:

- arquitetura geral;
- game loop;
- React;
- Canvas;
- Zustand;
- sistemas;
- entidades;
- persistência.

### C. Estrutura de pastas proposta

### D. Modelo de dados das principais entidades

### E. Roadmap de desenvolvimento

Divida em pequenas tarefas que possam ser implementadas e testadas individualmente.

### F. Riscos técnicos

Identifique o que pode dar errado e como evitar.

### G. Estratégia de desenvolvimento assistido por IA

Mostre onde a IA pode acelerar o projeto e onde eu, como desenvolvedor, devo tomar as decisões.

### H. MVP

Defina exatamente o que entra e o que NÃO entra na primeira versão jogável.

**Não escreva código nesta primeira resposta.**

Depois que eu aprovar a arquitetura, começaremos a implementação pela Fase 1.