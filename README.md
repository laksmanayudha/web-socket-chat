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

Hi Everyone. This time I'm trying to implement a web socket to create a chat application called S'Chats (Simple Chats) using node.js as the backend.

Web socket is a communication protocol on a computer that provides a two-way communication channel simultaneously (full-duplex). This protocol allows the server to send messages directly to the client without prior request by the client. Therefore, web sockets allow real-time transfer of data. As an example in the chat application.

The way this application works is first, every time the application is opened, the application will send an http request to the server to ask for a protocol upgrade to become a web socket. Second, the client again sends a request to save the channel and username on the server. The server will provide an id to label the channel used by the user. Third, when the user sends a message, a request is made to the server, the server receives the message, finds the receiving channel, and forwards it to the message receiving channel.

I also implemented a little PWA in the application so that it can be installed on mobile devices so that users can experience using mobile applications via the web.

======
Hi Everyone. Kali ini saya mencoba untuk mengimplementasikan web socket untuk membuat aplikasi chat bernama S'Chats (Simple Chats) menggunakan node.js sebagai backendnya dan sedikit PWA (Progressive Web Apps) agar dapat diinstall pada mobile device.

Web socket merupakan protokol komunikasi pada komputer yang menyediakan saluran komunikasi dua arah secara bersamaan (full-duplex). Protokol ini memungkinkan server mengirim pesan langsung ke klien tanpa adanya terlebih dahulu request oleh klien. Oleh karena itu, web socket memungkinkan perpindahan data secara real-time. Seperti contohnya pada aplikasi chat.

Cara kerja aplikasi ini pertama - tama, setiap aplikasi dibuka, aplikasi akan mengirimkan request http ke server untuk meminta upgrade protokol menjadi web socket. Kedua, klien kembali mengirim request untuk menyimpan channel dan nama pengguna di server. Server akan memberikan id untuk melabeli channel yang digunakan oleh pengguna. Ketiga, ketika pengguna mengirim pesan, request di buat ke server, server menerima pesan, mencari channel penerima, dan meneruskannya ke channel penerima pesan.

Saya juga mengimplementasikan sedikit PWA pada aplikasi agar dapat diinstall pada mobile device sehingga pengguna dapat merasakan pengalamana menggunakan aplikasi mobile melelui web.
