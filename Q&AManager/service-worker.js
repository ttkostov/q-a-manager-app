const cacheName = "q-a-manager-cache-v1";
const contentToCache = [
    "./assets/icons/android-chrome-512x512.png",
    "./assets/img/screenshot_16_9_categories.png",
    "./assets/img/screenshot_16_9_manage.png",
    "./assets/img/screenshot_16_9_server.png",
    "./assets/img/screenshot_phone_index.png",
    "./assets/img/screenshot_phone_server.png",
    "./assets/img/screenshot_tablet.png",
    "./assets/styles/screenshot_tablet.png",
    "./assets/styles/accordion_stylesheet.css",
    "./assets/styles/backup_stylesheet.css",
    "./assets/styles/dialog_stylesheet.css",
    "./assets/styles/global_stylesheet.css",
    "./assets/styles/manage_stylesheet.css",
    "./assets/styles/navigation_stylesheet.css",
    "./assets/styles/search_stylesheet.css",
    "./data/config.json",
    "./data/example-questions.json",
    "./data/navigation.json",
    "./data/translations.json",
    "./js/backup.js",
    "./js/backup-client.js",
    "./js/categories.js",
    "./js/element-builders.js",
    "./js/global.js",
    "./js/index.js",
    "./js/manage.js",
    "./js/service-worker.js",
    "./js/test-indexeddb.js",
    "./js/tinycolor.js",
    "./pages/backup.html",
    "./pages/categories.html",
    "./pages/index.html",
    "./pages/manage.html"
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(cacheName).then(cache => {
            cache.addAll(contentToCache).catch(() => {
                console.log("Error by installing the app");
            });
        })
    )
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
});