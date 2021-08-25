import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import setButtonStyle from "./input/setButtonStyle";
import getAge from "./input/getAge";
import RedAlert from "./RedAlert";
import Image from "next/image";

import image1 from "../public/image1.svg";
import image2 from "../public/image2.svg";
import image3 from "../public/image3.svg";

import DateContext from "../contexts/input/date";
import DescriptionContext from "../contexts/input/description";
import GenderContext from "../contexts/input/gender";
import NameContext from "../contexts/input/name";
import PosContext from "../contexts/input/pos";
import PrefContext from "../contexts/input/pref";
import JoinedRoomContext from "../contexts/joinedRoom";

import en from "../locales/en";
import es from "../locales/es";
import fr from "../locales/fr";
import pt from "../locales/pt";

export default function Form({ endpoint }){
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
      case "pt":
        t = pt;
        break;
    }

    const [name, handleName] = useContext(NameContext);
    const [gender, handleGender] = useContext(GenderContext);
    const [date, handleDate] = useContext(DateContext);
    const [pref, handlePref] = useContext(PrefContext);
    const [description, handleDescription] = useContext(DescriptionContext);
    const [pos, handlePos] = useContext(PosContext);
    const [joinedRoom, handleJoinedRoom] = useContext(JoinedRoomContext);

    const [step, setStep] = useState(0);
    const [error, setError] = useState(false);

    async function handleClick(){
        const nameTaken = (await import("./input/nameTaken")).default;
        let taken
        try{
          taken = await nameTaken(name, endpoint);
        }catch(err){
          console.log(err);
        }
        if(!taken){
          handleJoinedRoom(true);
        }else{
          setStep(1);
          setError(t.error_name_taken);
        }
    }

    function checkInput(step){
        switch(step){
          case 1:
            let nmaxLength = 29;
            let ncond1 = name != "";
            let ncond2 = name.length < nmaxLength;

            if(ncond1 && ncond2){
              return true;
            }else if(!ncond1){
              return t.error_name_empty;
            }else if(!ncond2){
              return t.error_name_length + " " + nmaxLength;
            }
          case 2:
            if(gender != undefined){
              return true;
            }
            return t.error_gender;
          case 3:
            let cAge = getAge(date);
            let acond1 = date != "";
            let acond2 = cAge > 0 && cAge <= 120;
            let acond3 = cAge >= 18;
            if(acond1 && acond2 && acond3){
              return true;
            }else if(!acond1){
              return t.error_age_empty
            }else if(!acond2){
              return t.error_age_invalid; 
            }else if(!acond3){
              return t.error_age_18;
            }
          case 4:
            if(pref != undefined){
              return true;
            }
            return t.error_pref;
          case 5:
            let dmaxLength = 306;
            let dmaxRows = 5;

            //let dcond1 = description != "";
            let dcond2 = description.length < dmaxLength;
            let dcond3 = description.split(/\r\n|\r|\n/).length <= dmaxRows;
            if(dcond2 && dcond3){
              return true;
            /*}else if(!dcond1){
              return t.error_description_empty;*/
            }else if(!dcond2){
              return t.error_description_length + " " + dmaxLength;
            }else if(!dcond3){
              return t.error_description_rows + " " + dmaxRows;
            }
          case 6:
        }
    }

    let title;
    let content;

    let continueClass = "uppercase shadow-md max-w-xs h-14 bg-gradient-to-r text-white font-semibold from-blue-200 via-purple-400 to-purple-900 rounded-xl sm:mt-12 mt-6 m-auto mb-0 px-28 z-10 text-xl tracking-tighter";

    switch(step){
        case 0:
            content = (
              <>
              {locale === "en" ? 
                <h1 className="text-4xl mobile2:text-5xl tablet2:text-6xl 2xl:text-8xl filter drop-shadow-lg font-bold tracking-tighter text-center mt-4">{t.landing_h1}<span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-900">{t.landing_h1_2}</span>{t.landing_h1_3}</h1>
              :
                <h1 className="text-4xl mobile2:text-5xl tablet2:text-6xl 2xl:text-8xl filter drop-shadow-lg font-bold tracking-tighter text-center mt-4">{t.landing_h1}<span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-900">{t.landing_h1_2}</span></h1>
              }
              <h2 className="text-xl mobile2:text-2xl tablet2:text-3xl 2xl:text-5xl font-thin text-center mt-2">{t.landing_h2}</h2>
              <button onClick={() => changeStep(1)} type="button" className="uppercase shadow-md max-w-xs 2xl:max-w-md h-14 2xl:h-20 bg-gradient-to-r text-white font-semibold from-blue-200 via-purple-400 to-purple-900 rounded-xl mt-12 m-auto mb-0 px-28 z-10 text-xl 2xl:text-4xl tracking-tighter">{t.landing_go}</button>

              <section className="mt-20">
                <div className="inline-flex space-x-5">
                  <div style={{width: "40%"}}>
                    <Image src={image1} alt={t.landing_caract1_alt} className="filter drop-shadow-lg"></Image>
                  </div>
                  <div style={{width: "50%"}}>
                    <p className="text-xl mobile2:text-2xl tablet2:text-3xl 2xl:text-5xl font-bold filter drop-shadow-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-blue-300 via-purple-400 to-purple-900">{t.landing_caract1}</p>
                    <p className="text-sm mobile2:text-base tablet2:text-lg 2xl:text-2xl mt-3 font-thin">{t.landing_caract1_desc}</p>
                  </div>
                </div>
              </section>

              <section className="mt-5 2xl:mt-10">
                <div className="inline-flex space-x-5">
                  <div style={{width: "50%"}}>
                    <p className="text-xl mobile2:text-2xl tablet2:text-3xl 2xl:text-5xl font-bold filter drop-shadow-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-blue-300 via-purple-400 to-purple-900">{t.landing_caract2}</p>
                    <p className="text-sm mobile2:text-base tablet2:text-lg 2xl:text-2xl mt-3 font-thin">{t.landing_caract2_desc}</p>
                  </div>
                  <div style={{width: "40%"}}>
                    <Image src={image2} alt={t.landing_caract2_alt} className="filter drop-shadow-lg"></Image>
                  </div>
                </div>
              </section>

              <section className="mt-5 2xl:mt-10">
                <div className="inline-flex space-x-5">
                  <div style={{width: "40%"}}>
                    <Image src={image3} alt={t.landing_caract3_alt} className="filter drop-shadow-lg"></Image>
                  </div>
                  <div style={{width: "50%"}}>
                    <p className="text-xl mobile2:text-2xl tablet2:text-3xl 2xl:text-5xl font-bold filter drop-shadow-lg tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-purple-900 via-purple-400 to-blue-300">{t.landing_caract3}</p>
                    <p className="text-sm mobile2:text-base tablet2:text-lg 2xl:text-2xl mt-3 font-thin">{t.landing_caract3_desc}</p>
                  </div>
                </div>
              </section>
              </>
            );
            break;
        case 1:
            title = t.name_title;
            content = (
                <>
                <div id="container" className="flex flex-col">
                    <input value={name} type="text" name="name" placeholder={t.name_placeholder} aria-label={t.name_placeholder} onChange={ handleName } className="focus:border-purple-500 focus:ring-0 mt-10 mx-6 border-t-0 border-l-0 border-r-0 border-b-2 border-gray-400 text-2xl"/>
                </div>
                <button name="continue" type="button" onClick={ () => changeStep(1) } className={continueClass}>{t.continue}</button>
                </>
            );
            break;
        case 2:
            title = t.gender_title;
            let genderclassN = "text-lg w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-purple-500 focus:text-purple-500 hover:font-semibold";

            content = ( 
                <>
                <div id="container" className="flex flex-col space-y-3 mt-10">
                    <button onClick={ () => handleGender("male") } id="gmale" aria-label={t.gender_male} className={genderclassN}>{t.gender_male}</button>
                    <button onClick={ () => handleGender("female") } id="gfemale" aria-label={t.gender_female} className={genderclassN}>{t.gender_female}</button>
                    <button onClick={ () => handleGender("other") } id="gother" aria-label={t.gender_other} className={genderclassN}>{t.gender_other}</button>
                </div>
                <button name="continue" type="button" onClick={ () => changeStep(1) } className={continueClass}>{t.continue}</button>
                </>
            );
            break;
        case 3:
            title = t.bdate_title;
            content = (
                <>
                <div id="container" className="flex flex-col">
                    <input type="date" value={date} aria-label={t.bdate_age} className="mt-10 rounded-md text-2xl" onChange={ handleDate }></input>
                </div>
                <button name="continue" type="button" onClick={ () => changeStep(1) } className={continueClass}>{t.continue}</button>
                </>
            );
            break;
        case 4:
            title = t.sexorient_title;
            let prefclassN = "sm:text-lg text-base w-full text-center border-2 border-gray-700 rounded-3xl p-3 text-gray-700 hover:border-gray-900 hover:text-gray-900 focus:border-purple-500 focus:text-purple-500 hover:font-semibold";

            content = (
                <>
                <div id="container" className="flex flex-col space-y-3 mt-10">
                    <button onClick={ () => handlePref("male") } id="pmale" aria-label={t.sexorient_aria} className={prefclassN}>{t.sexorient_men}</button>
                    <button onClick={ () => handlePref("female") } id="pfemale" aria-label={t.sexorient_aria} className={prefclassN}>{t.sexorient_women}</button>
                    <button onClick={ () => handlePref("both") } id="pboth" aria-label={t.sexorient_aria} className={prefclassN}>{t.sexorient_both}</button>
                    <button onClick={ () => handlePref("other") } id="pother" aria-label={t.sexorient_aria} className={prefclassN}>{t.sexorient_other}</button>
                </div>
                <button name="continue" type="button" onClick={ () => changeStep(1) } className={continueClass}>{t.continue}</button>
                </>
            );
            break;
        case 5:
            title = t.description_title;
            content = (
                <>
                <div id="container" className="flex flex-col">
                    <textarea onChange={ handleDescription } value={description} placeholder={t.description_placeholder} aria-label={t.description_aria} className="focus:ring-0 resize-non rounded-xl mt-10 text-lg" rows="5"></textarea>
                </div>
                <button name="continue" type="button" onClick={ () => changeStep(1) } className={continueClass}>{t.continue}</button>
                </>
            );
            break;
        case 6:
            title = t.pos_title;
            content = (
                <>
                <div id="container" className="inline-flex space-x-10 mt-10 m-auto">
                    <button id="no" aria-label={t.pos_aria} onClick={ async () => {{  const distanceSelect = (await import("./input/distanceSelect")).default; distanceSelect("no", handlePos) } }} className="uppercase text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-red-400 hover:text-red-400 focus:border-red-500 focus:text-red-500">{t.pos_no}</button>
                    <button id="yes" aria-label={t.pos_aria} onClick={ async () => {{  const distanceSelect = (await import("./input/distanceSelect")).default; distanceSelect("yes", handlePos) } }} className="uppercase text-4xl border-2 rounded border-gray-900 p-2 text-gray-700 hover:border-green-400 hover:text-green-400 focus:border-green-500 focus:text-green-500">{t.pos_yes}</button>
                </div>
                <button id="connect" onClick={ handleClick } className="uppercase shadow-md max-w-xs h-16 bg-gradient-to-r text-white font-semibold from-blue-200 via-purple-400 to-purple-900 rounded-xl mt-12 m-auto px-24 z-10 text-2xl tracking-tighter">{t.connect}</button>
                </>
            );
            break;
    }

    const changeStep = (e) => {
      if(e == 0){
        if(step > 1){ 
          setStep(step - 1);
          setError(false);
        }
      }else if(e == 1){
        if(step <= 6){
          if(step > 0){ 
            let check = checkInput(step);
            if(check == true){ 
              setStep(step + 1);
              setError(false);
            }else{
              setError(check);
            }
          }else{
            setStep(step + 1);
          }
        }
      }
    }

    useEffect(() => {
      if(step == 2){
        if(gender){
          setButtonStyle("g", gender);
        }
      }

      if(step == 4){
        if(pref){
          setButtonStyle("p", pref);
        }
      }
    }, [step]);

    function preventKeyboardResize(){
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      document.body.setAttribute("style", `width: ${w}px; height: ${h}px;`);
    }

    useEffect(() => {
      window.onresize = () => preventKeyboardResize();

      return () => {
        window.onresize = undefined;
      }
    }, [])

    return ( // If added more steps, remember to add the width to the safelist in tailwind.config.js
        <>
        <div id="progress" className={`${step === 0 ? "w-0" : `w-${step}/6` } bg-gradient-to-r from-blue-200 via-purple-400 to-purple-900 h-2`}></div>
        
        {step !== 0 ? 
          <div className="flex flex-col mx-7 flex-grow"> 
            <div className="w-full h-10">
              <button name="back" type="button" onClick={ () => changeStep(0) } className={step == 1 ? "font-semibold text-gray-500 text-6xl opacity-50 disabled:opacity-50 cursor-not-allowed" : "font-semibold text-gray-500 text-6xl disabled:opacity-50"}>‹</button>
            </div>
            <h3 className="font-semibold mt-10 text-5xl text-gray-smooth tracking-tighter mb-10">{title}</h3>
            {error !== false && <RedAlert title={t.error} message={error}/>}
            {content}
          </div>
        :
          <div className="flex flex-col mx-7 tablet:mx-24 laptop:mx-64 desktop:mx-80 2xl:mx-desktop2 flex-grow">
            {content}
          </div>
        }
        </>
    )
}