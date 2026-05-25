const lastCall = new Map<string, number>();
const MIN_INTERVAL_MS = 1200;

export function canCall(provider: string): boolean {
  const prev = lastCall.get(provider) ?? 0;
  return Date.now() - prev >= MIN_INTERVAL_MS;
}

export function markCalled(provider: string): void {
  lastCall.set(provider, Date.now());
}
