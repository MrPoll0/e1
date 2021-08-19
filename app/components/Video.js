import { useEffect, useRef, useContext } from "react";
import socketIOClient from "socket.io-client";
import Image from "next/image";
import { useRouter } from "next/router";
import en from "../locales/en";
import es from "../locales/es";
import fr from "../locales/fr";
import LanguageSelector from "./LanguageSelector";
import Form from "./Form";
import getAge from "./input/getAge";
import Header from "./Header";
import Footer from "./Footer";

import NameContext from "../contexts/input/name";
import GenderContext from "../contexts/input/gender";
import PrefContext from "../contexts/input/pref";
import DateContext from "../contexts/input/date";
import DescriptionContext from "../contexts/input/description";
import PosContext from "../contexts/input/pos";
import JoinedRoomContext from "../contexts/joinedRoom";
import StreamingContext from "../contexts/input/streaming";
import RemotingContext from "../contexts/input/remoting";

import LocalVidRefContext from "../contexts/video/localVidRef";
import RemoteVidRefContext from "../contexts/video/remoteVidRef";
import PeerNameContext from "../contexts/video/peerName";
import PeerAgeContext from "../contexts/video/peerAge";
import PeerDescContext from "../contexts/video/peerDesc";
import CamIStatusContext from "../contexts/video/camIStatus";
import MicIStatusContext from "../contexts/video/micIStatus";

import cancel from "../public/cancel.svg";
import next from "../public/next.svg";

