import cam from "../../public/cam.svg";                  
import cam1 from "../../public/cam-1.svg";

const muteCam = (stream, handleCamIStatus) => {
    stream.getVideoTracks().forEach(function(track){
        track.enabled = !track.enabled;
        if(track.enabled){
            handleCamIStatus(cam);
        }else{
            handleCamIStatus(cam1);
        }
    });
}

export default muteCam;