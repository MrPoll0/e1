import { createContext, useState } from 'react';
import cam from "../../public/cam.svg";

const CamIStatusContext = createContext();

export const CamIStatusProvider = ({ children }) => {
    const [camIStatus, setCamIStatus] = useState(cam);
    const handleCamIStatus = (e) => {
        setCamIStatus(e);
    }
    return (
    <CamIStatusContext.Provider value={[camIStatus, handleCamIStatus]}>
        {children}
    </CamIStatusContext.Provider>
    );
};

export default CamIStatusContext;