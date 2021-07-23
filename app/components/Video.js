import { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";
import socket from "socket.io-client/lib/socket";

const Video = () => {
    const ENDPOINT = "https://api.mrpoll0.cf";

    const iceServers = {
        iceServers: [
          { url: 'stun:stun.l.google.com:19302'  },
          { url: 'stun:stun1.l.google.com:19302' },
          { url: 'stun:stun2.l.google.com:19302' },
          { url: 'stun:stun3.l.google.com:19302' },
          { url: 'stun:stun4.l.google.com:19302' },
          { url: 'stun:turn.mrpoll0.cf' },
          {
            url: 'turn:turn.mrpoll0.cf',
            credential: 'qwertyuiopasdfghjklñzxcvbnm121;!',
            username: 'admin',
          },
        ],
    }

    let remoteStream;
    let isCaller;
    let rtcPeerConnection; // Connection between the local device and the remote peer.
    let roomId;

    const mediaConstraints = {
        audio: true,
        video: { width: 1280, height: 720 },
    }
    const [roomN, setRoomN] = useState("");
    const [show, setShow] = useState("");
    const [joinedRoom, setJoinedRoom] = useState("");
    const [name, setName] = useState("");
    const [streaming, setStreaming] = useState();
    const [remoting, setRemoting] = useState();
    const [gender, setGender] = useState();
    const [pref, setPref] = useState();
    const [pos, setPos] = useState([]);
    const [peerName, setPeerName] = useState();
    const videoRef = useRef(null);
    const videoRRef = useRef(null);

    const isMounted = useRef(false);

    const handleChange = (e) => {
        setRoomN(e.target.value);
    }

    async function nameTaken(uName){
      let res = await fetch(`https://api.mrpoll0.cf/name`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: uName})
      }).then(response => response.json())
        .then((body) => {
          return body;
        });
      return res;
    }

    function handleCheckbox(){
      if(document.querySelector("input[name='geo']").checked){
        if(window.navigator.geolocation){
          window.navigator.geolocation.getCurrentPosition(setPos);
        }else{
          alert("Distance not available");
        }
      }else{
        setPos([]);
      }
    }

    async function handleClick(e){
      if(!(roomN != "" && document.querySelector("input[name='gender']:checked") !== null && document.querySelector("input[name='pref']:checked") !== null)){
        alert("Please, fill in your personal information");
      }else{
        let taken
        try{
          taken = await nameTaken(roomN);
        }catch(err){
          console.log(err);
        }
        if(!taken){
          setName(roomN);
          setGender(document.querySelector("input[name='gender']:checked").value);
          setPref(document.querySelector("input[name='pref']:checked").value);
          setJoinedRoom(true);
        }else{
          alert("Name already taken");
        }
      }
    }

    const showVideoConference = () => {
        setShow(true);
    }

    useEffect(() => {
        if(!isMounted.current){ 
          isMounted.current = true;
        }else{ 
          const socket = socketIOClient(ENDPOINT);
          let localStream;

          document.querySelector("div[id='next']").addEventListener("click", function(){
            if(localStream){
              setStreaming(false);
              setRemoting(false);
              localStream = undefined;
              setTimeout(() => {
                socket.emit("next");
              }, 3000)
            }
          });

          if(joinedRoom) {
            if(pos.coords != undefined){ 
              console.log(pos);
              socket.emit('join', {"username": name, "gender": gender, "pref": pref, "lat": pos.coords.latitude, "long": pos.coords.longitude});
            }else{
              socket.emit('join', {"username": name, "gender": gender, "pref": pref});
            }
            showVideoConference()
            console.log("joined")
          }

          async function setLocalStream(mediaConstraints) {
            let stream
            try {
              stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
            } catch (error) {
              console.error('Could not get user media', error)
            }
            
            setStreaming(stream)
            localStream = stream
            videoRef.current.srcObject = stream
          }

          function addLocalTracks(rtcPeerConnection) {
            localStream.getTracks().forEach((track) => {
              rtcPeerConnection.addTrack(track, localStream)
            })
          }
            
          async function createOffer(rtcPeerConnection) {
              let sessionDescription
              try {
                sessionDescription = await rtcPeerConnection.createOffer()
                rtcPeerConnection.setLocalDescription(sessionDescription)
              } catch (error) {
                console.error(error)
              }

              console.log("emmited offer");
            
              socket.emit('webrtc_offer', {
                type: 'webrtc_offer',
                sdp: sessionDescription,
                roomId,
              })
          }
            
          async function createAnswer(rtcPeerConnection) {
              let sessionDescription
              try {
                sessionDescription = await rtcPeerConnection.createAnswer()
                rtcPeerConnection.setLocalDescription(sessionDescription)
              } catch (error) {
                console.error(error)
              }
            
              console.log("emmited answer");

              socket.emit('webrtc_answer', {
                type: 'webrtc_answer',
                sdp: sessionDescription,
                roomId,
              })
          }
            
          function setRemoteStream(event) {
              setRemoting(event.streams[0])
              videoRRef.current.srcObject = event.streams[0]
              remoteStream = event.stream
          }
            
          function sendIceCandidate(event) {
              if (event.candidate) {
                socket.emit('webrtc_ice_candidate', {
                  roomId,
                  label: event.candidate.sdpMLineIndex,
                  candidate: event.candidate.candidate,
                })
              }
          }
      
          // SOCKET EVENT CALLBACKS =====================================================
          socket.on("connect", () => {
            console.log("Socket connected: " + socket.id);
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected: " + socket.id);
          });

          socket.on("peer_disconnected", () => {
            setStreaming(false);
            setRemoting(false);
            localStream = undefined;
            alert("Your mate disconnected. Looking for new people... (with the same options)");
            setTimeout(() => {
              socket.emit("next");
            }, 5000)
          });

          socket.on('room_joined', async (bool, room) => {
              await setLocalStream(mediaConstraints);
              isCaller = bool;
              roomId = room;

              console.log("room_joined --> " + isCaller);

              if(isCaller){
                socket.emit('caller_ready', room);
              }else{
                socket.emit('receiver_ready', room);
              }
          })
            
          socket.on('start_call', async (names) => {
            if(names[0] === name){
                setPeerName(names[1]);
            }else{
                setPeerName(names[0]);
            }
            
            console.log("received start_call");
              if (isCaller) {
                console.log("started call");

                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                await createOffer(rtcPeerConnection)
              }
          })
            
          socket.on('webrtc_offer', async (event) => {
              if (!isCaller) {
                console.log("received offer");

                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
                await createAnswer(rtcPeerConnection)
              }
          })
            
          socket.on('webrtc_answer', (event) => {
              console.log('received answer');
            
              rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
          })
            
          socket.on('webrtc_ice_candidate', (event) => {
              console.log('Socket event callback: webrtc_ice_candidate')
            
              // ICE candidate configuration.
              var candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate,
              })
              rtcPeerConnection.addIceCandidate(candidate)
          })
        }
    }, [joinedRoom]);


    let UserVideo;
    if(streaming){
      UserVideo = (
        <div>
          {name}
          <video ref={ videoRef } autoPlay muted></video>
        </div>
      );
    }

    let RemoteVideo = (
      <div>
        Waiting...
      </div>
    );
    if(remoting){
      RemoteVideo = (
        <div>
          {peerName}
          <video ref={ videoRRef } autoPlay></video>
        </div>  
      );
    }

    return (
        <div>
            <div style={{ display: show ? "none" : "block"}}>
                <label>Name</label>
                <input type="text" onChange={ handleChange }></input>

                <br/><br/>

                <h1>Gender</h1>
                <label>Male</label>
                <input type="radio" name="gender" value="male"/>
                <label>Female</label>
                <input type="radio" name="gender" value="female"/>

                <br/><br/>

                <h1>Preference</h1>
                <label>Male</label>
                <input type="radio" name="pref" value="male"/>
                <label>Female</label>
                <input type="radio" name="pref" value="female"/>
                
                <br/><br/>

                <label>Use distance</label>
                <input type="checkbox" name="geo" onClick={ handleCheckbox }/>

                <br/>

                <button onClick={ handleClick }>Connect</button>
            </div>
            <div style={{ display: show ? "block" : "none"}}>
              <div id="next" className="flex relative hover:cursor-pointer">
                <div className="fixed w-10 h-screen right-0">
                  <div className="flex w-10 h-screen bg-gray-100 justify-center items-center">
                    <i className="border-black border-solid border-t-0 border-r-2 border-b-2 border-l-0 p-1 transform -rotate-45 mr-1.5"></i>
                  </div>
                </div>
                <div className="relative">
                  {UserVideo}
                  {RemoteVideo}
                </div>
              </div>
            </div>
        </div>
    )
}
  
export default Video;