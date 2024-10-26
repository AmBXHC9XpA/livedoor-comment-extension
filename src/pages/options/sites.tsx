import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import humanFormat from 'human-format';
import { useCallback, useEffect, useState } from 'react';
import { deleteComments } from '../../cache';
import { deleteUrlConfig, setUrlConfig, getCacheSize } from '../../storage';

type SiteSetting = {
  id: string;
  origin: string;
  tag?: string;
  cacheSize: number;
  isDisabled: boolean;
};

const deleteSite = async (origin: string) => {
  await deleteComments(origin);
  await deleteUrlConfig(origin);
};

const columns: GridColDef[] = [
  {
    field: 'origin',
    headerName: 'URL',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, string>) => {
      return (
        <a
          href={params.value}
          target="_blank"
          rel="noreferrer noopener"
          style={{ cursor: 'pointer' }}
        >
          {params.value}
        </a>
      );
    },
  },
  {
    field: 'tag',
    headerName: 'Tag',
    flex: 0.5,
  },
  {
    field: 'cacheSize',
    headerName: 'キャッシュサイズ',
    flex: 0.4,
    valueFormatter: (params: any) => humanFormat(params.value),
  },
  {
    field: 'isDisabled',
    headerName: 'isDisabled',
    minWidth: 250,
    renderCell: (params: GridRenderCellParams<any, boolean>) => {
      return (
        <ButtonGroup variant="contained">
          <Button
            onClick={() =>
              setUrlConfig('isDisabled', !params.value, params.row.origin)
            }
            size="small"
            color={params.value ? 'primary' : 'warning'}
          >
            {params.value ? '有効化' : '無効化'}
          </Button>
          <Button
            onClick={() => deleteComments(params.row.origin)}
            size="small"
            color="secondary"
          >
            キャッシュ削除
          </Button>
          <Button
            onClick={() => deleteSite(params.row.origin)}
            size="small"
            color="error"
          >
            削除
          </Button>
        </ButtonGroup>
      );
    },
  },
];

const parseStorage = async (
  storage: Record<string, { tag?: string; isDisabled?: boolean }> | undefined,
): Promise<SiteSetting[]> => {
  return Object.entries(storage ?? {}).reduce(
    async (prev, [origin, s]) => {
      const acc = await prev;
      return acc.concat({
        id: origin,
        origin,
        tag: s.tag,
        cacheSize: await getCacheSize(origin),
        isDisabled: s.isDisabled ?? false,
      });
    },
    Promise.resolve([] as SiteSetting[]),
  );
};

export const Sites = () => {
  const [sites, setSites] = useState<SiteSetting[]>([]);

  const onChangedChromeStorage = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if ('urls' in changes) {
        parseStorage(changes.urls.newValue).then((settings) =>
          setSites(settings),
        );
      }
    },
    [],
  );

  useEffect(() => {
    chrome.storage.local.onChanged.addListener(onChangedChromeStorage);

    chrome.storage.local.get('urls').then((value) => {
      parseStorage(value['urls']).then((settings) => setSites(settings));
    });

    return () => {
      chrome.storage.local.onChanged.removeListener(onChangedChromeStorage);
    };
  }, []);

  return (
    <Paper variant="outlined">
      <Typography component="h2" variant="h4" align="center" m={2}>
        サイト一覧
      </Typography>
      <DataGrid
        columns={columns}
        rows={sites}
        density="compact"
        disableRowSelectionOnClick={true}
      />
    </Paper>
  );
};
