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

app.get("/", function(req, res) {
  res.send("So... you're a spy, huh?")
})

app.post("/name", function(req, res) {
  if(Object.keys(names).find(key => names[key] === req.body.name)){
    res.send(true);
  }else{
    res.send(false);
  }
})

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://mrpoll0.cf",
    methods: ["GET", "POST"]
  }
});


var queue = [];
var allUsers = [];
var names = [];
var genders = [];
var rooms = [];
var waitingList = [];
var preferences = [];
var coords = [];

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
  console.log(names[socket.id] + " and " + names[peer.id] + " joined the room: " + room);

  waitingList[socket.id] = peer;
  socket.emit('room_joined', true, room);
}

function queueSocket(socket){
    if(!isEmptyObject(queue)){
      var filtered = queue.filter(element => genders[element.id] === preferences[socket.id] && preferences[element.id] === genders[socket.id] && coords[element.id].using === coords[socket.id].using);
      if(isEmptyObject(filtered)){
        queue.push(socket);
        console.log(names[socket.id] + " joined the queue");
      }else{ 
        if(coords[socket.id].using){ 
          let d = [];
          let minDist;
          for(let i=0; i < filtered.length; i++){
            let dist = (getDistanceFromLatLonInKm(coords[socket.id].lat, coords[socket.id].long, coords[filtered[i].id].lat, coords[filtered[i].id].long));
              
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
            console.log(names[socket.id] + " joined the queue");
          }
        }else{ 
          var peer = filtered[Math.floor(Math.random()*filtered.length)];

          if(peer != undefined){ 
            connectPeers(socket, peer);
          }else{
            queue.push(socket);
            console.log(names[socket.id] + " joined the queue");
          }
        }
      }
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
    delete preferences[socket.id];
    delete allUsers[socket.id];
    delete coords[socket.id];
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
    console.log(data.username + " joined");
    names[socket.id] = data.username;
    genders[socket.id] = data.gender;
    preferences[socket.id] = data.pref;
    allUsers[socket.id] = socket;

    if(data.lat != undefined && data.long != undefined){
      coords[socket.id] = {"using": true, "lat": data.lat, "long": data.long};
    }else{
      coords[socket.id] = {"using": false};
    }

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