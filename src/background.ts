import { getSettings, saveSetting } from './storage';

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  await chrome.storage.local.set({ settings });

  const parent1 = chrome.contextMenus.create({
    id: 'livedoor_blog_comment_extension',
    title: 'Livedoor blog コメント',
  });
  chrome.contextMenus.create({
    parentId: parent1,
    id: 'open_options',
    title: 'オプション',
  });
  chrome.contextMenus.create({
    parentId: parent1,
    id: 'clear_cache',
    title: '全てのキャッシュを削除',
  });

  {
    const count = settings['not_less_than_highlight_count'];
    const parent2 = chrome.contextMenus.create({
      id: 'not_less_than_highlight',
      parentId: parent1,
      title: '大量書き込み',
    });
    const parent3 = chrome.contextMenus.create({
      id: 'not_less_than_highlight_count',
      parentId: parent2,
      title: '件数',
    });
    chrome.contextMenus.create({
      parentId: parent3,
      id: 'not_less_than_highlight_count_invalid',
      title: '強調しない',
      type: 'radio',
      checked: count === 0,
    });
    chrome.contextMenus.create({
      parentId: parent3,
      id: 'not_less_than_highlight_count_5',
      title: '5件以上を強調',
      type: 'radio',
      checked: count === 5,
    });
    chrome.contextMenus.create({
      parentId: parent3,
      id: 'not_less_than_highlight_count_10',
      title: '10件以上を強調',
      type: 'radio',
      checked: count === 10,
    });
    chrome.contextMenus.create({
      parentId: parent3,
      id: 'not_less_than_highlight_count_15',
      title: '15件以上を強調',
      type: 'radio',
      checked: count === 15,
    });
    chrome.contextMenus.create({
      parentId: parent3,
      id: 'not_less_than_highlight_count_20',
      title: '20件以上を強調',
      type: 'radio',
      checked: count === 20,
    });

    const color = settings['not_less_than_highlight_color'];
    const parent4 = chrome.contextMenus.create({
      id: 'not_less_than_highlight_color',
      parentId: parent2,
      title: '色',
    });
    chrome.contextMenus.create({
      parentId: parent4,
      id: 'not_less_than_highlight_color_red',
      title: '赤',
      type: 'radio',
      checked: color === 'red',
    });
    chrome.contextMenus.create({
      parentId: parent4,
      id: 'not_less_than_highlight_color_green',
      title: '緑',
      type: 'radio',
      checked: color === 'green',
    });
    chrome.contextMenus.create({
      parentId: parent4,
      id: 'not_less_than_highlight_color_blue',
      title: '青',
      type: 'radio',
      checked: color === 'blue',
    });
  }

  {
    const color = settings['once_highlight_color'];
    const parent2 = chrome.contextMenus.create({
      id: 'once_highlight',
      parentId: parent1,
      title: '単発',
    });
    chrome.contextMenus.create({
      parentId: parent2,
      id: 'once_highlight_color_invalid',
      title: '強調しない',
      type: 'radio',
      checked: color === '',
    });
    chrome.contextMenus.create({
      parentId: parent2,
      id: 'once_highlight_color_grey',
      title: '灰色',
      type: 'radio',
      checked: color === 'darkgrey',
    });
    chrome.contextMenus.create({
      parentId: parent2,
      id: 'once_highlight_color_red',
      title: '赤',
      type: 'radio',
      checked: color === 'red',
    });
    chrome.contextMenus.create({
      parentId: parent2,
      id: 'once_highlight_color_green',
      title: '緑',
      type: 'radio',
      checked: color === 'green',
    });
    chrome.contextMenus.create({
      parentId: parent2,
      id: 'once_highlight_color_blue',
      title: '青',
      type: 'radio',
      checked: color === 'blue',
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  switch (info.menuItemId) {
    case 'open_options':
      chrome.runtime.openOptionsPage();
      break;
    case 'clear_cache':
      await chrome.storage.local.clear();
      break;
    case 'not_less_than_highlight_count_invalid':
      await saveSetting('not_less_than_highlight_count', 0);
      break;
    case 'not_less_than_highlight_count_5':
      await saveSetting('not_less_than_highlight_count', 5);
      break;
    case 'not_less_than_highlight_count_10':
      await saveSetting('not_less_than_highlight_count', 10);
      break;
    case 'not_less_than_highlight_count_15':
      await saveSetting('not_less_than_highlight_count', 15);
      break;
    case 'not_less_than_highlight_count_20':
      await saveSetting('not_less_than_highlight_count', 20);
      break;
    case 'not_less_than_highlight_color_red':
      await saveSetting('not_less_than_highlight_color', 'red');
      break;
    case 'not_less_than_highlight_color_green':
      await saveSetting('not_less_than_highlight_color', 'green');
      break;
    case 'not_less_than_highlight_color_blue':
      await saveSetting('not_less_than_highlight_color', 'blue');
      break;
    case 'once_highlight_color_invalid':
      await saveSetting('once_highlight_color', '');
      break;
    case 'once_highlight_color_grey':
      await saveSetting('once_highlight_color', 'darkgrey');
      break;
    case 'once_highlight_color_red':
      await saveSetting('once_highlight_color', 'red');
      break;
    case 'once_highlight_color_green':
      await saveSetting('once_highlight_color', 'green');
      break;
    case 'once_highlight_color_blue':
      await saveSetting('once_highlight_color', 'blue');
      break;
  }
});
