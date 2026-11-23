import { router } from "expo-router";

const NAVIGATE_WINDOW = 350;
const PUSH_MAX_WAIT = 1500;
let pushPending = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastNavigateAt = 0;

/** Goi khi pathname doi: mo khoa push ngay khi trang moi da hien. */
export function notifyPathChange() {
  pushPending = false;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
}

function wrap(name: "push" | "navigate") {
  const r = router as any;
  if (r["__lock_" + name]) return;
  const orig = r[name].bind(r);
  const wrapped = (...args: any[]) => {
    if (name === "push") {
      if (pushPending) return;
      pushPending = true;
      pushTimer = setTimeout(notifyPathChange, PUSH_MAX_WAIT);
    } else {
      const now = Date.now();
      if (now - lastNavigateAt < NAVIGATE_WINDOW) return;
      lastNavigateAt = now;
    }
    return orig(...args);
  };
  try {
    r[name] = wrapped;
  } catch {}
  if (r[name] !== wrapped) {
    try {
      Object.defineProperty(r, name, { value: wrapped, writable: true, configurable: true });
    } catch {}
  }
  if (r[name] !== wrapped) {
    console.warn("navLock: khong gan duoc khoa cho router." + name);
    return;
  }
  try {
    Object.defineProperty(r, "__lock_" + name, { value: true });
  } catch {}
}

wrap("push");
wrap("navigate");