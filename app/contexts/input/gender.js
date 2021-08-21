import { createContext, useState } from 'react';
import setButtonStyle from "../../components/input/setButtonStyle";

const GenderContext = createContext();

export const GenderProvider = ({ children }) => {
    const [gender, setGender] = useState();
    const handleGender = (e) => {
        setGender(e);
        setButtonStyle("g", e);
    }
    return (
    <GenderContext.Provider value={[gender, handleGender]}>
        {children}
    </GenderContext.Provider>
    );
};

export default GenderContext;