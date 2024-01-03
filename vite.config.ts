import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { crx, defineManifest } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';

const viteManifestHackIssue846: Plugin & { renderCrxManifest: (manifest: any, bundle: any) => void } = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json'];
    bundle['manifest.json'].fileName = 'manifest.json';
    delete bundle['.vite/manifest.json'];
  },
};

const manifest = defineManifest({
  manifest_version: 3,
  name: 'livedoor comment',
  description: 'livedoor comment',
  version: '0.0.15',
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
    viteManifestHackIssue846,
    crx({ manifest }),
  ],
});
