import { defineConfig } from 'vite';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';

const manifest = defineManifest({
  manifest_version: 3,
  name: 'livedoor comment',
  description: 'livedoor comment',
  version: '0.0.18',
  content_scripts: [
    {
      matches: [
        '<all_urls>',
      ],
      run_at: 'document_end',
      js: ['src/index.ts'],
    },
  ],
  background: {
    service_worker: 'src/background.ts',
  },
  options_page: 'src/pages/options/index.html',
  permissions: [
    'storage',
    'unlimitedStorage',
    'contextMenus',
    'clipboardWrite',
  ],
});

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
});
