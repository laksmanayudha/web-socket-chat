const cacheName = "simple-chats-caches";
const assets = [
    "/",
    "/index.html",
    "/css/adminlte/adminlte.min.css",
    "/css/adminlte/fontawesome.min.css",
    "/css/adminlte/toastr.min.css",
    "/css/webfonts",
    "/css/main.css",
    "/img/icon.png",
    "/js/adminlte/adminlte.min.js",
    "/js/adminlte/bootstrap.bundle.min.js",
    "/js/adminlte/jquery.min.js",
    "/js/adminlte/toastr.min.js",
    "/js/chat/ChatDisplay.js",
    "/js/chat/Client.js",
    "/js/chat/Conversation.js",
    "/js/chat/index.js",
    "/js/helper.js",
    "/js/pwa.js",
    "/app.js"
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => {
                cache.addAll(assets)
            })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches
            .match(e.request)
            .then((res) => {
                return res || fetch(e.request);
            })
    );
});