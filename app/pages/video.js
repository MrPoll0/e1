import { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "https://api.mrpoll0.cf";

const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302'  },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      {
        url: 'turn:turn.mrpoll0.cf',
        credential: 'qwertyuiopasdfghjklñzxcvbnm121;!',
        username: 'admin',
      },
    ],
}

let remoteStream
let isCaller
let rtcPeerConnection // Connection between the local device and the remote peer.
let roomId
let peerName

const mediaConstraints = {
    audio: true,
    video: { width: 1280, height: 720 },
}

const Video = () => {
    const [roomN, setRoomN] = useState("");
    const [show, setShow] = useState("");
    const [joinedRoom, setJoinedRoom] = useState("");
    const [Name, setName] = useState("");
    const [streaming, setStreaming] = useState();
    const [remoting, setRemoting] = useState();
    const videoRef = useRef(null);
    const videoRRef = useRef(null);

    const isMounted = useRef(false);

    const handleChange = (e) => {
        setRoomN(e.target.value);
    }

    const handleClick = (e) => {
        setName(roomN);
        setJoinedRoom(true);
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

          console.log('useeffect')
          if(joinedRoom) {
              if (Name === '') {
                alert('Please type a nickname')
              } else {
                socket.emit('join', {"username": Name})
                showVideoConference()
                console.log("joined")
              }
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
            if(names[0] === Name){
              peerName = names[1];
            }else{
              peerName = names[0];
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
    }, [joinedRoom, Name])


    let UserVideo;
    if(streaming){
      UserVideo = (
        <div>
          {Name}
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
                <input type="text" onChange={ handleChange }></input>
                <button onClick={ handleClick }>Connect</button>
            </div>
            <div style={{ display: show ? "block" : "none"}}>
                {UserVideo}
                {RemoteVideo}
            </div>
        </div>
    )
}
  
export default Video