import { useEffect, useRef } from 'react';

import {
  GameLoop,
  type GameLoopCallbacks,
  type GameLoopOptions,
} from '@/engine/gameLoop';

/**
 * Inicia um GameLoop atrelado ao ciclo de vida do componente e o para no
 * unmount. Os callbacks ficam numa ref, sincronizada num efeito (nunca
 * durante o render, que pode ser chamado mais de uma vez pelo React) em vez
 * de entrar nas dependencias do efeito que cria o loop: assim update/render
 * sempre chamam a versao mais recente sem reiniciar o loop - e perder o
 * accumulator/timing - a cada re-render.
 */
export function useGameLoop(
  callbacks: GameLoopCallbacks,
  options?: GameLoopOptions,
): void {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const loop = new GameLoop(
      {
        update: (dt) => callbacksRef.current.update(dt),
        render: (alpha) => callbacksRef.current.render(alpha),
      },
      options,
    );

    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "options" fica de fora de proposito: ver comentario da funcao.
  }, []);
}
