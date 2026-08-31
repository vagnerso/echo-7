// Tipos do sistema de traducao. Dicionario customizado (sem lib de i18n) -
// justificado em docs/DECISIONS.md: o volume de texto do jogo nao precisa de
// plural/interpolacao complexos, e o projeto evita dependencia nova sem
// necessidade concreta. TypeScript e a propria rede de seguranca: `en`/`ptBR`
// sao tipados como `Translations`, entao esquecer uma chave e erro de build,
// nao bug em runtime.

export type Locale = 'en' | 'pt-BR';

// Cada objetivo de missao e uma chave simbolica, nunca a sentenca em si -
// setObjective/currentObjective (gameStore) guardam a chave, e MissionHUD
// resolve o texto no idioma atual. Ver GameCanvas.tsx para onde cada uma e
// disparada.
export type ObjectiveKey =
  | 'exploreLandingZone'
  | 'investigateAncientRuins'
  | 'activateSignalCore'
  | 'findWayToSignalCore'
  | 'approachCore'
  | 'exploreThousandSpires';

// Chaves das opcoes de cor do robo (Settings). Os valores de cor em si
// (hex) nao moram aqui - vem de content/robotColors.ts, que nao varia por
// idioma; aqui so o nome de exibicao de cada opcao.
export type RobotColorKey = 'cyan' | 'amber' | 'rose' | 'green' | 'azure';

export interface UpgradeText {
  name: string;
  description: string;
}

export interface ScanInfoText {
  label: string;
  age?: string;
  material?: string;
}

export interface Translations {
  mainMenu: {
    title: string;
    subtitle: string;
    newGame: string;
    continueGame: string;
    settings: string;
    howToPlay: string;
    noSaveTooltip: string;
    developedBy: string;
  };
  mission: {
    objectiveLabel: string;
  };
  scanner: {
    title: string;
    objectDetected: string;
    typeLabel: string;
    ageLabel: string;
    materialLabel: string;
    noSignal: string;
  };
  inventory: {
    title: string;
    close: string;
    empty: string;
    slots: (count: number, capacity: number) => string;
    upgradesTitle: string;
    fragmentsTitle: (count: number, total: number) => string;
    noFragments: string;
    dataRecovered: (percent: number) => string;
  };
  fragmentReveal: {
    title: string;
    corrupted: string;
    recovered: (percent: number) => string;
  };
  ending: {
    coreResponseDetected: string;
    patternMatch: string;
    unitDesignation: string;
    welcomeKin: string;
    newSignalDetected: string;
    origin: string;
    newCoordinate: string;
    searchContinues: string;
    returnToMenu: string;
    continueExploring: string;
  };
  epilogueEnding: {
    sequenceComplete: string;
    chordResolves: string;
    unitRecognized: string;
    waitingForItself: string;
    farewell: string;
    seeYouOutThere: string;
  };
  controls: {
    title: string;
    move: string;
    interact: string;
    scanner: string;
    inventory: string;
  };
  settings: {
    title: string;
    languageLabel: string;
    robotColorLabel: string;
    back: string;
    robotColors: Record<RobotColorKey, string>;
  };
  /** `back` nao esta aqui de proposito - reaproveita t.settings.back, mesmo rotulo, mesma tela-padrao (ver SettingsScreen). */
  tutorial: {
    title: string;
    briefingTitle: string;
    briefingText: string;
    controlsTitle: string;
  };
  objectives: Record<ObjectiveKey, string>;
  /** Nome de exibicao de uma regiao, indexado por Region.id (content/regions.ts). */
  regionNames: Record<string, string>;
  /** Nome de exibicao de um item/componente, indexado por InventoryItem.id. */
  items: Record<string, string>;
  /** Indexado por Upgrade.id. */
  upgrades: Record<string, UpgradeText>;
  /** Indexado pelo WorldObject.id do alvo escaneavel. */
  scanInfo: Record<string, ScanInfoText>;
  /** Texto narrativo, indexado por MemoryFragment.id. */
  fragments: Record<string, string>;
}
