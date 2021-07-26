import next from "next";
import { useEffect, useState, useRef } from "react";
import socketIOClient from "socket.io-client";
import socket from "socket.io-client/lib/socket";
import { minHeight, width } from "tailwindcss/defaultTheme";

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
        video: { 
          facingMode: "application",
          //aspectRatio: 16/9,
        },
    }
    const [pName, setpName] = useState("");
    const [show, setShow] = useState("");
    const [joinedRoom, setJoinedRoom] = useState("");
    const [name, setName] = useState("");
    const [streaming, setStreaming] = useState();
    const [remoting, setRemoting] = useState();
    const [gender, setGender] = useState();
    const [pref, setPref] = useState();
    const [pos, setPos] = useState([]);
    const [peerName, setPeerName] = useState();
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const videoRef = useRef(null);
    const videoRRef = useRef(null);

    const isMounted = useRef(false);

    function handleName(e) {
      if(e.target != undefined){
        setpName(e.target.value);
      }else{
        setpName(e);
      }
    }

    function handleDate(e){
      setDate(e);
    }

    function handleDescription(e){
      setDescription(e);
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
    
    function distanceSelect(e){
      if(e === "yes"){
        if(window.navigator.geolocation){
          window.navigator.geolocation.getCurrentPosition(setPos);
          setButtonStyle("d", "yes");
        }else{
          alert("Distance not available");
        }
      }else if(e === "no"){
        setPos([]);
        setButtonStyle("d", "no");
      }
    }

    function setButtonStyle(t, s){
      if(t == "p" || t == "g"){ 
        var defaultStyle = "w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500";
        var selectedStyle = "w-full text-center border-2  rounded-3xl p-3 border-red-500 text-red-500";

        if(s == "male"){
          document.querySelector("#"+t+"male").className = selectedStyle;
          document.querySelector("#"+t+"female").className = defaultStyle;
          document.querySelector("#"+t+"both").className = defaultStyle;
        }else if(s == "female"){
          document.querySelector("#"+t+"female").className = selectedStyle;
          document.querySelector("#"+t+"male").className = defaultStyle;
          document.querySelector("#"+t+"both").className = defaultStyle;
        }else if(s == "both"){
          document.querySelector("#"+t+"both").className = selectedStyle;
          document.querySelector("#"+t+"male").className = defaultStyle;
          document.querySelector("#"+t+"female").className = defaultStyle;
        }
      }else{
        var defaultStyleY = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-green-400 hover:text-green-400 focus:border-green-500 focus:text-green-500";
        var selectedStyleY = "text-4xl border-2 rounded p-2 border-green-500 text-green-500";
        var defaultStyleN = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-red-400 hover:text-red-400 focus:border-red-500 focus:text-red-500";
        var selectedStyleN = "text-4xl border-2 rounded p-2 border-red-500 text-red-500";

        document.querySelector("#"+s).className = (s == "yes" ? selectedStyleY : selectedStyleN);
        document.querySelector("#"+(s == "yes" ? "no" : "yes")).className = (s == "yes" ? defaultStyleY : defaultStyleN);
      }
    }

    function genderSelect(e){
      setGender(e);
      setButtonStyle("g", e);
    }

    function prefSelect(e){
      setPref(e);
      setButtonStyle("p", e);
    }

    async function handleClick(){
      let taken
      try{
        taken = await nameTaken(pName);
      }catch(err){
        console.log(err);
      }
      if(!taken){
        setName(pName);
        setJoinedRoom(true);
      }else{
        alert("Name already taken");
      }
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
            setShow(true);
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


    let UserVideo = (
      <div className="text-center absolute top-1/2">
        Connecting...
      </div>
    ); // {name}            BLUR FOR 18+ ??
    if(streaming){
      UserVideo = (
        <div>
          <video width="400" height="300" ref={ videoRef } autoPlay muted></video>
        </div>
      );
    }

    let RemoteVideo = (
      <div className="text-center absolute top-1/2">
        Waiting for the love of your live...
      </div>
    );
    if(remoting){  // {peerName}
      RemoteVideo = (
        <div>
          <video width="400" height="300" ref={ videoRRef } autoPlay></video>
        </div>  
      );
    }

    function checkInput(step){
      switch(step){
        case 1:
          return true;
        case 2:
          if(gender != undefined){
            return true;
          }
          return false;
        case 3:
          if(date != ""){
            return true;
          }
          return false;
        case 4:
          if(pref != undefined){
            return true;
          }
          return false;
        case 5:
          if(description != ""){
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

          var input = document.createElement("input");
          input.type ="text";
          input.placeholder ="Name";
          input.ariaLabel = "Name";
          input.onchange = function() { handleName(input.value); };
          input.className = "focus:border-gray-600 focus:ring-0 mt-4 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400";
          input.type="text";
          input.name = "name";
          input.value = pName;

          container.append(input);
          break;
        case 2:
          document.querySelector("#p"+step).innerHTML = "I have";
          container.className = container.className + " space-y-3 mt-10";
          

          var buttonM = document.createElement("button");
          buttonM.className = "w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500";
          buttonM.ariaLabel = "gender";
          buttonM.innerHTML = "Dick";
          buttonM.id = "gmale";
          buttonM.onclick = function() { genderSelect("male"); }

          var buttonF = document.createElement("button");
          buttonF.className = buttonM.className;
          buttonF.ariaLabel = "gender";
          buttonF.innerHTML = "Vagina";
          buttonF.id = "gfemale";
          buttonF.onclick = function() { genderSelect("female"); }

          var buttonB = document.createElement("button");
          buttonB.className = buttonM.className;
          buttonB.ariaLabel = "gender";
          buttonB.innerHTML = "Both";
          buttonB.id = "gboth";
          buttonB.onclick = function() { genderSelect("both"); }

          container.append(buttonM);
          container.append(buttonF);
          container.append(buttonB);
          setButtonStyle("g", gender);
          break;
        case 3:
          document.querySelector("#p"+step).innerHTML = "My birth date is";
          container.className = defaultContainer;

          var input = document.createElement("input");
          input.type = "date";
          input.ariaLabel = "age";
          input.className = "mt-10 rounded-md";
          input.onchange = function() { handleDate(input.value); }
          input.value = date;

          container.append(input);
          break;
        case 4:
          document.querySelector("#p"+step).innerHTML = "I'm sexually attracted to";
          container.className = container.className + " space-y-3 mt-10";

          var buttonM = document.createElement("button");
          buttonM.className = "w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500";
          buttonM.ariaLabel = "sexuality";
          buttonM.innerHTML = "Dicks";
          buttonM.id = "pmale";
          buttonM.onclick = function() { prefSelect("male"); }

          var buttonF = document.createElement("button");
          buttonF.className = buttonM.className;
          buttonF.ariaLabel = "sexuality";
          buttonF.innerHTML = "Vaginas";
          buttonF.id = "pfemale";
          buttonF.onclick = function() { prefSelect("female"); }

          var buttonB = document.createElement("button");
          buttonB.className = buttonM.className;
          buttonB.ariaLabel = "sexuality";
          buttonB.innerHTML = "Both";
          buttonB.id = "pboth";
          buttonB.onclick = function() { prefSelect("both"); }

          container.append(buttonM);
          container.append(buttonF);
          container.append(buttonB);
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
          textarea.className = "focus:ring-0 resize-none rounded-xl mt-10";
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
          connect.className = "shadow-md max-w-xs w-screen h-14 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28"

          var no = document.createElement("button");
          no.innerHTML = "NO";
          no.id = "no";
          no.ariaLabel = "location";
          no.className = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-red-400 hover:text-red-400 focus:border-red-500 focus:text-red-500";
          no.onclick = function() { distanceSelect("no"); }

          var yes = document.createElement("button");
          yes.innerHTML = "YES";
          yes.id = "yes";
          yes.ariaLabel = "location";
          yes.className = "text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-green-400 hover:text-green-400 focus:border-green-500 focus:text-green-500";
          yes.onclick = function() { distanceSelect("yes"); }

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
        if(currentStep == 1){  
          if(pName != ""){
            let taken
            try{
              taken = await nameTaken(pName);
            }catch(err){
              console.log(err);
            }
            if(!taken){
              setStep(currentStep, nextStep);
            }else{
              // taken
            }
          }else{
            // not filled
          }
        }else{
          setStep(currentStep, nextStep);
        }
      }else if(direction == "b" && lastStep > 0){
        setStep(currentStep, lastStep);
      }
    }

    return (
      <main>
        <div style={{ display: show ? "none" : "block"}}>
          <div id="progress" className="w-1/6 bg-gradient-to-r from-red-400 via-pink-500 to-yellow-400 h-2"></div>
    
          <div id="tab1" className="flex flex-col mx-7">
            <div className="w-full h-10">
              <button id="b1" type="button" onClick={ step } className="font-semibold text-gray-500 text-6xl opacity-50 disabled:opacity-50">‹</button>
            </div>
            <h3 id="p1" className="font-semibold font-sans mt-10 text-3xl text-gray-800">My name is</h3>
            <div id="container" className="flex flex-col">
              <input type="text" name="name" placeholder="Name" aria-label="Name" onChange={ handleName } className="focus:border-gray-600 focus:ring-0 mt-4 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400"/>
            </div>
            <button id="n1" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONTINUE</button>
          </div>
        </div>
    
        <div style={{ display: show ? "block" : "none"}} id="next" className="flex flex-col max-w-screen-video h-screen m-auto">
          <div className="aspect-w-16 aspect-h-9 flex flex-col bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl mx-5 mt-10 overflow-hidden">
            {RemoteVideo}
          </div>
    
          <div className="aspect-w-15 aspect-h-2 flex flex-col h bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl mx-5 mt-6 overflow-hidden">
            {UserVideo}
          </div>
        </div>
      </main>
    )
}
  
export default Video;


/*


          <div id="tab2" className="flex flex-col mx-7 hidden">
            <div className="w-full h-10">
              <button id="b2" onClick={ step } type="button" className="font-semibold text-gray-500 text-6xl">‹</button>
            </div>
            <h3 id="p2" className="font-semibold font-sans mt-10 text-3xl text-gray-800">My gender is</h3>
            <div className="space-y-3 flex flex-col mt-10">
              <button id="gfemale" aria-label="gender" className="w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500">Female</button>
              <button id="gmale" aria-label="gender" className="w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500">Male</button>
            </div>
            <button id="n2" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONTINUE</button>
          </div>
    
          <div id="tab3" className="flex flex-col mx-7 hidden">
            <div className="w-full h-10">
              <button id="b3" onClick={ step } type="button" className="font-semibold text-gray-500 text-6xl">‹</button>
            </div>
            <h3 id="p3" className="font-semibold font-sans mt-10 text-3xl text-gray-800">My birth date is</h3>
            <input type="date" aria-label="age" className="mt-10 rounded-md"/>
            <button id="n3" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONTINUE</button>
          </div>
    
          <div id="tab4" className="flex flex-col mx-7 hidden">
            <div className="w-full h-10">
              <button id="b4" onClick={ step } type="button" className="font-semibold text-gray-500 text-6xl">‹</button>
            </div>
            <h3 id="p4" className="font-semibold font-sans mt-10 text-3xl text-gray-800">I'm sexually attracted to</h3>
            <div className="space-y-3 flex flex-col mt-10">
              <button id="pmale" aria-label="sexuality" className="w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500">Men</button>
              <button id="pfemale" aria-label="sexuality" className="w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-red-500 focus:text-red-500">Women</button>
            </div>
            <button id="n4" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONTINUE</button>
          </div>
    
          <div id="tab5" className="flex flex-col mx-7 hidden">
            <div className="w-full h-10">
              <button id="b5" onClick={ step } type="button" className="font-semibold text-gray-500 text-6xl">‹</button>
            </div>
            <h3 id="p5" className="font-semibold font-sans mt-10 text-3xl text-gray-800">I'm interested in</h3>
            <textarea className="focus:ring-0 resize-none rounded-xl mt-10" aria-label="description" placeholder="I like..." rows="5" aria-label="Interests"></textarea>
            <button id="but5" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONTINUE</button>
          </div>
    
          <div id="tab6" className="flex flex-col mx-7 hidden">
            <div className="w-full h-10">
              <button id="b6" onClick={ step } type="button" className="font-semibold text-gray-500 text-6xl">‹</button>
            </div>
            <h3 id="p6" className="font-semibold font-sans mt-10 text-3xl text-gray-800">Do you want to look for people near you?</h3>
            <div className="mt-10 space-x-10 inline-flex m-auto">
              <button aria-label="location" className="text-4xl border-2 rounded border-red-400 p-2 text-red-500 hover:border-red-600 hover:text-red-600 focus:border-red-600 focus:text-red-600">NO</button>
              <button aria-label="location" className="text-4xl border-2 rounded border-green-400 p-2 text-green-500 hover:border-green-600 hover:text-green-600 focus:border-green-600 focus:text-green-600">YES</button>
            </div>
            <button id="n6" type="button" onClick={ step } className="shadow-md max-w-xs h-12 bg-gradient-to-r text-white font-semibold from-red-600 via-pink-500 to-yellow-400 rounded-xl mt-10 m-auto px-28">CONNECT</button>
          </div>

          */



/*

        <> 
          <div style={{ display: show ? "none" : "block"}} className="max-w-screen-sm m-auto">
            <div className="flex flex-col bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl m-5 mt-24 overflow-hidden">
              <div className="mb-5 flex items-center rounded-xl py-2 m-4 text-white shadow-inner border "> 
                <input className="font-semibold appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:ring-0" type="text" placeholder="Your name" aria-label="Full name" onChange={ handleName }/>
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
          </div>
          
          <div style={{ display: show ? "block" : "none"}} id="next" className="flex flex-col max-w-screen-video h-screen m-auto">
            <div className="aspect-w-16 aspect-h-9 flex flex-col bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl mx-5 mt-10 overflow-hidden">
              {RemoteVideo}
            </div>

            <div className="aspect-w-15 aspect-h-2 flex flex-col h bg-white rounded border-red-300 border-l-4 border-r-4 border-t-8 border-b-8 shadow-xl mx-5 mt-6 overflow-hidden">
              {UserVideo}
            </div>
          </div>
        </>

*/



/*
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
*/