import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import OnCall from "./socket-events/onCall.js"
import OnGroupCall from "./socket-events/OnGroupCall.js"
import OnWebrtcSignal from "./socket-events/onWebrtcSignal.js"
import OnHangUp from "./socket-events/onHangUp.js"

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export let io;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);

  let onLineUsers =[]

  io.on("connection", (socket) => {
    socket.on("addNewUser", (clerkUser) => {
      if (clerkUser && !onLineUsers.some(user => user?.userId === clerkUser.id)) {
        onLineUsers.push(
          { userId: clerkUser.id, socketId: socket.id, profile: clerkUser }
        );
      }
            // send active user
      io.emit("getUsers",onLineUsers)
      // call event
      socket.on("call",OnCall)

       // Gérer un appel de groupe
    socket.on("groupCall", OnGroupCall);
    // web rtc signal
    socket.on('webrtcSignal',OnWebrtcSignal)
    // hang up call
    socket.on('hangUp',OnHangUp)


    });

    socket.on("disconnect",()=>{
      onLineUsers = onLineUsers.filter(user => user.socketId !== socket.id)

      // send active user
      io.emit("getUsers",onLineUsers)

      

    })

  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});