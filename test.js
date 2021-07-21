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

const port = Number(process.env.PORT || 3080);
// starting the server
server.listen(port, () => console.log(`🚀 Server running on port ${port}!`));


Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };
  
  var coords = new Array();
  coords["a"] = {"lat": 41.2161054, "long": -8.6450551};
  coords["b"] = {"lat": 54.2129527, "long": -8.6398124};
  coords["c"] = {"lat": 876.2171512, "long": -8.6353292};
  coords["d"] = {"lat": 234.2228462, "long": -8.6388582};
  coords["e"] = {"lat": 4543.2285992, "long": -8.6424902};
  coords["f"] = {"lat": 46.2435842, "long": -8.6885768};
  var filtered = [{"id": "a"}, {"id": "b"}, {"id": "c"}, {"id": "d"}, {"id": "e"}, {"id": "f"}];
  
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
  
  function deg2rad(deg) { //  559.0410475424059
    return deg * (Math.PI/180)
  }
   /*
  console.log( getDistanceFromLatLonInKm(coords[filtered[0].id].lat, coords[filtered[0].id].long, coords[filtered[1].id].lat, coords[filtered[1].id].long) )
  
  console.log( getDistanceFromLatLonInKm(coords[filtered[0].id].lat, coords[filtered[0].id].long, coords[filtered[2].id].lat, coords[filtered[2].id].long) )*/
  
  
  let d = new Array();
  let minDist;
  for(let i=0; i < filtered.length; i++){
      for(let j=i+1; j < filtered.length; j++){
          let dist = (getDistanceFromLatLonInKm(coords[filtered[i].id].lat, coords[filtered[i].id].long, coords[filtered[j].id].lat, coords[filtered[j].id].long));
      
      console.log(dist);
      console.log(":" + i);
      console.log("::" + j);
      d.push(dist);
    }
  }
  minDist = d.min();
  console.log(minDist)