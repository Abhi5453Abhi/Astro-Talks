// Service Worker for background notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'You have an incoming call',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'incoming-call',
    requireInteraction: true,
    data: data.data || {},
    actions: [
      {
        action: 'accept',
        title: 'Accept Call'
      },
      {
        action: 'reject',
        title: 'Reject Call'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Incoming Call', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  const action = event.action
  const notificationData = event.notification.data || {}
  
  if (action === 'accept') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If a window is already open, focus it
        for (let client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            client.focus()
            // Send message to client to accept call
            client.postMessage({ type: 'accept-call', data: notificationData })
            return
          }
        }
        // Otherwise open a new window
        return clients.openWindow('/?call=accept&callerId=' + (notificationData.callerId || ''))
      })
    )
  } else if (action === 'reject') {
    // Send message to reject call
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let client of clientList) {
          if (client.url.includes('/')) {
            client.postMessage({ type: 'reject-call', data: notificationData })
          }
        }
      })
    )
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let client of clientList) {
          if (client.url.includes('/') && 'focus' in client) {
            return client.focus()
          }
        }
        return clients.openWindow('/')
      })
    )
  }
})

// Handle messages from the app
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})


