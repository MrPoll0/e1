import setButtonStyle from "../../components/input/setButtonStyle";

const distanceSelect = (e, handlePos) => {
    if(e === "yes"){
      if(window.navigator.geolocation){
        window.navigator.geolocation.getCurrentPosition(handlePos);
        setButtonStyle("d", "yes");
      }else{
        alert("Distance not available");
      }
    }else if(e === "no"){
      handlePos([]);
      setButtonStyle("d", "no");
    }
}

export default distanceSelect;