import type { CommentsItem } from './types';
import {
  getIgnoredIds,
  getUrlConfig,
  setUrlConfig,
  getSettings,
  addIgnoreId,
} from './storage';
import { setupContextMenu } from './utils';

export const findDateTag = async (date: string) => {
  const cached = await getUrlConfig<string | null | undefined>(
    'tag',
    undefined,
  );
  if (cached !== undefined) return cached;

  const tag = _findDateTag(date);
  await setUrlConfig('tag', tag);

  return tag;
};

const _findDateTag = (date: string) => {
  if (window.document.querySelector('.comment-date')) return '.comment-date';
  if (window.document.querySelector('.comment-list-date'))
    return '.comment-list-date';
  if (window.document.querySelector('[itemProp="datePublished"]'))
    return '[itemProp="datePublished"]';

  const comment =
    window.document.querySelector('#comment') ??
    window.document.querySelector('#comments');
  if (!comment) return null;

  return _searchTag(date, comment);
};

const _searchTag = (value: string, node: ChildNode): string | null => {
  if (!node.hasChildNodes()) {
    if (
      node.textContent &&
      node.textContent.trim().startsWith(value) &&
      node.parentElement?.attributes.length
    ) {
      return `[${node.parentElement.attributes[0].nodeName}="${node.parentElement.attributes[0].nodeValue}"]`;
    }
    return null;
  }

  const children = Array.from(node.childNodes);
  for (const node of children) {
    const result = _searchTag(value, node);
    if (result) return result;
  }

  return null;
};

export const replaceDateTags = async (
  dateTag: string,
  comments: CommentsItem[],
) => {
  const settings = await getSettings();
  const ignoredIds = await getIgnoredIds();
  const nodes = window.document.querySelectorAll(dateTag);
  const hitIgnoredIds: Record<string, true> = {};
  nodes.forEach((node) => {
    // コメント番号を含むコメント全体を取得
    const commentBodyElement =
      node.closest('.comment-set') ??
      node.closest('.comment-list') ??
      node.closest('ul')?.closest('li') ??
      node.closest('li') ??
      node.closest('div') ??
      node;
    const commentBody = commentBodyElement.textContent
      ?.trim()
      ?.replaceAll(/\s+/g, ' ');
    if (commentBody) {
      // ちゃんとコメント番号がついているかチェック
      const matches = commentBody
        .split(' ')[0]
        .trim()
        .match(/^(\d+)/);
      if (matches) {
        // 一致するコメント番号のコメント情報を取得
        const c = comments.find((c) => c.no === Number(matches[1]));
        if (c) {
          if (c.countById.total === 1) {
            if (settings['once_highlight_color']) {
              node.innerHTML = `${c.datetime}　ID:<span class="livedoor-blog-comment-id" style="cursor: pointer; color: ${settings['once_highlight_color']}">${c.id}</span> (${c.countById.no}/${c.countById.total})`;
            } else {
              node.innerHTML = `${c.datetime}　ID:<span class="livedoor-blog-comment-id" style="cursor: pointer">${c.id}</span> (${c.countById.no}/${c.countById.total})`;
            }
          } else {
            if (
              settings['not_less_than_highlight_count'] > 0 &&
              c.countById.total >= settings['not_less_than_highlight_count']
            ) {
              node.innerHTML = `${c.datetime}　ID:<span class="livedoor-blog-comment-id" style="cursor: pointer; color: ${settings['not_less_than_highlight_color']}">${c.id}</span> (${c.countById.no}/${c.countById.total})`;
            } else {
              node.innerHTML = `${c.datetime}　ID:<span class="livedoor-blog-comment-id" style="cursor: pointer">${c.id}</span> (${c.countById.no}/${c.countById.total})`;
            }
          }

          if (ignoredIds.includes(c.id)) {
            // 無視リストの場合は非表示（要素の削除まではしない）
            (commentBodyElement as HTMLElement).style.display = 'none';
            hitIgnoredIds[c.id] = true;
          }
        } else {
          if (!node.querySelector('img.livedoor-comment-loading-img')) {
            node.innerHTML +=
              '<img class="livedoor-comment-loading-img" alt="loading" style="height: 1.4em; vertical-align: middle; margin-left: 6px" src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif"/>';
          }
        }
      }
    }
  });

  await Promise.all(
    Object.keys(hitIgnoredIds).map(async (id) => addIgnoreId(id)),
  );
  setupContextMenu();
};
