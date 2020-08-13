importScripts('https://unpkg.com/dexie@3.0.2/dist/dexie.js');
importScripts('/js/idb.js');
importScripts('/js/db-utils.js');
importScripts('./js/dixie-utils.js');

let STATIC_CACHE = 'static-v3'
let DYNAMIC_CACHE = 'dynamic-v3'
let STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/css/w3.css',
  '/js/app.js',
  '/js/add.js',
  '/js/promise.js',
  '/js/fetch.js',
  '/js/idb.js',
  '/js/db-utils.js',
  '/js/dixie-utils.js',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function (cache) {
        cache.addAll(STATIC_FILES)
      }).catch(function (error) { console.log('[SW] App shell cache wrong error!', error) })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key)
          }
        }))
      })
  )
  return self.clients.claim()
})

function isInArray(string, array) {
  let cachePath
  if (string.indexOf(self.origin) === 0) {
    // console.log('matched ', string)
    cachePath = string.substring(self.origin.length)
  } else {
    cachePath = string
  }
  return array.indexOf(cachePath) > -1
}

self.addEventListener('fetch', function (event) {


  let url = 'https://testvacj.firebaseio.com/images'

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request)
        .then(async function (res) {
          let responseCloned = await res.clone()
          await deleteAllItems()
          responseCloned
            .json()
            .then(function(data) {
              for (let key in data) {
                addItem(data[key])
              }
            })
          return res
        })
    )
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches
        .match(event.request)
        .catch(function (e) { console.log('Error: ', e) })
    )
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then(function (response) {
          if (response) {
            return response
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches
                  .open(DYNAMIC_CACHE)
                  .then(function (cache) {
                    cache.put(event.request.url, res.clone())
                    return res
                  })
              })
              .catch(function (err) {
                return caches.open(STATIC_CACHE)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html')
                    }
                  })
              })
          }
        })
    )
  }

})

