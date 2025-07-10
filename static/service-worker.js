// Service Worker für Asset Caching
const CACHE_NAME = 'pk-box-manager-v1'
const API_CACHE = 'pk-api-v1'

// Cache-Lebensdauer: 24 Stunden
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000

// Hilfsfunktionen
function isCacheExpired(cachedResponse) {
	if (!cachedResponse) return true

	const cachedTime = cachedResponse.headers.get('sw-cached-time')
	if (!cachedTime) return true

	return Date.now() - parseInt(cachedTime) > CACHE_MAX_AGE
}

function createResponseWithTimestamp(response) {
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			...Object.fromEntries(response.headers.entries()),
			'sw-cached-time': Date.now().toString()
		}
	})
}

function cacheResponse(request, response) {
	if (response && response.status === 200 && response.type === 'basic') {
		const responseWithTimestamp = createResponseWithTimestamp(response)
		caches.open(CACHE_NAME).then((cache) => {
			cache.put(request, responseWithTimestamp)
		})
	}
}

// Nur kritische Assets die sofort verfügbar sein müssen
const CRITICAL_ASSETS = [
	'/',
	'/ui/app-background.webp',
	'/spritesheets/util/sw1.webp',
	'/spritesheets/util/st1.webp'
]

// Install Event - Cache nur kritische Assets sofort
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(CRITICAL_ASSETS))
			.then(() => self.skipWaiting())
	)
})

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => self.clients.claim())
	)
})

// Fetch Event - Verschiedene Strategien für verschiedene Content-Typen
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)

	// API Requests - Network first mit fallback zu cache
	if (url.pathname.startsWith('/pkorder') || url.pathname.startsWith('/pkinfo')) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					// Network erfolreich - cache und return
					const responseToCache = response.clone()
					caches.open(API_CACHE).then((cache) => {
						cache.put(event.request, responseToCache)
					})
					return response
				})
				.catch(() => {
					// Network fehlgeschlagen - fallback zu cache
					return caches.match(event.request)
				})
		)
		return
	}

	// Static Assets - Cache mit 24h Invalidierung
	if (
		url.pathname.startsWith('/ui/') ||
		url.pathname.startsWith('/spritesheets/') ||
		url.pathname.startsWith('/boxes/') ||
		url.pathname.startsWith('/origin-marks/') ||
		url.pathname === '/' ||
		url.pathname.endsWith('.js') ||
		url.pathname.endsWith('.css') ||
		url.pathname.endsWith('.webp') ||
		url.pathname.endsWith('.png') ||
		url.pathname.endsWith('.svg') ||
		url.pathname.endsWith('.woff2') ||
		url.pathname.endsWith('.woff')
	) {
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				// Cache ist abgelaufen oder nicht vorhanden
				if (isCacheExpired(cachedResponse)) {
					return fetch(event.request)
						.then((response) => {
							cacheResponse(event.request, response)
							return response
						})
						.catch(() => cachedResponse || fetch(event.request)) // Fallback
				}

				// Cache ist noch frisch
				return cachedResponse
			})
		)
	}
})
