import { isIgnoredSite, loadComments, setupCommentLoader } from './utils';

(async () => {
  if (await isIgnoredSite()) return;
  await loadComments(false);
  setupCommentLoader();
})();
