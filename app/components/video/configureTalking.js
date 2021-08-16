import gethStyle from "./gethStyle";
import muteCam from "./muteCam";
import muteMic from "./muteMic";


const configureTalking = async (stream, type, micMuted, camMuted, handleMicIStatus, handleCamIStatus) => {
    if(stream){ 
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      await audioContext.audioWorklet.addModule('https://www.vibezz.live/audioModule.js');
      let mic = audioContext.createMediaStreamSource(stream);
      const audio = new AudioWorkletNode(audioContext, 'audioModule');
      let volume;
      let video = document.querySelector(`video[name='${type}']`);
      let highlightAlt = " shadow-highlight";
      let highlightStyle = video.className + highlightAlt;
      let normalStyle = video.className.replace(highlightAlt, "");
      
      audio.port.onmessage = (e) => {
        if(e.data.volume && document.querySelector(`video[name='${type}']`)){
          video = document.querySelector(`video[name='${type}']`);
          let fixedVol = e.data.volume.toFixed(2);
          volume = (volume !== fixedVol) ? fixedVol : volume;

          if(!(volume == 0) && video.className !== highlightStyle){
            video.className = gethStyle("highlight", type);
          }else if(volume == 0 && video.className !== normalStyle){
            video.className = gethStyle("normal", type);
          }
        }
      }

      mic.connect(audio);
      audio.connect(audioContext.destination);
    }

    if(stream && type == "local"){
      if(micMuted){
        muteMic(stream, handleMicIStatus);
      }
      if(camMuted){
        muteCam(stream, handleCamIStatus);
      }
    }
}

export default configureTalking;