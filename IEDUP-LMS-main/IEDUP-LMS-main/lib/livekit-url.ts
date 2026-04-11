type RegionValue = string | null | undefined;

const normalizeRegionKey = (region: RegionValue) =>
  region ? `_${region.trim().toUpperCase()}` : '';

const readEnvWithRegionFallback = (baseKey: string, region?: RegionValue) => {
  const regionalKey = `${baseKey}${normalizeRegionKey(region)}`;
  return process.env[regionalKey] || process.env[baseKey] || '';
};

export const toLiveKitApiUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('wss://')) return `https://${url.slice('wss://'.length)}`;
  if (url.startsWith('ws://')) return `http://${url.slice('ws://'.length)}`;
  return url;
};

export const toLiveKitWsUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('https://')) return `wss://${url.slice('https://'.length)}`;
  if (url.startsWith('http://')) return `ws://${url.slice('http://'.length)}`;
  return url;
};

export const getConfiguredLiveKitUrls = (region?: RegionValue) => {
  const configuredWsUrl = readEnvWithRegionFallback('LIVEKIT_URL', region);
  const configuredApiUrl = readEnvWithRegionFallback('LIVEKIT_API_URL', region);
  const sourceUrl = configuredApiUrl || configuredWsUrl;

  if (!sourceUrl) {
    return null;
  }

  return {
    apiUrl: toLiveKitApiUrl(configuredApiUrl || sourceUrl),
    wsUrl: toLiveKitWsUrl(configuredWsUrl || sourceUrl),
  };
};
