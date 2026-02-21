import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import handlebars from 'vite-plugin-handlebars';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import { ViteWebfontDownload as webfont } from 'vite-plugin-webfont-dl';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/', // fuerza rutas absolutas
  assetsInclude: ['**/*.svg'],
  build: {
    minify: true,
    rollupOptions: {
      input: {
        viewer: resolve(__dirname, 'index.html'),
        editor: resolve(__dirname, 'editor.html'),
        settings: resolve(__dirname, 'settings.html'),
      },
    },
  },
  plugins: [
    // fix absoluto para los iconos dentro de CSS
    {
      name: 'fix-css-urls',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const f of Object.values(bundle)) {
          if (f.type === 'asset' && f.fileName.endsWith('.css') && typeof f.source === 'string') {
            f.source = f.source
              // cualquier url('toggle/…') → url('/toggle/…')
              .replace(/url\((['"]?)toggle\//g, "url($1/toggle/")
              // por si quedaron en css/toggle
              .replace(/url\((['"]?)css\/toggle\//g, "url($1/toggle/");
          }
        }
      }
    },
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
      helpers: {
        activeIf(context, name) {
          return context === name ? ' navbar__link--active' : '';
        },
      },
    }),
    webfont(
      'https://fonts.googleapis.com/css2?family=Lato:wght@400;900&display=swap',
    ),
    pwa({
      manifest: false,
      workbox: {
        cacheId: 'maskable.app',
        globPatterns: [
          '*.{html,css,svg,woff2}',
          'assets/*.js',
          'demo/*.{png,svg}',
          'favicon/favicon_*.png',
          'toggle/*.svg',
        ],
        globIgnores: ['assets/*-legacy.*.js', 'open'],
        ignoreURLParametersMatching: [/demo/, /fbclid/],
      },
    }),
    legacy({
      targets: ['defaults', 'not IE 11', 'kaios >= 2'],
    }),
  ],
});
