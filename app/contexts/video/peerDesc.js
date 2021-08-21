import { createContext, useState } from 'react';

const PeerDescContext = createContext();

export const PeerDescProvider = ({ children }) => {
    const [peerDesc, setPeerDesc] = useState();
    const handlePeerDesc = (e) => {
        setPeerDesc(e);
    }
    return (
    <PeerDescContext.Provider value={[peerDesc, handlePeerDesc]}>
        {children}
    </PeerDescContext.Provider>
    );
};

export default PeerDescContext;