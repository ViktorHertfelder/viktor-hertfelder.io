const DEFAULT_TIMEOUT_MS = 20_000;

export class HttpError extends Error {
  status: number;
  constructor(url: string, status: number) {
    super(`${url} returned HTTP ${status}`);
    this.status = status;
  }
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  attempts = 3,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ data: T; response: Response }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      if (response.ok) {
        return { data: (await response.json()) as T, response };
      }

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === attempts) {
        throw new HttpError(url, response.status);
      }

      const retryAfter = Number(response.headers.get("retry-after") ?? 0) * 1_000;
      await delay(Math.min(retryAfter || attempt * 1_000, 30_000));
    } catch (error) {
      lastError = error;
      if (error instanceof HttpError && error.status !== 429 && error.status < 500) throw error;
      if (attempt === attempts) break;
      await delay(attempt * 1_000);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
