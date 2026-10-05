/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'child_process';

const getBuildInfo = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const buildDate = `${month}${day}${hours}${minutes}`;

    let commitUrl = '';
    try {
        const commitHash = execSync('git rev-parse HEAD').toString().trim();
        commitUrl = `https://github.com/ayanokoujiiii/EchoTalk/commit/${commitHash}`;
    } catch {
        commitUrl = 'unknown';
    }

    return { buildDate, commitUrl };
};

const { buildDate, commitUrl } = getBuildInfo();

export default defineConfig({
    // On Vercel the app is served from the domain root; on GitHub Pages from /EchoTalk/
    base: process.env.VERCEL ? '/' : '/EchoTalk/',
    root: 'src',
    publicDir: '../public',
    define: {
        __APP_BUILD_DATE__: JSON.stringify(buildDate),
        __APP_COMMIT_URL__: JSON.stringify(commitUrl),
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',

            manifest: {
                name: 'EchoTalk',
                short_name: 'EchoTalk',
                description: 'اپ آفلاین تمرین شدوینگ برای تقویت تلفظ و روانی حرف زدن به انگلیسی.',
                start_url: '.',
                display: 'standalone',
                background_color: '#212529',
                theme_color: '#43b6fd',
                lang: 'fa',
                dir: 'rtl',
                scope: './',
                icons: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },

            workbox: {
                globPatterns: ['**/*.{js,css,mp3,png,json,ico,html,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'pages-cache',
                            expiration: {
                                maxEntries: 3,
                                maxAgeSeconds: 30 * 86400,
                            },
                        },
                    },
                    {
                        // Persian font (Vazirmatn) — cached after first load so the app stays offline-capable
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 365 * 86400,
                            },
                        },
                    },
                ],
            }
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        include: ['./tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary', 'json-summary', 'html'],
            reportsDirectory: resolve(__dirname, './coverage'),
        },
    },
});
