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

app.get("*", function(req, res) {
  res.send("So... you're a spy, huh?")
})

app.post("/name", function(req, res) {
  if(Object.keys(users).find(key => users[key].name.toLowerCase() === req.body.name.toLowerCase())){
    res.send(true);
  }else{
    res.send(false);
  }
})

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://vibezz.live",
    methods: ["GET", "POST"]
  }
});

var queue = [];
var rooms = [];
var waitingList = [];
var users = [];

function isEmptyObject(obj){
  return !Object.keys(obj).length;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function connectPeers(socket, peer){
  var room = socket.id + "#" + peer.id;

  var indexS = queue.indexOf(socket);
  if(indexS != -1){ queue.splice(indexS, 1); }
  var indexP = queue.indexOf(peer);
  if(indexP != -1){ queue.splice(indexP, 1); }

  peer.join(room);
  socket.join(room);
  rooms[peer.id] = room;
  rooms[socket.id] = room;
  console.log(users[socket.id].name + " and " + users[peer.id].name + " joined the room: " + room);

  waitingList[socket.id] = peer;
  socket.emit('room_joined', true, room);
}

function queueSocket(socket){
    if(!isEmptyObject(queue)){ // add both pref case
      var filtered = queue.filter(element => users[element.id].gender === users[socket.id].pref && users[element.id].pref === users[socket.id].gender && users[element.id].using === users[socket.id].using);
      if(isEmptyObject(filtered)){
        queue.push(socket);
        console.log(users[socket.id].name + " joined the queue");
      }else{ 
        if(users[socket.id].using){ 
          let d = [];
          let minDist;
          for(let i=0; i < filtered.length; i++){
            let dist = (getDistanceFromLatLonInKm(users[socket.id].lat, users[socket.id].long, users[filtered[i].id].lat, users[filtered[i].id].long));
              
            console.log(dist);
            console.log(":" + i);
            d[i] = dist;
          }
          minDist = d.min();
          console.log(minDist);
          var peer = filtered[d.indexOf(minDist)];

          if(peer != undefined){ 
            connectPeers(socket, peer);
          }else{
            queue.push(socket);
            console.log(users[socket.id].name + " joined the queue");
          }
        }else{ 
          var peer = filtered[Math.floor(Math.random()*filtered.length)];

          if(peer != undefined){ 
            connectPeers(socket, peer);
          }else{
            queue.push(socket);
            console.log(users[socket.id].name + " joined the queue");
          }
        }
      }
    }else{
      queue.push(socket);
      console.log(users[socket.id].name + " joined the queue");
    }
}

// Sockets
io.on('connection', (socket) => {
  console.log("Socket connected: " + socket.id);

  socket.on('disconnect', () => {
    delete users[socket.id];

    if(waitingList[socket.id]){ delete waitingList[socket.id]; }
    var index = queue.indexOf(socket);
    if(index != -1){ queue.splice(index, 1); }
    console.log("Socket disconnected: " + socket.id);

    if(io.sockets.adapter.rooms[rooms[socket.id]]){ 
      var peerId = rooms[socket.id].split('#');
      peerId = peerId[0] === socket.id ? peerId[1] : peerId[1];
      socket.to(rooms[socket.id]).emit("peer_disconnected");
      console.log("sent");
      delete rooms[socket.id];
    }
  });

  socket.on('join', (data) => {
    console.log(data.name + " joined");
    data.socket = socket;
    users[socket.id] = data;

    queueSocket(socket);
  })

  socket.on('next', () => {
    socket.leave(rooms[socket.id]);
    if(io.sockets.adapter.rooms[rooms[socket.id]]){ 
      var peerId = rooms[socket.id].split('#');
      peerId = peerId[0] === socket.id ? peerId[1] : peerId[1];
      socket.to(rooms[socket.id]).emit("peer_disconnected");
      console.log("sent");
      delete rooms[socket.id];
    }
    queueSocket(socket);
  });

  socket.on('caller_ready', (roomId) => {
    console.log("caller is ready");
    var peer = waitingList[socket.id];
    delete waitingList[socket.id];
    peer.emit('room_joined', false, roomId);
  });

  socket.on('receiver_ready', (roomId) => {
    console.log("receiver is ready");

    var peerIds = roomId.split('#');
    var peersInfo = {
      "0": {
        "name": users[peerIds[0]].name,
        "age": users[peerIds[0]].age,
        "desc": users[peerIds[0]].desc,
      },
      "1": {
        "name": users[peerIds[1]].name,
        "age": users[peerIds[1]].age,
        "desc": users[peerIds[1]].desc,
      },
    }

    io.in(roomId).emit('start_call', peersInfo);
    
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