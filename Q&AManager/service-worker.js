const cacheName = "q-a-manager-cache-v1";
const contentToCache = [
    "./assets/icons/android-chrome-512x512.png",
    /*
    "/assets/img/screenshot_16_9_categories.png",
    "/assets/img/screenshot_16_9_manage.png",
    "/assets/img/screenshot_16_9_server.png",
    "/assets/img/screenshot_phone_index.png",
    "/assets/img/screenshot_phone_server.png",
    "/assets/img/screenshot_tablet.png",
    "/assets/styles/screenshot_tablet.png",
    "/assets/styles/accordion_stylesheet.css",
    "/assets/styles/backup_stylesheet.css",
    "/assets/styles/dialog_stylesheet.css",
    "/assets/styles/global_stylesheet.css",
    "/assets/styles/manage_stylesheet.css",
    "/assets/styles/navigation_stylesheet.css",
    "/assets/styles/search_stylesheet.css",
    "/data/config.json",
    "/data/example-questions.json",
    "/data/navigation.json",
    "/data/translations.json",
    "/js/backup.js",
    "/js/backup-client.js",
    "/js/categories.js",
    "/js/element-builders.js",
    "/js/global.js",
    "/js/index.js",
    "/js/manage.js",
    "/js/service-worker.js",
    "/js/test-indexeddb.js",
    "/js/tinycolor.js",
    "/pages/backup.html",
    "/pages/categories.html",
    "/pages/index.html",
    "/pages/manage.html" */
];


self.addEventListener("install", (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        (async function () {
            let cache = await caches.open(cacheName);
            console.log('[Service Worker] Caching all...');
            await cache.addAll(contentToCache);
        })(),
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            let matches = await caches.match(e.request);
            console.log('[Service Worker] Fetching resource ' + e.request.url);
            if(matches) {
                return matches;
            }

            let response = await fetch(e.request);
            let cache = await caches.open(cacheName);
            console.log('[Service Worker] Caching resource ' + e.request.url);
            cache.put(e.request, response.clone());
            return response;

        })
    )
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === cacheName) {
                        return;
                    }
                    return caches.delete(key);
                }),
            );
        }),
    );
});
