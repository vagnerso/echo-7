import type { Translations } from './translations';

export const en: Translations = {
  mainMenu: {
    title: 'ECHO-7',
    subtitle: 'THE LAST SIGNAL',
    newGame: 'NEW GAME',
    continueGame: 'CONTINUE',
    settings: 'SETTINGS',
    howToPlay: 'HOW TO PLAY',
    noSaveTooltip: 'No saved progress yet',
    developedBy: 'Developed by',
  },
  mission: {
    objectiveLabel: 'OBJECTIVE',
  },
  scanner: {
    title: 'SCANNER',
    objectDetected: 'OBJECT DETECTED',
    typeLabel: 'Type:',
    ageLabel: 'Age:',
    materialLabel: 'Material:',
    noSignal: 'NO SIGNAL',
  },
  inventory: {
    title: 'INVENTORY',
    close: 'Close',
    empty: 'No items collected yet.',
    slots: (count, capacity) => `${count}/${capacity} slots`,
    upgradesTitle: 'UPGRADES',
    fragmentsTitle: (count, total) => `MEMORY FRAGMENTS (${count}/${total})`,
    noFragments: 'No fragments recovered yet.',
    dataRecovered: (percent) => `DATA RECOVERED: ${percent}%`,
  },
  fragmentReveal: {
    title: 'MEMORY FRAGMENT',
    corrupted: 'SIGNAL CORRUPTED',
    recovered: (percent) => `DATA RECOVERED: ${percent}%`,
  },
  ending: {
    coreResponseDetected: 'CORE RESPONSE DETECTED',
    patternMatch: 'PATTERN MATCH: POSITIVE',
    unitDesignation:
      'UNIT DESIGNATION "ECHO-7" RECOGNIZED AS [DATA CORRUPTED]',
    welcomeKin: 'WELCOME, KIN.',
    newSignalDetected: 'NEW SIGNAL DETECTED',
    origin: 'ORIGIN: BEYOND CHARTED SPACE',
    newCoordinate: "A new coordinate has been logged to ECHO-7's core memory.",
    searchContinues: 'The search continues...',
    toBeContinued: 'TO BE CONTINUED',
    returnToMenu: 'RETURN TO MENU',
  },
  controls: {
    title: 'CONTROLS',
    move: 'Move',
    interact: 'Interact',
    scanner: 'Scanner',
    inventory: 'Inventory',
  },
  settings: {
    title: 'SETTINGS',
    languageLabel: 'LANGUAGE',
    robotColorLabel: 'ROBOT COLOR',
    back: 'BACK',
    robotColors: {
      cyan: 'Cyan',
      amber: 'Amber',
      rose: 'Rose',
      green: 'Green',
      azure: 'Azure',
    },
  },
  tutorial: {
    title: 'HOW TO PLAY',
    briefingTitle: 'MISSION BRIEFING',
    briefingText:
      "You are ECHO-7, an exploration unit sent to investigate a signal from a planet presumed abandoned. Explore the terrain, scan anomalies, and recover what you can. The rest, you'll have to piece together yourself.",
    controlsTitle: 'CONTROLS',
  },
  objectives: {
    exploreLandingZone: 'Explore the Landing Zone.',
    investigateAncientRuins: 'Investigate the Ancient Ruins.',
    activateSignalCore: 'Activate the Signal Core.',
    findWayToSignalCore: 'Find a way to the Signal Core.',
    approachCore: 'Approach the Core.',
  },
  items: {
    'energy-cell': 'Energy Cell',
    'ancient-component': 'Ancient Component',
  },
  upgrades: {
    'deep-scanner': {
      name: 'Deep Scanner',
      description:
        'Detects hidden signals and structures, beyond the basic scanner range.',
    },
    'magnetic-boots': {
      name: 'Magnetic Boots',
      description: 'Lets you cross magnetically unstable surfaces.',
    },
  },
  scanInfo: {
    'unknown-structure-01': {
      label: 'UNKNOWN STRUCTURE',
      age: '~8,000 years',
      material: 'UNKNOWN',
    },
    'hidden-signal-01': {
      label: 'HIDDEN SIGNAL SOURCE',
      material: 'UNKNOWN',
    },
    'ruins-archive': {
      label: 'SEALED ARCHIVE',
      age: '~8,000 years',
      material: 'UNKNOWN',
    },
    'buried-cache-entrance': {
      label: 'BURIED TRANSMITTER',
      material: 'COMPOSITE ALLOY',
    },
  },
  fragments: {
    'fragment-01':
      'Log 03 - Arrival. Atmosphere reads clean. No signs of hostile life. The signal is still there, exactly where the survey said it would be. Command wants daily reports. This place feels... watched.',
    'fragment-02':
      "Log 11 - Something is wrong with our instruments near the ruins. Compass spins. Chronometers drift. Kade says it's magnetic interference. I don't think it is.",
    'fragment-03':
      "Log 19 - The structures predate anything in the historical record. Whoever built this was not primitive. The wall patterns... I keep thinking I've seen this architecture before. In a maintenance manual, of all places.",
    'fragment-04':
      "Log 24 - Kade won't come out of the east chamber. Says the walls are 'listening'. I told him to get some rest. He looked at me like I was the one who didn't understand.",
    'fragment-05':
      'Log 31 - The signal is not a broadcast. It is a question. It has been asking the same question for thousands of years, to no one. We were never meant to answer it.',
    'fragment-06':
      "Log 33 - Final entry, if anyone finds this. It isn't hostile. It just... recognized something in us it was not looking for. I don't think it will make that mistake again. To whoever comes next: it isn't waiting for a person.",
    'fragment-07':
      "Log 07 (Kade) - Off the record. Found something in the lower strata during survey, not on the official map. Logging it here until I know what it is. If anyone finds this and I'm not around to explain: it's not a mineral deposit. I don't know what it is.",
    'fragment-08':
      "Log 15 (Kade) - Buried the drive under the east ridge, away from camp. If the others read what I've been recording they'll pull me off the site, and I'm not leaving until I understand what's underneath us. It isn't geology. I keep telling myself it isn't geology.",
  },
};
