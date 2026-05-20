self.addEventListener('push', function (event) {
  if (!event.data) return;

  let data = { title: 'Kafi', body: '' };
  try { data = event.data.json(); } catch { data.body = event.data.text(); }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Post message to focused clients so page can show an in-app toast
      clients.forEach(client => {
        if (client.focused) client.postMessage({ type: 'push', ...data });
      });

      // Always show system notification regardless of focus
      return self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'kafi',
        renotify: true,
        requireInteraction: false,
      });
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const focused = clients.find(c => c.focused);
      if (focused) return focused.focus();
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
