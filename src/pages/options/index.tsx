import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { IgnoredIds } from './ignoredIds';
import { Sites } from './sites';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const index = document.createElement('div');
index.id = 'options';
document.body.appendChild(index);

createRoot(index).render(
  <React.StrictMode>
    <CssBaseline />
    <Container>
      <Box m={3}>
        <Sites />
      </Box>
      <Box m={3}>
        <IgnoredIds />
      </Box>
    </Container>
  </React.StrictMode>,
);
