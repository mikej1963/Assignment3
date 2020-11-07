self.addEventListener('install', function(event) {
    var indexPage = new Request('main.html');
    event.waitUntil(
        fetch(indexPage).then(function(response){
            return caches.open('pwabuilder-offline').then(function(cache){
                console.log('Cached index page during install: ' + response.url);
                return cache.put(indexPage, response);
            });
        }));
});

// If any fetch fails, it will look for request in the cache
self.addEventListener('fetch', function(event){
    var updateCache = function(request){
        return fetch(request).then(function(response){
            console.log('[PWA Builder] add page to offline ' + response.url);
            return cache.put(request, response);
        });
    };
    event.waitUntil(updateCache(event.request));
    event.respondWith(
        fetch(event.request).catch(function(error){
            console.log('[PWA Builder] network request failed');
            // Check to see if it's in cache
            // Return response
            // If not in the cache, return error page
            return caches.open('pwabuilder-offline').then(function(cache){
                return cache.match(event.request).then(function(matching){
                    var report = !matching || matching.status == 404?"error": "error";
                    return report;
                });
            });
        })
    );
}); 