import type { CommentsItem } from './types';
import $ from 'jquery';
import { getSavedComments } from './cache';
import { format1, format2, getComments } from './comment';
import { addIgnoreId, getUrlConfig, setUrlConfig } from './storage';
import { findDateTag, replaceDateTags } from './tag';

import 'jquery-ui-pack';
import 'jquery-contextmenu/dist/jquery.contextMenu.css';
import 'jquery-contextmenu/dist/jquery.contextMenu.js';

const disable = async () => {
  return setUrlConfig('isDisabled', true);
};

const process = async (comments: CommentsItem[]) => {
  if (!comments.length) return;

  const dateTag = await findDateTag(comments[comments.length - 1].datetime);
  if (!dateTag) {
    await disable();
    return;
  }

  await replaceDateTags(dateTag, comments);
};

export const isIgnoredSite = async (): Promise<boolean> => {
  if (!/^\/archives\/\d+\.html/.test(window.location.pathname)) return true;

  return getUrlConfig('isDisabled', false);
};

const getUrl = () => window.location.origin + window.location.pathname;

export const loadComments = async (checkLoading = true) => {
  if (checkLoading && (await getUrlConfig('isLoading', false))) return;

  try {
    await setUrlConfig('isLoading', true);
    return await getComments(getUrl(), process);
  } catch (e) {
    console.log(e);
    await disable();
    return [];
  } finally {
    await setUrlConfig('isLoading', false);
  }
};

export const setupCommentLoader = () => {
  const target = window.document.querySelector(
    '#ld_blog_article_comment_pager_link a',
  );
  if (!target) return;

  target.addEventListener('click', () =>
    new Promise((resolve) => setTimeout(resolve, 1500)).then(() =>
      loadComments(),
    ),
  );
};

const writeTextToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then();
  } else {
    const id = 'livedoor-comment-extension-clip-text';
    if (!document.querySelector(`#${id}`)) {
      const $input = document.createElement('textarea');
      $input.id = id;
      $input.style.position = 'absolute';
      $input.style.left = '-100vw';
      $input.style.top = '0';
      document.body.appendChild($input);
    }

    const $input = document.querySelector(`#${id}`)! as HTMLInputElement;
    $input.value = text;
    $input.select();
    document.execCommand('copy');
  }
};

export const setupContextMenu = () => {
  $.contextMenu({
    selector: '.livedoor-blog-comment-id',
    items: {
      ignoreId: {
        name: '無視IDに追加',
        callback: function (_: string, opt: any) {
          addIgnoreId(opt.$trigger[0].textContent).then(() => loadComments());
        },
      },
      getUserId: {
        name: 'ユーザーIDをコピー',
        callback: function (_: string, opt: any) {
          writeTextToClipboard(opt.$trigger[0].textContent);
        },
      },
      getCommentList: {
        name: 'コメント一覧をコピー',
        items: {
          getCommentList1: {
            name: '通常',
            callback: function (_: string, opt: any) {
              getSavedComments(getUrl()).then((comments) => {
                const filtered = comments.filter(
                  (c) => c.id === opt.$trigger[0].textContent,
                );
                writeTextToClipboard(
                  filtered.map((c) => format1(c)).join('\n\n'),
                );
              });
            },
          },
          getCommentList2: {
            name: '通常(コメント数付き)',
            callback: function (_: string, opt: any) {
              getSavedComments(getUrl()).then((comments) => {
                const filtered = comments.filter(
                  (c) => c.id === opt.$trigger[0].textContent,
                );
                writeTextToClipboard(
                  filtered
                    .map((c, index) => format1(c, index + 1, filtered.length))
                    .join('\n\n'),
                );
              });
            },
          },
          getCommentList3: {
            name: '改行->空白',
            callback: function (_: string, opt: any) {
              getSavedComments(getUrl()).then((comments) => {
                const filtered = comments.filter(
                  (c) => c.id === opt.$trigger[0].textContent,
                );
                writeTextToClipboard(
                  filtered.map((c) => format2(c)).join('\n\n'),
                );
              });
            },
          },
          getCommentList4: {
            name: '改行->空白(コメント数付き)',
            callback: function (_: string, opt: any) {
              getSavedComments(getUrl()).then((comments) => {
                const filtered = comments.filter(
                  (c) => c.id === opt.$trigger[0].textContent,
                );
                writeTextToClipboard(
                  filtered
                    .map((c, index) => format2(c, index + 1, filtered.length))
                    .join('\n\n'),
                );
              });
            },
          },
        },
      },
    },
  });
};

export const getArraySize = (value: any[]): number =>
  JSON.stringify(value).replace(/[\[\],"]/g, '').length;
