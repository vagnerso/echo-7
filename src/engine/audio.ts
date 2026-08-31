// Sons sintetizados via Web Audio API (osciladores), sem nenhum arquivo de
// audio - atende "audio minimo" (secao 23 do prompt mestre) sem precisar de
// um pipeline de assets.

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  volume = 0.05,
): void {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  // Rampa exponencial ate quase zero em vez de cortar o som seco -
  // evita um "click" audivel no fim de cada tom.
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

export function playFootstepSound(): void {
  playTone(220, 40, 'square', 0.015);
}

export function playScannerToggleSound(): void {
  playTone(880, 120, 'sine', 0.04);
}

export function playInteractSound(): void {
  playTone(440, 80, 'triangle', 0.04);
}

export function playPickupSound(): void {
  playTone(660, 100, 'triangle', 0.05);
}

export function playPuzzleSolvedSound(): void {
  playTone(523, 100, 'sine', 0.05);
  setTimeout(() => playTone(659, 100, 'sine', 0.05), 100);
  setTimeout(() => playTone(784, 150, 'sine', 0.05), 200);
}

// Escala pentatonica maior (C5-D5-E5-G5-A5) - soa consonante em qualquer
// ordem, mas so forma a "frase completa" subindo quando as torres de
// Thousand Spires sao ativadas na sequencia certa (THOUSAND_SPIRES_PUZZLE,
// content/puzzles.ts). Indice = posicao da torre em correctOrder, nao a
// ordem em que o jogador aperta - apertar fora de ordem soa "errado" (nota
// fora do lugar), sem nenhuma logica alem de tocar a nota daquele indice.
const SPIRE_TONE_FREQUENCIES_HZ = [523.25, 587.33, 659.25, 783.99, 880];

export function playSpireToneSound(step: number): void {
  const frequency = SPIRE_TONE_FREQUENCIES_HZ[step];
  if (frequency === undefined) return;
  playTone(frequency, 260, 'sine', 0.05);
}
