import { createContext, useState } from 'react';
import mic from "../../public/mic.svg";         

const MicIStatusContext = createContext();

export const MicIStatusProvider = ({ children }) => {
    const [micIStatus, setMicIStatus] = useState(mic);
    const handleMicIStatus = (e) => {
        setMicIStatus(e);
    }
    return (
    <MicIStatusContext.Provider value={[micIStatus, handleMicIStatus]}>
        {children}
    </MicIStatusContext.Provider>
    );
};

export default MicIStatusContext;