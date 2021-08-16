const setButtonStyle = (t, s) => {
    if(t == "p" || t == "g"){ 
        var defaultStyle = "sm:text-lg text-base w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-purple-500 focus:text-purple-500 hover:font-semibold";
        var selectedStyle = "sm:text-lg text-base w-full text-center border-2 rounded-3xl p-3 border-purple-500 text-purple-500 font-semibold";

        let both = document.querySelector("#"+t+"both");

        if(s == "male"){
        document.querySelector("#"+t+"male").className = selectedStyle;
        document.querySelector("#"+t+"female").className = defaultStyle;
        document.querySelector("#"+t+"other").className = defaultStyle;
        if(both){
            both.className = defaultStyle;
        }
        }else if(s == "female"){
        document.querySelector("#"+t+"female").className = selectedStyle;
        document.querySelector("#"+t+"male").className = defaultStyle;
        document.querySelector("#"+t+"other").className = defaultStyle;
        if(both){
            both.className = defaultStyle;
        }
        }else if(s == "other"){
        document.querySelector("#"+t+"other").className = selectedStyle;
        document.querySelector("#"+t+"male").className = defaultStyle;
        document.querySelector("#"+t+"female").className = defaultStyle;
        if(both){
            both.className = defaultStyle;
        }
        }else if(both && s == "both"){
        both.className = selectedStyle;
        document.querySelector("#"+t+"other").className = defaultStyle;
        document.querySelector("#"+t+"male").className = defaultStyle;
        document.querySelector("#"+t+"female").className = defaultStyle;
        }
    }else{
        var defaultStyleY = "uppercase text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-green-400 hover:text-green-400 focus:border-green-500 focus:text-green-500";
        var selectedStyleY = "uppercase text-4xl border-2 rounded p-2 border-green-500 text-green-500";
        var defaultStyleN = "uppercase text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-red-400 hover:text-red-400 focus:border-red-500 focus:text-red-500";
        var selectedStyleN = "uppercase text-4xl border-2 rounded p-2 border-red-500 text-red-500";

        document.querySelector("#"+s).className = (s == "yes" ? selectedStyleY : selectedStyleN);
        document.querySelector("#"+(s == "yes" ? "no" : "yes")).className = (s == "yes" ? defaultStyleN : defaultStyleY);
    }
}

export default setButtonStyle;