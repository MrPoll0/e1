import { createContext, useState } from 'react';

const PeerNameContext = createContext();

export const PeerNameProvider = ({ children }) => {
    const [peerName, setPeerName] = useState();
    const handlePeerName = (e) => {
        setPeerName(e);
    }
    return (
    <PeerNameContext.Provider value={[peerName, handlePeerName]}>
        {children}
    </PeerNameContext.Provider>
    );
};

export default PeerNameContext;