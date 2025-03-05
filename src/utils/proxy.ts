export function proxify(proxyUrl: string, targetUrl: string): string {
  if (typeof proxyUrl === 'string' && proxyUrl.length) {
    return proxyUrl.concat(encodeURIComponent(targetUrl));
  }

  return targetUrl;
}