const Video = () => {
    const router = useRouter();
    const { locale } = router;
    let t;
    switch(locale){
      case "en":
        t = en;
        break;
      case "es":
        t = es;
        break;
      case "fr":
        t = fr;
        break;
    }

    const ENDPOINT = "https://api.vibezz.live";

    const iceServers = {
        iceServers: [
          { url: 'stun:stun.l.google.com:19302'  },
          { url: 'stun:stun1.l.google.com:19302' },
          { url: 'stun:stun2.l.google.com:19302' },
          { url: 'stun:stun3.l.google.com:19302' },
          { url: 'stun:stun4.l.google.com:19302' },
          { url: 'stun:turn.vibezz.live' },
          {
            url: 'turn:turn.vibezz.live',
            credential: 'qwertyuiopasdfghjklñzxcvbnm121;!',
            username: 'admin',
          },
        ],
    }

    let isCaller;
    let rtcPeerConnection; // Connection between the local device and the remote peer.
    let roomId;

    const mediaConstraints = {
        audio: true,
        video: true,
    }
    const isMounted = useRef(false);

    const [name, handleName] = useContext(NameContext);
    const [gender, handleGender] = useContext(GenderContext);
    const [pref, handlePref] = useContext(PrefContext);
    const [date, handleDate] = useContext(DateContext);
    const [description, handleDescription] = useContext(DescriptionContext);
    const [pos, handlePos] = useContext(PosContext);
    const [joinedRoom, handleJoinedRoom] = useContext(JoinedRoomContext);
    const [streaming, handleStreaming] = useContext(StreamingContext);
    const [remoting, handleRemoting] = useContext(RemotingContext);

    const localVidRef = useContext(LocalVidRefContext);
    const remoteVidRef = useContext(RemoteVidRefContext);
    const [peerName, handlePeerName] = useContext(PeerNameContext);
    const [peerAge, handlePeerAge] = useContext(PeerAgeContext);
    const [peerDesc, handlePeerDesc] = useContext(PeerDescContext);
    const [camIStatus, handleCamIStatus] = useContext(CamIStatusContext);
    const [micIStatus, handleMicIStatus] = useContext(MicIStatusContext);

    function showDescription(){
      let desc = document.querySelector("#desc");
      desc.className = (desc.className.search("hidden") !== -1) ? desc.className.replace("hidden", "") : (desc.className + " hidden"); 
    }

    useEffect(() => {
        if(!isMounted.current){ 
          isMounted.current = true;
        }else{ 
          const socket = socketIOClient(ENDPOINT);
          let localStream;
          let remoteStream;
          let micMuted = false;
          let camMuted = false;

          document.querySelector("div[id='next']").addEventListener("click", function(){
            if(localStream){
              handleStreaming(false);
              handleRemoting(false);
              localStream = undefined;
              remoteStream = undefined;
              socket.emit("next");
            }
          });

          document.querySelector("div[id='mute-1']").addEventListener("click", async function(){
            if(localStream){ 
              const muteMic = (await import("./video/muteMic")).default;

              muteMic(localStream, handleMicIStatus);
              micMuted = !micMuted;
            }
          });

          document.querySelector("div[id='mute-0']").addEventListener("click", async function(){
            if(localStream){ 
              const muteCam = (await import("./video/muteCam")).default;

              muteCam(localStream, handleCamIStatus);
              camMuted = !camMuted;
            }
          });

          if(joinedRoom) {
            if(pos.coords != undefined){ 
              socket.emit('join', {"name": name, "gender": gender, "pref": pref, "age": getAge(date), "desc": description, "using": true,"lat": pos.coords.latitude, "long": pos.coords.longitude});
            }else{
              socket.emit('join', {"name": name, "gender": gender, "pref": pref, "age": getAge(date), "desc": description, "using": false});
            }
            console.log("joined")
          }

          async function setLocalStream(mediaConstraints) {
            let stream
            try {
              stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
            } catch (error) {
              console.error('Could not get user media', error)
            }
            
            handleStreaming(stream)
            localStream = stream
            localVidRef.current.srcObject = stream

            const configureTalking = (await import ("./video/configureTalking")).default;
            configureTalking(localStream, "local", micMuted, camMuted, handleMicIStatus, handleCamIStatus);
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
            
          async function setRemoteStream(event) {
              handleRemoting(event.streams[0]);
              remoteVidRef.current.srcObject = event.streams[0];
              remoteStream = event.streams[0];

              const configureTalking = (await import ("./video/configureTalking")).default;
              configureTalking(remoteStream, "remote");
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
            handleStreaming(false);
            handleRemoting(false);
            localStream = undefined;
            remoteStream = undefined;
            alert("Your mate disconnected. Looking for new people... (with the same options)");
            setTimeout(() => {
              socket.emit("next");
            }, 3000)
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
            
          socket.on('start_call', async (info) => {
            if(info["0"].name === name){
              handlePeerName(info["1"].name);
              handlePeerAge(info["1"].age);
              handlePeerDesc(info["1"].desc);
            }else{
              handlePeerName(info["0"].name);
              handlePeerAge(info["0"].age);
              handlePeerDesc(info["0"].desc);
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

    let UserVideo = (
      <div></div>
    ); // {name}
    if(streaming){
      UserVideo = (
        <div>
          <video name="local" className="h-1/4 rounded-xl shadow-md absolute z-50" ref={ localVidRef } autoPlay muted></video>
        </div>
      );
    }

    useEffect(() => {
      if(streaming){ 
        var isMobile = false;

        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            isMobile = true;
        }
        var mousePosition;
        var offset = [0,0];
        var isDown = false;
        var local = document.querySelector("video[name='local']")
        if(!isMobile){ 
          local.addEventListener('mousedown', function(e) {
            isDown = true;
            offset = [
              local.offsetLeft - e.clientX,
              local.offsetTop - e.clientY
            ];
          }, true);

          document.addEventListener('mouseup', function() {
              isDown = false;
          }, true);
          
          document.addEventListener('mousemove', function(event) {
              event.preventDefault();
              if (isDown) {
                mousePosition = {
                    x : event.clientX,
                    y : event.clientY
                  };
                local.style.left = (mousePosition.x + offset[0]) + 'px';
                local.style.top  = (mousePosition.y + offset[1]) + 'px';
              }
          }, true);
        }else{          
          local.addEventListener('touchmove', function(event) {
            event.preventDefault();
            var touchLocation = event.targetTouches[0];
            
            local.style.left = (touchLocation.pageX-(local.clientWidth)/2) + 'px';
            local.style.top = (touchLocation.pageY-(local.clientHeight)/2) + 'px';
          });

          local.addEventListener('touchend', function(e) {
            var x = parseInt(local.style.left);
            var y = parseInt(local.style.top);
          });
        }
      }
    }, [streaming]);

    let RemoteVideo = (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5/6">
        <div className="flex items-center justify-center">
          <h1 className="text-5xl font-semibold tracking-tighter text-gray-smooth">
            {t.waiting}
          </h1>
        </div>
      </div>
    );
    if(remoting){
      RemoteVideo = (
        <div className="flex w-screen h-screen">
          <div id="rCont">
            <video name="remote" ref={ remoteVidRef } autoPlay></video>

            <div id="infoCont" className="flex flex-col opacity-0 transition-opacity">
              <div className="absolute z-30 top-2 left-1/2 transform -translate-x-1/2 bg-gray-700 p-2 px-3 rounded-full shadow-lg max-w-screen-mobile whitespace-nowrap">
                <div className="font-semibold text-white inline-flex">
                  {peerName}, {peerAge}
                  <button type="button" onClick={ showDescription } className="font-semibold text-gray-200 text-xl transform -rotate-90 px-2">‹</button>
                </div>
              </div>
              <div id="desc" className="absolute z-30 hidden top-12 left-1/2 transform -translate-x-1/2 bg-gray-700 p-2 px-3 rounded-xl shadow-lg w-mobileW">
                <div className="font-light text-white whitespace-pre-wrap break-words">
                  <p>{peerDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>  
      );
    }

    useEffect(() => {
      if(remoting){
        let remoteContainer = document.querySelector("#rCont");
        var infoCont = document.querySelector("#infoCont");
        var remoteVid = document.querySelector("video[name='remote']");
        var landscapeStyle = "absolute z-20 h-screen left-1/2 transform -translate-x-1/2";
        var portraitStyle = "absolute z-20 w-screen top-1/2 transform -translate-y-1/2";

        function vidAdjust(resized){ // ADD EASE-IN-OUT TRANSITION FOR INFOCONT
          if(resized){
            if((window.outerWidth/window.outerHeight) >= (1920/1080)){
              remoteContainer.removeAttribute("style");
              remoteVid.className = landscapeStyle;
            }else{
              remoteVid.className = portraitStyle;
            }
          }else{ 
            if((screen.width/screen.height) >= (1920/1080)){
              remoteContainer.removeAttribute("style");
              remoteVid.className = landscapeStyle;
            }else{
              remoteVid.className = portraitStyle;
            }
          } 
        }

        function showInfo(entering, e){
          infoCont.className = (entering) ? infoCont.className.replace("opacity-0", "opacity-100") : infoCont.className.replace("opacity-100", "opacity-0");
        }

        const resizeObserver = new ResizeObserver(entries => {
          let width = entries[0].contentRect.width;
          let height = entries[0].contentRect.height;
          
          remoteContainer.setAttribute("style", `width: ${width}px; height: ${height}px; margin: auto; position: relative;`);
        });
        
        remoteContainer.addEventListener("mouseenter", showInfo.bind(this, true));
        remoteContainer.addEventListener("mouseleave", showInfo.bind(this, false));
        resizeObserver.observe(remoteVid);
        screen.orientation.addEventListener("change", vidAdjust(false), true);  
        window.onresize = () => vidAdjust(true);
        return () => {
          remoteContainer.removeEventListener("mouseenter", showInfo);
          remoteContainer.removeEventListener("mouseleave", showInfo);
          resizeObserver.unobserve(remoteVid);
          screen.orientation.removeEventListener("change", vidAdjust(false), true);
          window.onresize = undefined;
        }
      }
    }, [RemoteVideo]);
 // <LanguageSelector/>
    return (
      <main>
        {!joinedRoom && <div>
          <Header/>
          <Form/>
          <Footer/>
        </div>
        }
    
        {joinedRoom && <div className="flex flex-col">
          {UserVideo}
          {RemoteVideo}
          <div className="w-screen fixed bottom-0 flex mb-3 z-40"> 
            <div className="m-auto flex space-x-2">
              <div id="cancel" className="w-20 h-20 rounded-full m-auto shadow-xl bg-red-400 hover:cursor-pointer">
                <i className="w-12 h-12 bg-auto block absolute ml-4 mt-4">
                  <Image src={cancel} alt="Cancel" layout="fill" objectFit="cover"></Image>
                </i>
              </div>
              <div id="mute-0" className="w-20 h-20 bg-gray-400 rounded-full m-auto shadow-xl hover:cursor-pointer">
                <i className="w-14 h-14 bg-auto block absolute ml-3 mt-3">
                  <Image src={camIStatus} alt="Cancel" layout="fill" objectFit="cover"></Image>
                </i>
              </div>
              <div id="mute-1" className="w-20 h-20 bg-gray-400 rounded-full m-auto shadow-xl hover:cursor-pointer">
                <i className="w-14 h-14 bg-auto block absolute ml-3 mt-3">
                  <Image src={micIStatus} alt="Cancel" layout="fill" objectFit="cover"></Image>
                </i>
              </div>
              <div id="next" className="w-20 h-20 rounded-full m-auto shadow-xl bg-green-400 hover:cursor-pointer">
                <i className="w-14 h-14 bg-auto block absolute ml-3 mt-3">
                <Image src={next} alt="Cancel" layout="fill" objectFit="cover"></Image>
                </i>
              </div>
            </div>
          </div>
        </div>
        }
      </main>
    )
} 
  
export default Video;

/*
  

 creditos: 
<div>Icons made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
<div>Icons made by <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
<div>Icons made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>


*/