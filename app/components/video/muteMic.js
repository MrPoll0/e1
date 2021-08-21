import mic from "../../public/mic.svg";                  
import mic1 from "../../public/mic-1.svg";

const muteMic = (stream, handleMicIStatus) => {
    stream.getAudioTracks().forEach(function(track){
        track.enabled = !track.enabled;
        if(track.enabled){
            handleMicIStatus(mic);
        }else{
            handleMicIStatus(mic1);
        }
    });
}

export default muteMic;