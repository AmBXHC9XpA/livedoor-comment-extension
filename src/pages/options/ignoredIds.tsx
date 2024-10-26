import type {
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { removeIgnoreId } from '../../storage';

type IgnoredIdSetting = {
  id: string;
  lastHit: number | undefined;
};

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    flex: 1,
  },
  {
    field: 'lastHit',
    headerName: '最終ヒット日時',
    flex: 0.5,
    valueFormatter: (params: any) =>
      params.value === undefined
        ? ''
        : dayjs(params.value).format('YYYY/MM/DD HH:mm:ss'),
  },
  {
    field: '',
    headerName: '操作',
    minWidth: 150,
    renderCell: (params: GridRenderCellParams<any, boolean>) => {
      return (
        <ButtonGroup variant="contained">
          <Button
            onClick={() => removeIgnoreId(params.row.id)}
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

const parseStorage = (
  storage: Record<string, true | number> | undefined,
): IgnoredIdSetting[] => {
  return Object.entries(storage ?? {}).map(([id, lastHit]) => ({
    id,
    lastHit: lastHit === true ? undefined : lastHit,
  }));
};

export const IgnoredIds = () => {
  const [ignoredIds, setIgnoredIds] = useState<IgnoredIdSetting[]>([]);

  const onChangedChromeStorage = useCallback(
    (changes: Record<string, chrome.storage.StorageChange>) => {
      if ('ignored_ids' in changes) {
        setIgnoredIds(parseStorage(changes.ignored_ids.newValue));
      }
    },
    [],
  );

  useEffect(() => {
    chrome.storage.local.onChanged.addListener(onChangedChromeStorage);

    chrome.storage.local.get('ignored_ids').then((value) => {
      setIgnoredIds(parseStorage(value['ignored_ids']));
    });

    return () => {
      chrome.storage.local.onChanged.removeListener(onChangedChromeStorage);
    };
  }, []);

  return (
    <Paper variant="outlined">
      <Typography component="h2" variant="h4" align="center" m={2}>
        無視ID一覧
      </Typography>
      <DataGrid
        columns={columns}
        rows={ignoredIds}
        density="compact"
        disableRowSelectionOnClick={true}
        initialState={{
          sorting: {
            sortModel: [{ field: 'lastHit', sort: 'desc' }],
          },
        }}
      />
    </Paper>
  );
};
