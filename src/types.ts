type CommentItem = {
  num: string;
  like_count: string;
  body_exclude_reply_no: string;
  no: string;
  author: string;
  blogger_liked: number;
  datetime: string;
  email: null;
  body: string;
  tree_no: string;
  member_id: null;
  id_string: string;
  url: null;
  id: string;
  reply_no: string | null;
};
export type Comment = {
  count: string;
  entries_per_page: string;
  comments: CommentItem[];
};

export type CommentsItem = {
  no: number;
  id: string;
  countById: {
    total: number;
    no: number;
  };
  datetime: string;
  body: string;
  replyNo: number | null;
};

export type Info = {
  count: number;
  perPage: number;
  totalPage: number;
};

export type OnProgress = (comments: CommentsItem[]) => Promise<void>;
