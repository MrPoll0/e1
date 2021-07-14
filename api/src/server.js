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


var queue = new Array();
var allUsers = new Array();
var names = new Array();
var genders = new Array();
var rooms = new Array();
var waitingList = new Array();

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
    }else{
      queue.push(socket);
      console.log(names[socket.id] + " joined the queue");
    }
}

// Sockets
io.on('connection', (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on('disconnect', () => {
    delete names[socket.id];
    delete genders[socket.id];
    delete allUsers[socket.id];
    if(waitingList[socket.id]){ delete waitingList[socket.id]; }
    var index = queue.indexOf(socket);
    if(index != -1){ queue.splice(index, 1); }
    console.log("Socket disconnected: " + socket.id);
  });

  socket.on('join', (data) => {
    console.log(data.username + " joined");
    names[socket.id] = data.username;
    genders[socket.id] = data.gender;
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

    var peerIds = roomId.split('#');
    var peerNames = [names[peerIds[0]], names[peerIds[1]]];

    io.in(roomId).emit('start_call', peerNames);
    
    console.log("start_call broadcasted: " + socket.id);
  });
  
  socket.on('webrtc_offer', (event) => {
    console.log(`webrtc_offer to ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp, event.Name)
  })
  socket.on('webrtc_answer', (event) => {
    console.log(`webrtc_answer to ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp, event.Name)
  })
  socket.on('webrtc_ice_candidate', (event) => {
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})

const port = Number(process.env.PORT || 3080);
// starting the server
server.listen(port, () => console.log(`🚀 Server running on port ${port}!`));