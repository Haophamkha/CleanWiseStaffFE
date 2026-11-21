type Tokens = { access: string | null; refresh: string | null };
type Backend = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  deleteItem: (key: string) => Promise<void>;
};
const valid = (token: unknown): token is string => typeof token === "string" && !!token && token !== "null" && token !== "undefined";

export function createSessionStorage(backend: Backend, sessionKey: string, role: string, getRole: (token: string) => string | undefined) {
  let writes: Promise<void> = Promise.resolve();
  const read = async (): Promise<Tokens> => {
    const saved = await backend.getItem(sessionKey);
    if (saved !== null) {
      const data = JSON.parse(saved) as Tokens;
      return { access: valid(data.access) ? data.access : null, refresh: valid(data.refresh) ? data.refresh : null };
    }
    // Migrate existing installations without deleting the other app's legacy keys.
    const [access, refresh] = await Promise.all([backend.getItem("access_token"), backend.getItem("refresh_token")]);
    const token = valid(access) ? access : valid(refresh) ? refresh : null;
    const previousRole = token ? getRole(token) : undefined;
    if (previousRole && previousRole !== role) return { access: null, refresh: null };
    return { access: valid(access) ? access : null, refresh: valid(refresh) ? refresh : null };
  };
  const enqueue = (task: () => Promise<void>) => {
    const next = writes.catch(() => {}).then(task);
    writes = next;
    return next;
  };
  const save = (tokens: Tokens) => backend.setItem(sessionKey, JSON.stringify(tokens));
  return {
    async getItem(key: string): Promise<string | null> {
      if (key !== "access_token" && key !== "refresh_token") return backend.getItem(key);
      await writes.catch(() => {});
      const session = await read();
      return key === "access_token" ? session.access : session.refresh;
    },
    setSession(access: string, refresh: string) {
      if (!valid(access) || !valid(refresh)) return Promise.reject(new Error("Invalid session tokens"));
      // One durable write: success UI never precedes refresh-token persistence.
      return enqueue(() => save({ access, refresh }));
    },
    setItem(key: string, value: string) {
      if (key !== "access_token" && key !== "refresh_token") return backend.setItem(key, value);
      return enqueue(async () => {
        const session = await read();
        session[key === "access_token" ? "access" : "refresh"] = value;
        await save(session);
      });
    },
    persistSession() {
      return enqueue(async () => save(await read()));
    },
    clearSession() {
      // Keep a tombstone so a logout cannot resurrect legacy tokens next launch.
      return enqueue(() => save({ access: null, refresh: null }));
    },
    deleteItem(key: string) {
      if (key !== "access_token" && key !== "refresh_token") return backend.deleteItem(key);
      return enqueue(() => save({ access: null, refresh: null }));
    },
  };
}
