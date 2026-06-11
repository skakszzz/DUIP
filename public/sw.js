const CACHE = 'duip-v3';

const PRECACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// 활성화 시 구버전 캐시 전부 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push 알림 ────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return;
  const { title, body, tag } = e.data.json();
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: tag ?? 'duip',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const win = list.find((c) => c.url.includes('/today'));
      return win ? win.focus() : clients.openWindow('/workspaces');
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 외부 도메인 (Supabase, fonts 등) → 그냥 통과
  if (url.hostname !== self.location.hostname) return;

  // Next.js 정적 번들 → 캐시 우선 (불변 해시 파일)
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // 이미지 자산 → 캐시 우선
  if (
    url.pathname.startsWith('/pots/') ||
    url.pathname.startsWith('/plants/') ||
    url.pathname.startsWith('/trees/') ||
    url.pathname.startsWith('/icon-')
  ) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // 내비게이션 요청 (페이지 이동) → 반드시 네트워크 우선, 캐시 폴백 없음
  // SSR 페이지는 세션/인증 상태가 필요하므로 캐시 폴백 금지
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request));
    return;
  }

  // 나머지 GET (API 등) → 네트워크 우선, 오프라인 시 캐시 폴백
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (e.request.method === 'GET' && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
