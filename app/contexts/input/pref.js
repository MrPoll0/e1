import { createContext, useState } from 'react';
import setButtonStyle from '../../components/input/setButtonStyle';

const PrefContext = createContext();

export const PrefProvider = ({ children }) => {
    const [pref, setPref] = useState();
    const handlePref = (e) => {
        setPref(e);
        setButtonStyle("p", e);
    }
    return (
    <PrefContext.Provider value={[pref, handlePref]}>
        {children}
    </PrefContext.Provider>
    );
};

export default PrefContext;