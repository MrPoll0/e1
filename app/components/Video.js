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
        <> 
            <div style={{ display: show ? "none" : "block"}} className="flex flex-col bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl m-5 mt-24 overflow-hidden">
              <div className="mb-5 flex items-center rounded-xl py-2 m-4 text-white shadow-inner border "> 
                <input className="font-semibold appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:ring-0" type="text" placeholder="Your name" aria-label="Full name" onChange={ handleChange }/>
              </div>

              <div className="main flex border rounded-full overflow-hidden m-5 my-1 select-none">
                <div className="title py-3 my-auto px-5 bg-red-500 text-white text-sm font-semibold mr-3">Gender</div>
                <div className="inline-flex space-x-3">
                  <label className="inline-flex items-center">
                    <input className="form-radio text-red-500 focus:ring-0" type="radio" name="gender" value="male"/>
                    <span className="ml-2 text-gray-600">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input className="form-radio text-red-500 focus:ring-0" type="radio" name="gender" value="female"/>
                    <span className="ml-2 text-gray-600">Female</span>
                  </label>
                </div>
              </div>

              <div className="flex border rounded-full overflow-hidden m-4 my-3 select-none">
                <div className="title py-3 my-auto px-5 bg-red-500 text-white text-sm font-semibold mr-3">Preferences</div>
                <div className="inline-flex space-x-3">
                  <label className="inline-flex items-center">
                    <input className="form-radio text-red-500 focus:ring-0" type="radio" name="pref" value="male"/>
                    <span className="ml-2 text-gray-600">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input className="form-radio text-red-500 focus:ring-0" type="radio" name="pref" value="female"/>
                    <span className="ml-2 text-gray-600">Female</span>
                  </label>
                </div>
              </div>

              <div className="mb-5 flex items-center rounded-xl py-2 m-4 text-white shadow-inner border "> 
                <textarea className="font-semibold appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:ring-0 resize-none" placeholder="Description of yourself..." rows="3" aria-label="Description"></textarea>
              </div>

              <div className="flex flex-col"> 
                <label className="inline-flex items-center ml-4 my-3">
                  <input name="geo" onClick={ handleCheckbox } type="checkbox" className="form-checkbox h-5 w-5 text-red-600 focus:ring-0"/>
                  <span className="ml-2 text-gray-700">Use distance</span>
                </label>

                <button onClick={ handleClick } className="w-auto mt-2 rounded px-3 py-2 m-1 border-b-4 border-l-2 shadow-lg bg-red-700 border-red-800 text-white">
                  Connect
                </button>
              </div>
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
        </>
    )
}
  
export default Video;