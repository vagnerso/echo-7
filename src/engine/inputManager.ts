export type GameAction =
  'moveUp' | 'moveDown' | 'moveLeft' | 'moveRight' | 'interact';

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
const ACTION_TO_KEYS: Record<GameAction, readonly string[]> = {
  moveUp: ['KeyW', 'ArrowUp'],
  moveDown: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  interact: ['KeyE'],
};

const KEY_TO_ACTION = new Map<string, GameAction>();
for (const [action, keys] of Object.entries(ACTION_TO_KEYS) as [
  GameAction,
  readonly string[],
][]) {
  for (const key of keys) {
    KEY_TO_ACTION.set(key, action);
  }
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
    return ACTION_TO_KEYS[action].some((key) => this.pressedKeys.has(key));
  }

  wasActionJustPressed(action: GameAction): boolean {
    return this.justPressedActions.has(action);
  }

  /** Chamar uma vez ao final de cada passo fixo de simulacao, depois que todos os sistemas ja leram wasActionJustPressed. */
  clearJustPressed(): void {
    this.justPressedActions.clear();
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
