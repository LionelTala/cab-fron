export const env = {

  production: false,
  apiUrl: 'http://localhost:8000/api',
  sanctumUrl: 'http://localhost:8000/sanctum',


  pusher: {
    key: 'lionelskl@90',              // ⭐ Copier depuis .env (PUSHER_APP_KEY)
    cluster: 'mt1',                 // ⭐ Copier depuis .env (PUSHER_APP_CLUSTER)
    host: 'ws-mt1.pusher.com',      // ⭐ ws- + cluster + .pusher.com
    port: 6001,                     // ⭐ Port par défaut de Pusher
    forceTLS: true
  }
}
