export type GameAction =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'interact'
  | 'scanner'
  | 'inventory';

export interface KeyEventLike {
  code: string;
  preventDefault?: () => void;
}

export interface EventTargetLike {
  addEventListener(type: string, listener: (event: KeyEventLike) => void): void;
  removeEventListener(
    type: string,
    listener: (event: KeyEventLike) => void,
  ): void;
}

// event.code (posicao fisica da tecla) em vez de event.key: assim WASD
// funciona pela posicao no teclado, independente do layout (ex: em AZERTY
// a tecla na posicao de "W" tem code 'KeyW' mas key 'z').
// Exportado (nao so uso interno) para ser a fonte unica de verdade tambem
// para a UI de comandos (components/Controls/ControlsHint.tsx) - assim ela
// nunca desalinha do que o jogo realmente aceita.
export const ACTION_TO_KEYS: Record<GameAction, readonly string[]> = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  interact: ['KeyE'],
  scanner: ['KeyQ'],
  inventory: ['KeyI'],
};

const ARROW_KEY_LABELS: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
};

/** Rotulo curto de um `code` de tecla para exibicao na UI (ex: 'KeyW' -> 'W', 'ArrowUp' -> uma seta). */
export function formatKeyLabel(code: string): string {
  const arrowLabel = ARROW_KEY_LABELS[code];
  if (arrowLabel) return arrowLabel;
  return code.startsWith('Key') ? code.slice(3) : code;
}

const KEY_TO_ACTION = new Map<string, GameAction>();
for (const [action, keys] of Object.entries(ACTION_TO_KEYS) as [
  GameAction,
  readonly string[],
][]) {
  for (const key of keys) {
    KEY_TO_ACTION.set(key, action);
  }
}

// "Tecla" sintetica por acao, para controles de toque (TouchControls) - cada
// botao virtual chama pressVirtual/releaseVirtual, que reaproveitam o mesmo
// caminho de handleKeyDown/handleKeyUp de uma tecla de verdade (pressedKeys,
// justPressedActions), em vez de precisar de um segundo mecanismo de estado
// so para input por toque.
const VIRTUAL_KEY_BY_ACTION: Record<GameAction, string> = Object.fromEntries(
  (Object.keys(ACTION_TO_KEYS) as GameAction[]).map((action) => [
    action,
    `Virtual:${action}`,
  ]),
) as Record<GameAction, string>;

for (const [action, virtualKey] of Object.entries(VIRTUAL_KEY_BY_ACTION) as [
  GameAction,
  string,
][]) {
  KEY_TO_ACTION.set(virtualKey, action);
}

export class InputManager {
  private readonly target: EventTargetLike;
  // Guarda as teclas cruas pressionadas, nao as acoes: se duas teclas
  // mapeiam para a mesma acao (KeyW e ArrowUp -> moveUp) e uma delas e
  // solta, a acao so deve parar quando a ultima tecla que a ativa for solta.
  private readonly pressedKeys = new Set<string>();
  // Acoes cuja tecla foi pressionada desde a ultima chamada a clearJustPressed
  // (borda de subida) - para acoes tipo "interagir", que devem disparar uma
  // vez por toque, nao uma vez por frame enquanto a tecla estiver segurada.
  private readonly justPressedActions = new Set<GameAction>();

  constructor(target: EventTargetLike = window) {
    this.target = target;
    this.target.addEventListener('keydown', this.handleKeyDown);
    this.target.addEventListener('keyup', this.handleKeyUp);
    // Se a janela perde o foco com uma tecla pressionada, o keyup correspondente
    // pode nunca chegar - sem isso, a acao ficaria "presa" ativada.
    this.target.addEventListener('blur', this.handleBlur);
  }

  isActionPressed(action: GameAction): boolean {
    return (
      ACTION_TO_KEYS[action].some((key) => this.pressedKeys.has(key)) ||
      this.pressedKeys.has(VIRTUAL_KEY_BY_ACTION[action])
    );
  }

  wasActionJustPressed(action: GameAction): boolean {
    return this.justPressedActions.has(action);
  }

  /** Chamar uma vez ao final de cada passo fixo de simulacao, depois que todos os sistemas ja leram wasActionJustPressed. */
  clearJustPressed(): void {
    this.justPressedActions.clear();
  }

  /** Ativa uma acao por toque (D-pad/botoes virtuais) - mesmo efeito de segurar a tecla correspondente. */
  pressVirtual(action: GameAction): void {
    this.handleKeyDown({ code: VIRTUAL_KEY_BY_ACTION[action] });
  }

  /** Solta uma acao ativada por toque. */
  releaseVirtual(action: GameAction): void {
    this.handleKeyUp({ code: VIRTUAL_KEY_BY_ACTION[action] });
  }

  destroy(): void {
    this.target.removeEventListener('keydown', this.handleKeyDown);
    this.target.removeEventListener('keyup', this.handleKeyUp);
    this.target.removeEventListener('blur', this.handleBlur);
    this.pressedKeys.clear();
    this.justPressedActions.clear();
  }

  private readonly handleKeyDown = (event: KeyEventLike): void => {
    const action = KEY_TO_ACTION.get(event.code);
    if (action) {
      event.preventDefault?.();
      if (!this.pressedKeys.has(event.code)) {
        this.justPressedActions.add(action);
      }
    }
    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyEventLike): void => {
    this.pressedKeys.delete(event.code);
  };

  private readonly handleBlur = (): void => {
    this.pressedKeys.clear();
  };
}
