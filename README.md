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

A web socket is a communication protocol on a computer that provides a two-way communication channel simultaneously (full-duplex). This protocol allows the server to send messages directly to the client without prior request by the client. Therefore, web sockets allow the real-time transfer of data, as an example in the chat application.

The way this application works is first, every time the application is opened, the application will send an HTTP request to the server to ask for a protocol upgrade to become a web socket. Second, the client again sends a request to save the channel and username on the server. The server will provide an id to label the channel the user uses. Third, when the user sends a message, a request is made to the server, and the server receives the message, finds the recipient's channel, and forwards the message to the recipient.

I also implemented a little PWA (Progressive Web Apps) in the application so that it can be installed on mobile devices so that users can experience using mobile applications via the web.
