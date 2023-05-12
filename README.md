# web-socket-chat
Learning Web Socket by creating Simple Chats Application

## References
- https://javascript.info/websocket
- https://datatracker.ietf.org/doc/html/rfc6455
- https://www.cometchat.com/blog/chat-application-architecture-and-system-design
- https://www.cometchat.com/tutorials/what-is-websockets
- https://www.tech101.in/how-chat-applications-work/
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
- https://github.com/websockets/ws#api-docs
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Deployed Apps
- Backend Api: https://web-socket-chat-production.up.railway.app/
- The Apps: https://web-socket-chat-rho.vercel.app/

## Description
Hi Everyone. Kali ini saya mencoba untuk mengimplementasikan web socket untuk membuat aplikasi chat bernama S'Chats (Simple Chats) menggunakan node.js sebagai backendnya dan sedikit PWA (Progressive Web Apps) agar dapat diinstall pada mobile device.

Web socket merupakan protokol komunikasi pada komputer yang menyediakan saluran komunikasi dua arah secara bersamaan (full-duplex). Protokol ini memungkinkan server mengirim pesan langsung ke klien tanpa adanya terlebih dahulu request oleh klien. Oleh karena itu, web socket memungkinkan perpindahan data secara real-time. Seperti contohnya pada aplikasi chat.

Cara kerja aplikasi ini pertama - tama, setiap aplikasi dibuka, aplikasi akan mengirimkan request http ke server untuk meminta upgrade protokol menjadi web socket. Kedua, klien kembali mengirim request untuk menyimpan channel dan nama pengguna di server. Server akan memberikan id untuk melabeli channel yang digunakan oleh pengguna. Ketiga, ketika pengguna mengirim pesan, request di buat ke server, server menerima pesan, mencari channel penerima, dan meneruskannya ke channel penerima pesan.

Saya juga mengimplementasikan sedikit PWA pada aplikasi agar dapat diinstall pada mobile device sehingga pengguna dapat merasakan pengalamana menggunakan aplikasi mobile melelui web.
