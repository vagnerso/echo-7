// The Buried Chord (region-6, v3.0 - ver docs/DECISIONS.md) e a primeira
// area do jogo em escuridao quase total: o raio visivel ao redor do robo e
// minimo (AMBIENT_REVEAL_RADIUS - o proprio robo enxerga o proprio chao) e
// cresce ate ACTIVE_REVEAL_RADIUS enquanto o scanner estiver ligado,
// suavizando a cada frame em vez de saltar - liga o "acender" diretamente ao
// estado atual do scanner (o mesmo que ja anima o anel na antena, ver
// renderPlayer em GameCanvas.tsx), nao a um pulso pontual que precisa lembrar
// quando foi o ultimo toggle.
//
// Decisao (troca de abordagem, ver docs/DECISIONS.md): a primeira versao
// gravava so o instante de cada toggle-para-ligado e desvanecia a partir
// dali - funcionava no teste automatizado, mas na pratica dependia do
// jogador ligar o scanner exatamente ao entrar na regiao. Se o scanner ja
// estivesse ligado de antes (ex: usado em Thousand Spires pra achar a porta
// oculta), a primeira vez que o jogador via a regiao escura o "pulso"
// registrado ja podia estar ha muito tempo desvanecido, e apertar Q ali
// dentro desligava o scanner (sem novo pulso) antes de ligar de novo - uma
// sequencia de dois toques nada obvia. Ler o estado atual (ligado/desligado)
// a cada frame, em vez de um evento pontual no passado, elimina esse cenario
// por completo.

export const AMBIENT_REVEAL_RADIUS = 36;
export const ACTIVE_REVEAL_RADIUS = 150;
// Raio "de recompensa" ao resolver BURIED_CHORD_PUZZLE (ver GameCanvas.tsx) -
// so precisa ser atribuido uma vez a darknessRevealRadiusRef.current; o
// proprio stepRevealRadius, chamado no frame seguinte, ja o suaviza de volta
// para o alvo normal (ambiente/ativo) - um flash que apaga sozinho, sem
// nenhum temporizador novo.
export const REWARD_FLASH_RADIUS = 420;

// Fracao da distancia ate o alvo percorrida por milissegundo - suficiente
// pra ir de um raio a outro em pouco menos de 1 segundo (aproximacao
// exponencial, nunca chega a 100% mas passa de 99% bem antes disso).
const REVEAL_LERP_PER_MS = 0.006;

/**
 * Um passo de suavizacao de `currentRadius` em direcao ao raio alvo (ligado
 * ou desligado), proporcional a `dt` (ms desde o passo anterior) - chamada
 * a cada frame em GameCanvas.tsx, guardando o resultado num ref. Pura (so
 * numeros/booleano de entrada, devolve um numero) para ser testavel sem
 * canvas nem store.
 */
export function stepRevealRadius(
  currentRadius: number,
  isScannerActive: boolean,
  dt: number,
): number {
  const target = isScannerActive ? ACTIVE_REVEAL_RADIUS : AMBIENT_REVEAL_RADIUS;
  const step = Math.min(dt * REVEAL_LERP_PER_MS, 1);
  return currentRadius + (target - currentRadius) * step;
}
