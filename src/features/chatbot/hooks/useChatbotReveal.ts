import { useEffect, useMemo, useRef, useState } from "react";

export function useChatbotReveal(text: string, cardCount: number, animate: boolean, onComplete?: () => void) {
  const characters = useMemo(() => Array.from(text), [text]);
  const [progress, setProgress] = useState({ text: 0, cards: 0 });
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    if (!animate) return;
    setProgress({ text: 0, cards: 0 });
    let t = 0, c = 0, ticks = 0, stopped = false;
    const chunk = Math.max(3, Math.ceil(characters.length / 360));
    const timer = setInterval(() => {
      if (stopped) return;
      if (t < characters.length) t = Math.min(characters.length, t + chunk);
      else if (c < cardCount) { if (++ticks < 5) return; ticks = 0; c += 1; }
      else { stopped = true; clearInterval(timer); complete.current?.(); return; }
      setProgress({ text: t, cards: c });
    }, 33);
    return () => { stopped = true; clearInterval(timer); };
  }, [animate, characters, cardCount]);

  return {
    text: animate ? characters.slice(0, progress.text).join("") : text,
    cardCount: animate ? progress.cards : cardCount,
  };
}
