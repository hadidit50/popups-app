const KEY = 'wp.session-id';

/**
 * Random id per browser, used only to de-duplicate views for the "Hot now" score.
 * No personal data; works without login.
 */
export function getSessionId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}
