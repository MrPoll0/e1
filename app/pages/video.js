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
let isRoomCreator
let rtcPeerConnection // Connection between the local device and the remote peer.
let roomId

const mediaConstraints = {
    audio: true,
    video: { width: 1280, height: 720 },
}

const Video = () => {
    const [roomN, setRoomN] = useState("");
    const [show, setShow] = useState("");
    const [joinedRoom, setJoinedRoom] = useState("");
    const [joinedRoomN, setJoinedRoomN] = useState("");
    const [streaming, setStreaming] = useState();
    const [remoting, setRemoting] = useState();
    //const localStreamR = useRef(null);
    const videoRef = useRef(null);
    const videoRRef = useRef(null);

    const isMounted = useRef(false);

    const handleChange = (e) => {
        setRoomN(e.target.value);
    }

    const handleClick = (e) => {
        setJoinedRoomN(roomN);
        setJoinedRoom(true);
    }

    const showVideoConference = () => {
        setShow(true);
    }

    /*const addLocalTracks = (rtcPeerConnection) => {
      localStreamR.current.getTracks().forEach((track) => {
        rtcPeerConnection.addTrack(track, localStreamR.current)
      })
    }*/

    useEffect(() => {
        if(!isMounted.current){ 
          isMounted.current = true;
        }else{ 
          const socket = socketIOClient(ENDPOINT);
          let localStream;
          socket.on("connect", () => {
            console.log("Socket conectado: " + socket.id);
          });

          socket.on("disconnect", () => {
            console.log("Socket disconectado: " + socket.id);
          });

          console.log('useeffect')
          if(joinedRoom) {
              if (joinedRoomN === '') {
                alert('Please type a room ID')
              } else {
                roomId = joinedRoomN
                socket.emit('join', joinedRoomN)
                showVideoConference()
              }
          }
            
          /*async function setLocalStream(mediaConstraints) {
              navigator.mediaDevices.getUserMedia(mediaConstraints).then(stream => {
                setStreaming(stream)
                //localStreamR.current = stream;
                localStream = stream;
                videoRef.current.srcObject = stream
              }).catch((error) => {
                console.error('Could not get user media', error)
              })
          }*/

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
            
              socket.emit('webrtc_answer', {
                type: 'webrtc_answer',
                sdp: sessionDescription,
                roomId,
              })
          }
            
          function setRemoteStream(event) {
              //remoteVideoComponent.srcObject = event.streams[0]
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
          socket.on('room_created', async () => {
              console.log('Socket event callback: room_created')
            
              await setLocalStream(mediaConstraints)
              isRoomCreator = true
          })
            
          socket.on('room_joined', async () => {
              console.log('Socket event callback: room_joined')
            
              await setLocalStream(mediaConstraints)
              socket.emit('start_call', roomId)
          })
            
          socket.on('full_room', () => {
              console.log('Socket event callback: full_room')
            
              alert('The room is full, please try another one')
          })
            
          socket.on('start_call', async () => {
              console.log('Socket event callback: start_call')
            
              if (isRoomCreator) {
                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                await createOffer(rtcPeerConnection)
              }
          })
            
          socket.on('webrtc_offer', async (event) => {
              console.log('Socket event callback: webrtc_offer')
            
              if (!isRoomCreator) {
                rtcPeerConnection = new RTCPeerConnection(iceServers)
                addLocalTracks(rtcPeerConnection)
                rtcPeerConnection.ontrack = setRemoteStream
                rtcPeerConnection.onicecandidate = sendIceCandidate
                rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
                await createAnswer(rtcPeerConnection)
              }
          })
            
          socket.on('webrtc_answer', (event) => {
              console.log('Socket event callback: webrtc_answer')
            
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
    }, [joinedRoom, joinedRoomN])


    let UserVideo;
    if(streaming){
      UserVideo = (
        <video ref={ videoRef } autoPlay muted></video>
      );
    }

    let RemoteVideo;
    if(remoting){
      RemoteVideo = (
        <video ref={ videoRRef} autoPlay></video>
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