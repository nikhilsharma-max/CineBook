const MINIMUM_LOADING_MS = 2000;

export async function runWithMinimumLoading<T>(action: string, operation: () => Promise<T>): Promise<T> {
  if (import.meta.env.DEV) console.info(`[CineBook] ${action} request started`);
  const minimumLoading = new Promise<void>((resolve) => {
    window.setTimeout(resolve, MINIMUM_LOADING_MS);
  });

  try {
    const [result] = await Promise.all([Promise.resolve().then(operation), minimumLoading]);
    if (import.meta.env.DEV) console.info(`[CineBook] ${action} successful`);
    return result;
  } catch (error) {
    await minimumLoading;
    if (import.meta.env.DEV) console.error(`[CineBook] ${action} request failed`);
    throw error;
  } finally {
    if (import.meta.env.DEV) console.info(`[CineBook] ${action} loading state completed`);
  }
}
