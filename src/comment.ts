import type { Comment, CommentsItem, Info, OnProgress } from './types';
import { getSavedComments, saveComments } from './cache';

const getComment = async (
  url: string,
  page: number,
  retry = 5,
): Promise<Comment> => {
  try {
    const response = await fetch(
      url.replace(/\.html$/, '') + '/comment.json?p=' + page,
    );
    if (!response.ok) {
      console.log(response);
      throw new Error();
    }

    return (await response.json()) as Comment;
  } catch (e) {
    if (retry > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return getComment(url, page, retry - 1);
    }

    throw e;
  }
};

const getInfo = async (url: string): Promise<Info> => {
  const comment = await getComment(url, 1);
  const totalPage = Math.ceil(
    Number(comment.count) / Number(comment.entries_per_page),
  );
  if (totalPage > 1) {
    const _comment = await getComment(url, totalPage);
    if (_comment.comments.length) {
      const count = Math.max(
        Number(comment.count),
        ..._comment.comments.map((c) => Number(c.no)),
      );
      return {
        count,
        perPage: Number(comment.entries_per_page),
        totalPage: Math.ceil(count / Number(comment.entries_per_page)),
      };
    }
  }

  const count = Math.max(
    Number(comment.count),
    ...comment.comments.map((c) => Number(c.no)),
  );
  return {
    count,
    perPage: Number(comment.entries_per_page),
    totalPage: Math.ceil(count / Number(comment.entries_per_page)),
  };
};

const getRequired = (
  info: Info,
  comments: CommentsItem[],
): {
  requiredCommentNo: Record<number, number>;
  requiredPages: number[];
} => {
  const requiredCommentNo: Record<number, number> = {};
  const requiredPages: Record<number, number> = {};
  const mapComments = Object.assign(
    {},
    ...(comments.map((c) => ({ [c.no]: true })) as Record<number, true>[]),
  );

  // 255
  // 1-55    1  45-99
  // 56-155  2  100-199
  // 156-255 3  200-299
  const add = info.perPage - (info.count % info.perPage) - 1;
  [...Array(info.count).keys()].forEach((i) => {
    const commentNo = i + 1;
    if (!(commentNo in mapComments)) {
      requiredCommentNo[commentNo] = commentNo;
      const page = Math.ceil((i + add) / info.perPage);
      requiredPages[page] = page;
    }
  });

  return {
    requiredCommentNo,
    requiredPages: Object.values(requiredPages).sort((a, b) => b - a),
  };
};

const updateCountById = (comments: CommentsItem[]) => {
  const count: Record<string, number> = {};
  comments.forEach((c) => {
    if (c.id in count) count[c.id]++;
    else count[c.id] = 1;
    c.countById.no = count[c.id];
  });

  comments.forEach((c) => {
    c.countById.total = count[c.id];
  });
};

export const getComments = async (
  url: string,
  onProgress?: OnProgress,
): Promise<CommentsItem[]> => {
  const info = await getInfo(url);
  const _comments = await getSavedComments(url);
  const { requiredCommentNo, requiredPages } = getRequired(info, _comments);

  if (onProgress) {
    updateCountById(_comments);
    await onProgress(_comments);
  }

  const processComments = async (comment: Comment) => {
    let updated = false;
    comment.comments
      .filter((c) => Number(c.no) in requiredCommentNo)
      .forEach((c) => {
        delete requiredCommentNo[Number(c.no)];
        _comments.push({
          no: Number(c.no),
          id: c.id_string,
          countById: {
            total: 0,
            no: 0,
          },
          datetime: c.datetime,
          body: c.body,
          replyNo: c.reply_no === c.no ? null : Number(c.reply_no),
        });
        updated = true;
      });

    if (updated) {
      _comments.sort((a, b) => a.no - b.no);
      updateCountById(_comments);
      if (onProgress) {
        await onProgress(_comments);
      }
      await saveComments(url, _comments);
    }
  };

  // 足りていないコメントのnoから算出したページのコメントを取得
  await requiredPages.reduce(async (prev, page) => {
    await prev;
    const comment = await getComment(url, page);

    await processComments(comment);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, Promise.resolve());

  // 返信コメントや取得中にコメントされた場合は位置がズレるので、上の処理で取得できなかったものを最新のページから遡って取得
  let page = info.totalPage;
  while (page > 0 && Object.keys(requiredCommentNo).length) {
    const comment = await getComment(url, page);

    await processComments(comment);
    await new Promise((resolve) => setTimeout(resolve, 500));
    page--;
  }

  return _comments;
};

export const format1 = (
  c: CommentsItem,
  no?: number,
  total?: number,
): string => {
  return `${c.no}. ${c.datetime} ID:${c.id}${
    no && total ? ` (${no}/${total})` : ''
  }\n${c.body
    .replaceAll('&gt;&gt;', '>')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('<br />', '\n')}`;
};

export const format2 = (
  c: CommentsItem,
  no?: number,
  total?: number,
): string => {
  return `${c.no}. ${c.datetime} ID:${c.id}${
    no && total ? ` (${no}/${total})` : ''
  }\n${c.body.replaceAll('&gt;&gt;', '>').replaceAll('<br />', '  ')}`;
};
