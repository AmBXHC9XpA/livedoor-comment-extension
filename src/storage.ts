const _getStorage = async (key: string) =>
  (await chrome.storage.local.get(key))[key] ?? {};

const _setStorage = async (key: string, value: any) =>
  chrome.storage.local.set({ [key]: value });

export const clearStorage = async (key: string) => _setStorage(key, {});

const _getUrlStorage = async (origin?: string) =>
  (await _getStorage('urls'))[origin ?? window.location.origin] ?? {};

export const getUrlConfig = async <T>(
  key: string,
  defaultValue: T,
  origin?: string,
): Promise<T> => (await _getUrlStorage(origin))[key] ?? defaultValue;

export const setUrlConfig = async (
  key: string,
  value: any,
  origin?: string,
): Promise<void> =>
  _setStorage('urls', {
    ...(await _getStorage('urls')),
    [origin ?? window.location.origin]: {
      ...(await _getUrlStorage(origin)),
      [key]: value,
    },
  });

export const deleteUrlConfig = async (origin: string): Promise<void> => {
  const config = await _getStorage('urls');
  delete config[origin];

  return _setStorage('urls', config);
};

export const getCacheSize = async (origin: string): Promise<number> =>
  Object.values(
    await getUrlConfig('urls', {} as Record<string, number>, origin),
  ).reduce((acc, v) => acc + v, 0);

export const getIgnoredIds = async (): Promise<string[]> =>
  Object.keys(await _getStorage('ignored_ids'));

export const addIgnoreId = async (id: string) =>
  _setStorage('ignored_ids', {
    ...(await _getStorage('ignored_ids')),
    [id]: Date.now(),
  });

export const removeIgnoreId = async (id: string) => {
  const config = await _getStorage('ignored_ids');
  delete config[id];

  return _setStorage('ignored_ids', config);
};

type Settings = {
  not_less_than_highlight_count: number;
  not_less_than_highlight_color: string;
  once_highlight_color: string;
};

export const getSettings = async (): Promise<Settings> => ({
  not_less_than_highlight_count: 10,
  not_less_than_highlight_color: 'red',
  once_highlight_color: 'blue',
  ...(await _getStorage('settings')),
});

export const saveSetting = async (key: string, value: number | string) =>
  _setStorage('settings', {
    ...(await getSettings()),
    [key]: value,
  });
