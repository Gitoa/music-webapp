import {parseQueryString, paramsToURL} from 'common/js/util'

const { assets } = global.serviceWorkerOption

const CACHE_NAME = 'v1' || new Date().toISOString()

let assetsToCache = [...assets, './']

assetsToCache = assetsToCache.map(path => {
  return new URL(path, global.location).toString()
})

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log(assetsToCache)
      return cache.addAll(assetsToCache);
    }).catch(error => {
      console.error(error)
      throw error
    })
  );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      let urlObj = parseQueryString(event.request.url)
      if ('mid' in urlObj) {
        return caches.match(urlObj.mid).then(function(response) {
          if (response !== undefined) {
            return response
          } else {
            return fetch(event.request).then(function(response) {
              if ('download' in urlObj) {
                let responseClone = response.clone();
              
                caches.open(CACHE_NAME).then(function (cache) {
                  cache.put(urlObj.mid, responseClone);
                });
              }
              return response
            })
          }
        })
      } else {
        return fetch(event.request).then(function (response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let url = event.request.url
          if (/at.alicdn.com\/t\/font/.test(url)) {
            let responseClone = response.clone()
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone)
            })
          }
          return response;
        }).catch(function () {
          console.log('no matched')
        });
      }
    }})
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['v1'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});