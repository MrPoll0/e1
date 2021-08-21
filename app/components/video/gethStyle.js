const gethStyle = (type, vid) => {
    let video = document.querySelector(`video[name='${vid}']`);
    let highlightAlt = " shadow-highlight";
    let highlightStyle = video.className + highlightAlt;
    let normalStyle = video.className.replace(highlightAlt, "");

    if(type === "normal"){
      return normalStyle;
    }else if(type === "highlight"){
      return highlightStyle;
    }
}

export default gethStyle;