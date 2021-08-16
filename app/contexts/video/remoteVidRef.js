import { createContext, useRef } from 'react';

const RemoteVidRefContext = createContext();

export const RemoteVidRefProvider = ({ children }) => {
    const remoteVidRef = useRef(null);
    return (
    <RemoteVidRefContext.Provider value={remoteVidRef}>
        {children}
    </RemoteVidRefContext.Provider>
    );
};

export default RemoteVidRefContext;