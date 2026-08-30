import type { Translations } from './translations';

export const ptBR: Translations = {
  mainMenu: {
    title: 'ECHO-7',
    subtitle: 'O ÚLTIMO SINAL',
    newGame: 'NOVO JOGO',
    continueGame: 'CONTINUAR',
    settings: 'AJUSTES',
    noSaveTooltip: 'Nenhum progresso salvo ainda',
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
  objectives: {
    exploreLandingZone: 'Explore a Zona de Pouso.',
    investigateAncientRuins: 'Investigue as Ruínas Antigas.',
    activateSignalCore: 'Ative o Núcleo de Sinal.',
    findWayToSignalCore: 'Encontre um caminho até o Núcleo de Sinal.',
    approachCore: 'Aproxime-se do Núcleo.',
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
  },
};
