import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

/** Node 22.21.0: HTTPS dev + WebSocket upgrade crashes (fixed in 22.21.1). See nodejs/node#60336 */
function nodeHasViteHttpsUpgradeCrash() {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(process.versions.node);
  if (!m) return false;
  return m[1] === '22' && m[2] === '21' && m[3] === '0';
}

// HTTPS for `vite` / `vite preview` only (not `vite build`). Satisfies Stripe.js / wallet prerequisites locally.
export default defineConfig(({ command }) => {
  const serve = command === 'serve';
  const skipHttps = serve && nodeHasViteHttpsUpgradeCrash();
  if (skipHttps) {
    // eslint-disable-next-line no-console -- one-time dev guidance for broken Node release
    console.warn(
      '\n[Vite] Node 22.21.0 breaks HTTPS + HMR; using HTTP for this session. Upgrade to Node 22.21.1+ for https://localhost (https://github.com/nodejs/node/issues/60336).\n'
    );
  }
  const sslPlugins = serve && !skipHttps ? [basicSsl()] : [];
  return {
    plugins: [react(), ...sslPlugins],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          timeout: 120000,
          proxyTimeout: 120000,
          configure(proxy) {
            proxy.on('error', (err, _req, res) => {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    message:
                      'API unreachable (start backend: npm run backend from repo root, or npm run dev in backend/).',
                  })
                );
              }
              console.error('[vite proxy]', err.code || err.message);
            });
          },
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          timeout: 120000,
          proxyTimeout: 120000,
        },
      },
    },
  };
});
