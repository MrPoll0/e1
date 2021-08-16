import { useEffect, useRef, useContext } from "react";
import socketIOClient from "socket.io-client";
import { version } from "../package.json"
import Image from "next/image";

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

import Logotype from "../public/logotype.png";
import cancel from "../public/cancel.svg";
import next from "../public/next.svg";



// temp
import setButtonStyle from "./input/setButtonStyle.js";

const Video = () => {
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

    function getAge(date){
      let today = new Date();
      let bDate = new Date(date);
      let age = today.getFullYear() - bDate.getFullYear();
      let m = today.getMonth() - bDate.getMonth();

      if(m < 0 || (m === 0 && today.getDate() < bDate.getDate())){
        age--;
      }

      return age;
    }

    async function handleClick(){
      const nameTaken = (await import("./input/nameTaken")).default;
      let taken
      let cAge = getAge(date);
      try{
        taken = await nameTaken(name);
      }catch(err){
        console.log(err);
      }
      if(!taken && cAge >= 18 && cAge <= 120){
        handleJoinedRoom(true);
      }else if(taken){
        setStep(6, 1);
        alert("Name already taken");
      }else if(cAge < 18 && cAge > 0){
        setStep(6, 3);
        alert("You must be over 18 years old.");
      }else if(cAge > 120 || cAge < 0){
        setStep(6, 3);
        alert("Please, enter a valid birth date.");
      }
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

    function checkInput(step){
      switch(step){
        case 1:
          if(name != "" && name.length < 29){
            return true;
          }
          return false;
        case 2:
          if(gender != undefined){
            return true;
          }
          return false;
        case 3:
          let cAge = getAge(date);
          if(date != "" && cAge >= 18 && cAge > 0 && cAge <= 120){
            return true;
          }
          return false;
        case 4:
          if(pref != undefined){
            return true;
          }
          return false;
        case 5:
          if(description != "" && description.length < 306 && description.split(/\r\n|\r|\n/).length <= 5){
            return true;
          }
          return false;
        case 6:
      }
    }

    function goStep(step){
      var container = document.querySelector("#container");
      while(container.firstChild){
        container.removeChild(container.firstChild);
      }

      const defaultContainer = "flex flex-col";
      switch(step){
        case 1:
          document.querySelector("#p"+step).innerHTML = "My name is";
          container.className = defaultContainer;

          var next = document.querySelector("#n"+step);
          next.className = next.className.replace("hidden", "");
          next.disabled = false;
          if(document.querySelector("#connect")){
            document.querySelector("#connect").remove();
          }

          var input = document.createElement("input");
          input.type ="text";
          input.placeholder ="Name";
          input.ariaLabel = "Name";
          input.onchange = function() { handleName(input.value); };
          input.className = "focus:border-purple-500 focus:ring-0 mt-10 mx-6 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400 text-2xl";
          input.type="text";
          input.name = "name";
          input.value = name;

          container.append(input);
          break;
        case 2:
          document.querySelector("#p"+step).innerHTML = "I'm a";
          container.className = container.className + " space-y-3 mt-10";
          

          var buttonM = document.createElement("button");
          buttonM.className = "text-lg w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-purple-500 focus:text-purple-500 hover:font-semibold";
          buttonM.ariaLabel = "gender";
          buttonM.innerHTML = "Male";
          buttonM.id = "gmale";
          buttonM.onclick = function() { handleGender("male"); }

          var buttonF = document.createElement("button");
          buttonF.className = buttonM.className;
          buttonF.ariaLabel = "gender";
          buttonF.innerHTML = "Female";
          buttonF.id = "gfemale";
          buttonF.onclick = function() { handleGender("female"); }

          var buttonO = document.createElement("button");
          buttonO.className = buttonM.className;
          buttonO.ariaLabel = "gender";
          buttonO.innerHTML = "Other";
          buttonO.id = "gother";
          buttonO.onclick = function() { handleGender("other"); }

          container.append(buttonM);
          container.append(buttonF);
          container.append(buttonO);
          setButtonStyle("g", gender);
          break;
        case 3:
          document.querySelector("#p"+step).innerHTML = "My birth date is";
          container.className = defaultContainer;
          
          var next = document.querySelector("#n"+step);
          next.className = next.className.replace("hidden", "");
          next.disabled = false;
          if(document.querySelector("#connect")){
            document.querySelector("#connect").remove();
          }

          var input = document.createElement("input");
          input.type = "date";
          input.ariaLabel = "age";
          input.className = "mt-10 rounded-md text-2xl";
          input.onchange = function() { handleDate(input.value); }
          input.value = date;

          container.append(input);
          break;
        case 4:
          document.querySelector("#p"+step).innerHTML = "I'm sexually attracted to";
          container.className = container.className + " space-y-3 mt-10";

          var buttonM = document.createElement("button");
          buttonM.className = "sm:text-lg text-base w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-purple-500 focus:text-purple-500 hover:font-semibold";
          buttonM.ariaLabel = "sexuality";
          buttonM.innerHTML = "Men";
          buttonM.id = "pmale";
          buttonM.onclick = function() { handlePref("male"); }

          var buttonF = document.createElement("button");
          buttonF.className = buttonM.className;
          buttonF.ariaLabel = "sexuality";
          buttonF.innerHTML = "Women";
          buttonF.id = "pfemale";
          buttonF.onclick = function() { handlePref("female"); }

          var buttonB = document.createElement("button");
          buttonB.className = buttonM.className;
          buttonB.ariaLabel = "sexuality";
          buttonB.innerHTML = "Both";
          buttonB.id = "pboth";
          buttonB.onclick = function() { handlePref("both"); }

          var buttonO = document.createElement("button");
          buttonO.className = buttonM.className;
          buttonO.ariaLabel = "sexuality";
          buttonO.innerHTML = "Other";
          buttonO.id = "pother";
          buttonO.onclick = function() { handlePref("other"); }

          container.append(buttonM);
          container.append(buttonF);
          container.append(buttonB);
          container.append(buttonO);
          setButtonStyle("p", pref);
          break;
        case 5:
          document.querySelector("#p"+step).innerHTML = "I'm interested in";
          container.className = defaultContainer;

          var next = document.querySelector("#n"+step);
          next.className = next.className.replace("hidden", "");
          next.disabled = false;
          if(document.querySelector("#connect")){
            document.querySelector("#connect").remove();
          }

          var textarea = document.createElement("textarea");
          textarea.className = "focus:ring-0 resize-none rounded-xl mt-10 text-lg";
          textarea.ariaLabel = "description";
          textarea.placeholder = "I like...";
          textarea.rows = "5";
          textarea.onchange = function() { handleDescription(textarea.value); }
          textarea.value = description;

          container.append(textarea);
          break;
        case 6:
          document.querySelector("#p"+step).innerHTML = "Do you wanna look for people near you?";
          container.className = "inline-flex space-x-10 mt-10 m-auto";

          var next = document.querySelector("#n"+step);
          var nParent = next.parentElement;
          next.className = next.className + " hidden";
          next.disabled = true;

          var connect = document.createElement("button");
          connect.id = "connect";
          connect.innerHTML = "CONNECT";
          connect.onclick = function() { handleClick(); }
          connect.className = "shadow-md max-w-xs h-16 bg-gradient-to-r text-white font-semibold from-blue-200 via-purple-400 to-purple-900 rounded-xl mt-12 m-auto px-24 z-10 text-2xl tracking-tighter";

          var no = document.createElement("button");
          no.innerHTML = "NO";
          no.id = "no";
          no.ariaLabel = "location";
          no.className = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-red-400 hover:text-red-400 focus:border-red-500 focus:text-red-500";
          no.onclick = async () => { 
            const distanceSelect = (await import("./input/distanceSelect")).default;
            distanceSelect("no", handlePos); 
          }

          var yes = document.createElement("button");
          yes.innerHTML = "YES";
          yes.id = "yes";
          yes.ariaLabel = "location";
          yes.className = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-green-400 hover:text-green-400 focus:border-green-500 focus:text-green-500";
          yes.onclick = async () => { 
            const distanceSelect = (await import("./input/distanceSelect")).default;
            distanceSelect("yes", handlePos); 
          }

          container.append(no);
          container.append(yes);
          nParent.append(connect);
          break;
      }
    }
  
    function setStep(currentStep, step){
      document.querySelector("#tab"+currentStep).id = "tab"+step;
      document.querySelector("#p"+currentStep).id = "p"+step;
      var progress = document.querySelector("#progress");
      progress.className = progress.className.replace("w-"+currentStep+"/6", "w-"+step+"/6");
      var next = document.querySelector("#n"+currentStep);
      next.id = "n"+step;
      var back = document.querySelector("#b"+currentStep);
      back.id = "b"+step;
      back.className = "font-semibold text-gray-500 text-6xl disabled:opacity-50";
      if(step != 1){ 
        back.disabled = false;
        back.onclick = function() { { step }; }
      }else{
        back.disabled = true;
      }

      goStep(step);
    }

    async function step(e){  
      var direction = e.target.id.charAt(0);
      var currentStep = Number(e.target.id.charAt(1));
      var nextStep = currentStep+1;
      var lastStep = currentStep-1;
      
      if(direction == "n" && checkInput(currentStep)){
        setStep(currentStep, nextStep);
      }else if(direction == "b" && lastStep > 0){
        setStep(currentStep, lastStep);
      }
    }

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
            Waiting for the love of your life..
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

    return (
      <main>
        <div style={{ display: joinedRoom ? "none" : "block"}}>
          <header className="flex w-full border-b">
              <div className="m-auto -mb-4">
                <Image src={Logotype} alt="Logotype" width="409" height="109" quality="100"></Image>
              </div>
          </header>

          <div id="progress" className="w-1/6 bg-gradient-to-r from-blue-200 via-purple-400 to-purple-900 h-2"></div>
    
          <div id="tab1" className="flex flex-col mx-7">
            <div className="w-full h-10">
              <button id="b1" type="button" onClick={ step } className="font-semibold text-gray-500 text-6xl opacity-50 disabled:opacity-50">‹</button>
            </div>
            <h3 id="p1" className="font-semibold mt-10 text-5xl text-gray-smooth tracking-tighter">My name is</h3>
            <div id="container" className="flex flex-col">
              <input type="text" name="name" placeholder="Name" aria-label="Name" onChange={ handleName } className="focus:border-purple-500 focus:ring-0 mt-10 mx-6 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400 text-2xl"/>
            </div>
            <button id="n1" name="continue" type="button" onClick={ step } className="shadow-md max-w-xs h-14 bg-gradient-to-r text-white font-semibold from-blue-200 via-purple-400 to-purple-900 rounded-xl sm:mt-12 mt-6 m-auto px-28 z-10 text-xl tracking-tighter">CONTINUE</button>
          </div>

          <footer className="absolute bottom-0 w-screen text-center text-gray-500 text-xs mb-1 z-0">
              <p>&copy; MrPoll0 2021</p>
              <p>Version: {version}</p>
          </footer>
        </div>
    
        <div style={{ display: joinedRoom ? "block" : "none"}} className="flex flex-col">
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