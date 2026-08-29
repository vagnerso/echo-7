import { advanceAccumulator } from './fixedTimestep';

export type FrameCallback = (time: number) => void;

export interface GameLoopCallbacks {
  /** Roda um passo de tamanho fixo (em ms) da simulacao. Pode ser chamado varias vezes por frame, ou nenhuma. */
  update: (fixedDeltaMs: number) => void;
  /** Desenha o estado atual. alpha (0-1) indica a fracao do proximo passo fixo ja decorrida, para interpolacao visual. */
  render: (alpha: number) => void;
}

export interface GameLoopOptions {
  fixedStepMs?: number;
  maxFrameDeltaMs?: number;
  /** Injetavel para testes: substitui performance.now(). */
  now?: () => number;
  /** Injetavel para testes: substitui requestAnimationFrame. */
  requestFrame?: (callback: FrameCallback) => number;
  /** Injetavel para testes: substitui cancelAnimationFrame. */
  cancelFrame?: (handle: number) => void;
}

const DEFAULT_FIXED_STEP_MS = 1000 / 60;
const DEFAULT_MAX_FRAME_DELTA_MS = 250;

export class GameLoop {
  private readonly fixedStepMs: number;
  private readonly maxFrameDeltaMs: number;
  private readonly now: () => number;
  private readonly requestFrame: (callback: FrameCallback) => number;
  private readonly cancelFrame: (handle: number) => void;

  private readonly callbacks: GameLoopCallbacks;

  private accumulator = 0;
  private lastTime = 0;
  private frameHandle: number | null = null;
  private running = false;

  constructor(callbacks: GameLoopCallbacks, options: GameLoopOptions = {}) {
    this.callbacks = callbacks;
    this.fixedStepMs = options.fixedStepMs ?? DEFAULT_FIXED_STEP_MS;
    this.maxFrameDeltaMs =
      options.maxFrameDeltaMs ?? DEFAULT_MAX_FRAME_DELTA_MS;
    this.now = options.now ?? (() => performance.now());
    this.requestFrame =
      options.requestFrame ?? ((callback) => requestAnimationFrame(callback));
    this.cancelFrame =
      options.cancelFrame ?? ((handle) => cancelAnimationFrame(handle));
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.accumulator = 0;
    this.lastTime = this.now();
    this.frameHandle = this.requestFrame(this.tick);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.frameHandle !== null) {
      this.cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  private readonly tick = (currentTime: number): void => {
    if (!this.running) return;

    const frameDelta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    const { steps, accumulator, alpha } = advanceAccumulator(
      this.accumulator,
      frameDelta,
      this.fixedStepMs,
      this.maxFrameDeltaMs,
    );
    this.accumulator = accumulator;

    for (let i = 0; i < steps; i += 1) {
      this.callbacks.update(this.fixedStepMs);
    }

    this.callbacks.render(alpha);

    this.frameHandle = this.requestFrame(this.tick);
  };
}
