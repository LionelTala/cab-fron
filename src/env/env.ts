export const env = {

  production: false,
  apiUrl: 'https://cabbackend.alwaysdata.net/api',
  sanctumUrl: 'https://cabbackend.alwaysdata.net/sanctum',


  pusher: {
    key: 'lionelskl@90',              // ⭐ Copier depuis .env (PUSHER_APP_KEY)
    cluster: 'mt1',                 // ⭐ Copier depuis .env (PUSHER_APP_CLUSTER)
    host: 'ws-mt1.pusher.com',      // ⭐ ws- + cluster + .pusher.com
    port: 6001,                     // ⭐ Port par défaut de Pusher
    forceTLS: true
  }
}
