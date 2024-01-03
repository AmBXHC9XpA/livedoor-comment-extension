import type { CommentsItem } from './types';
import { getUrlConfig, setUrlConfig } from './storage';
import { getArraySize } from './utils';

export const getSavedComments = async (
  url: string,
): Promise<CommentsItem[]> => {
  const cache = await chrome.storage.local.get(url);
  return cache[url] ?? [];
};

export const saveComments = async (
  url: string,
  comments: CommentsItem[],
): Promise<void> => {
  const origin = new URL(url).origin;
  await Promise.all([
    chrome.storage.local.set({
      [url]: comments,
    }),
    setUrlConfig(
      'urls',
      {
        ...(await getUrlConfig('urls', {}, origin)),
        [url]: getArraySize(comments),
      },
      origin,
    ),
  ]);
};

const getUrls = async (origin: string): Promise<string[]> =>
  Object.keys(await getUrlConfig('urls', {}, origin));

export const deleteComments = async (origin: string): Promise<void> => {
  const urls = await getUrls(origin);
  await Promise.all([
    urls.reduce(async (prev, url) => {
      await prev;
      await chrome.storage.local.remove(url);
    }, Promise.resolve()),
    setUrlConfig('urls', {}, origin),
  ]);
};
