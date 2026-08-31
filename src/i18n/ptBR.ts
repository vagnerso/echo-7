import type { Translations } from './translations';

export const ptBR: Translations = {
  mainMenu: {
    title: 'ECHO-7',
    subtitle: 'O ÚLTIMO SINAL',
    newGame: 'NOVO JOGO',
    continueGame: 'CONTINUAR',
    settings: 'AJUSTES',
    howToPlay: 'COMO JOGAR',
    noSaveTooltip: 'Nenhum progresso salvo ainda',
    developedBy: 'Desenvolvido por',
  },
  mission: {
    objectiveLabel: 'OBJETIVO',
  },
  scanner: {
    title: 'SCANNER',
    objectDetected: 'OBJETO DETECTADO',
    typeLabel: 'Tipo:',
    ageLabel: 'Idade:',
    materialLabel: 'Material:',
    noSignal: 'SEM SINAL',
  },
  inventory: {
    title: 'INVENTÁRIO',
    close: 'Fechar',
    empty: 'Nenhum item coletado ainda.',
    slots: (count, capacity) => `${count}/${capacity} vagas`,
    upgradesTitle: 'MELHORIAS',
    fragmentsTitle: (count, total) =>
      `FRAGMENTOS DE MEMÓRIA (${count}/${total})`,
    noFragments: 'Nenhum fragmento recuperado ainda.',
    dataRecovered: (percent) => `DADOS RECUPERADOS: ${percent}%`,
  },
  fragmentReveal: {
    title: 'FRAGMENTO DE MEMÓRIA',
    corrupted: 'SINAL CORROMPIDO',
    recovered: (percent) => `DADOS RECUPERADOS: ${percent}%`,
  },
  ending: {
    coreResponseDetected: 'RESPOSTA DO NÚCLEO DETECTADA',
    patternMatch: 'CORRESPONDÊNCIA DE PADRÃO: POSITIVA',
    unitDesignation:
      'DESIGNAÇÃO DE UNIDADE "ECHO-7" RECONHECIDA COMO [DADOS CORROMPIDOS]',
    welcomeKin: 'BEM-VINDO, PARENTE.',
    newSignalDetected: 'NOVO SINAL DETECTADO',
    origin: 'ORIGEM: ALÉM DO ESPAÇO MAPEADO',
    newCoordinate:
      'Uma nova coordenada foi registrada na memória central do ECHO-7.',
    searchContinues: 'A busca continua...',
    toBeContinued: 'CONTINUA',
    returnToMenu: 'VOLTAR AO MENU',
    continueExploring: 'CONTINUAR EXPLORANDO',
  },
  epilogueEnding: {
    sequenceComplete: 'SEQUÊNCIA COMPLETA — AS CINCO NOTAS COINCIDIRAM',
    chordResolves:
      'O Buried Chord fica em silêncio pela primeira vez desde que foi selado.',
    unitRecognized:
      'Em algum lugar da memória central do ECHO-7, uma flag muda de estado: [UNIDADE: RECONHECIDA].',
    waitingForItself:
      'Nunca esteve esperando pelos que vieram antes. Estava esperando por si mesmo.',
    farewell: 'O ECHO-7 registra a coordenada e continua escutando.',
    seeYouOutThere: 'Até breve, explorador.',
  },
  controls: {
    title: 'COMANDOS',
    move: 'Mover',
    interact: 'Interagir',
    scanner: 'Scanner',
    inventory: 'Inventário',
  },
  settings: {
    title: 'CONFIGURAÇÕES',
    languageLabel: 'IDIOMA',
    robotColorLabel: 'COR DO ROBÔ',
    back: 'VOLTAR',
    robotColors: {
      cyan: 'Ciano',
      amber: 'Âmbar',
      rose: 'Rosa',
      green: 'Verde',
      azure: 'Azul',
    },
  },
  tutorial: {
    title: 'COMO JOGAR',
    briefingTitle: 'BRIEFING DA MISSÃO',
    briefingText:
      'Você é o ECHO-7, uma unidade de exploração enviada para investigar um sinal vindo de um planeta presumidamente abandonado. Explore o terreno, escaneie anomalias e recupere o que puder. O resto, você vai precisar descobrir sozinho.',
    controlsTitle: 'COMANDOS',
  },
  objectives: {
    exploreLandingZone: 'Explore a Zona de Pouso.',
    investigateAncientRuins: 'Investigue as Ruínas Antigas.',
    activateSignalCore: 'Ative o Núcleo de Sinal.',
    findWayToSignalCore: 'Encontre um caminho até o Núcleo de Sinal.',
    approachCore: 'Aproxime-se do Núcleo.',
    exploreThousandSpires: 'Explore as Mil Torres.',
  },
  items: {
    'energy-cell': 'Célula de Energia',
    'ancient-component': 'Componente Antigo',
  },
  upgrades: {
    'deep-scanner': {
      name: 'Scanner Profundo',
      description:
        'Detecta sinais e estruturas ocultas, fora do alcance do scanner básico.',
    },
    'magnetic-boots': {
      name: 'Botas Magnéticas',
      description: 'Permite atravessar superfícies magneticamente instáveis.',
    },
  },
  scanInfo: {
    'unknown-structure-01': {
      label: 'ESTRUTURA DESCONHECIDA',
      age: '~8.000 anos',
      material: 'DESCONHECIDO',
    },
    'hidden-signal-01': {
      label: 'FONTE DE SINAL OCULTA',
      material: 'DESCONHECIDO',
    },
    'ruins-archive': {
      label: 'ARQUIVO SELADO',
      age: '~8.000 anos',
      material: 'DESCONHECIDO',
    },
    'buried-cache-entrance': {
      label: 'TRANSMISSOR ENTERRADO',
      material: 'LIGA COMPOSTA',
    },
  },
  fragments: {
    'fragment-01':
      'Log 03 - Chegada. A atmosfera está limpa. Nenhum sinal de vida hostil. O sinal ainda está lá, exatamente onde o levantamento indicou. O Comando quer relatórios diários. Este lugar parece... observado.',
    'fragment-02':
      "Log 11 - Algo está errado com nossos instrumentos perto das ruínas. A bússola gira sem parar. Os cronômetros perdem o sincronismo. Kade diz que é interferência magnética. Eu não acho que seja.",
    'fragment-03':
      "Log 19 - As estruturas são anteriores a qualquer coisa no registro histórico. Quem construiu isso não era primitivo. Os padrões nas paredes... continuo achando que já vi essa arquitetura antes. Num manual de manutenção, de todos os lugares possíveis.",
    'fragment-04':
      "Log 24 - Kade não sai da câmara leste. Diz que as paredes estão 'escutando'. Eu disse pra ele descansar um pouco. Ele olhou pra mim como se eu fosse quem não estava entendendo.",
    'fragment-05':
      'Log 31 - O sinal não é uma transmissão. É uma pergunta. Ele vem fazendo a mesma pergunta há milhares de anos, para ninguém. Nunca fomos feitos para respondê-la.',
    'fragment-06':
      "Log 33 - Registro final, se alguém encontrar isto. Não é hostil. Ele só... reconheceu em nós algo que não estava procurando. Acho que não vai cometer esse engano de novo. Para quem vier depois: ele não está esperando por uma pessoa.",
    'fragment-07':
      'Log 07 (Kade) - Extraoficial. Encontrei algo nos estratos inferiores durante o levantamento, fora do mapa oficial. Estou registrando aqui até saber o que é. Se alguém encontrar isto e eu não estiver por perto para explicar: não é um depósito mineral. Eu não sei o que é.',
    'fragment-08':
      'Log 15 (Kade) - Enterrei o drive sob a crista leste, longe do acampamento. Se os outros lerem o que venho registrando, vão me tirar do local, e eu não vou embora até entender o que há debaixo de nós. Não é geologia. Eu fico repetindo pra mim mesmo que não é geologia.',
    'fragment-09':
      'TRANSMISSÃO [ORIGEM DESCONHECIDA] - Antes da linguagem, havia frequência. Antes de termos nomes, tínhamos o Coro. Cada torre que você vê não foi erguida para falar para fora. Foi erguida para lembrar como se escuta.',
    'fragment-10':
      'REGISTRO DA UNIDADE [RESTRITO] - O Componente 7-A não foi fabricado na data registrada. Origem: não catalogada. Referência cruzada: padrão de sinal idêntico à anomalia da Landing Zone. Recomenda-se não investigar mais. [ENTRADA SELADA]',
    'fragment-11':
      'TRANSMISSÃO [ORIGEM DESCONHECIDA] - O fragmento que seu predecessor enterrou nunca foi geologia. Era uma chave talhada para uma fechadura que esquecemos de ter construído. Esperou exatamente onde ele a deixou, sintonizada na única frequência que sempre esteve destinada a responder.',
    'fragment-12':
      'REGISTRO DA UNIDADE [RESTRITO, DECIFRADO] - Consulta: por que o Coro responde ao ECHO-7 e não aos que vieram antes? Hipótese: nunca respondeu a uma espécie. Respondeu a uma assinatura. [DADOS CORROMPIDOS] ...respondeu a si mesmo.',
  },
};
