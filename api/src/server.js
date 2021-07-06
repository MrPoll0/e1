const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://mrpoll0.cf",
    methods: ["GET", "POST"]
  }
});


var queue = [];
var allUsers = {};
var names = {};
var rooms = {};
var waitingList = [];

function isEmptyObject(obj){
  return !Object.keys(obj).length;
}

function queueSocket(socket){
    if(!isEmptyObject(queue)){
      var peer = queue.pop();
      var room = socket.id + "#" + peer.id;

      peer.join(room);
      socket.join(room);
      rooms[peer.id] = room;
      rooms[socket.id] = room;
      console.log(names[socket.id] + " and " + names[peer.id] + " joined the room: " + room);

      waitingList[socket.id] = peer;
      socket.emit('room_joined', true, room);
      //peer.emit('room_joined', false, room);
    }else{
      queue.push(socket);
      console.log(names[socket.id] + " joined the queue");
    }
}

// Sockets
io.on('connection', (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on('disconnect', () => {
    console.log("Socket disconnected: " + socket.id);
  });

  socket.on('join', (data) => {
    console.log(data.username + " joined");

    names[socket.id] = data.username;
    allUsers[socket.id] = socket;
    queueSocket(socket);
  })

  socket.on('caller_ready', (roomId) => {
    console.log("caller is ready");
    var peer = waitingList[socket.id];
    delete waitingList[socket.id];
    peer.emit('room_joined', false, roomId);
  });

  socket.on('receiver_ready', (roomId) => {
    console.log("receiver is ready");
    io.in(roomId).emit('start_call');
    
    console.log("start_call broadcasted: " + socket.id);
  });
  
  socket.on('webrtc_offer', (event) => {
    console.log(`webrtc_offer to ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
  })
  socket.on('webrtc_answer', (event) => {
    console.log(`webrtc_answer to ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
  })
  socket.on('webrtc_ice_candidate', (event) => {
    //console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})

const port = Number(process.env.PORT || 3080);
// starting the server
server.listen(port, () => console.log(`🚀 Server running on port ${port}!`));




/*   OOOOOLLLLDDDD

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/user.route');

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());

const port = Number(process.env.PORT || 3080);

app.use(`/api/v1`, userRouter);

// 404 error
app.all('*', (req, res, next) => {
    const err = new HttpException(404, 'Endpoint Not Found');
    next(err);
});

// Error middleware
app.use(errorMiddleware);

// starting the server
app.listen(port, () =>
    console.log(`🚀 Server running on port ${port}!`));


module.exports = app;

*/