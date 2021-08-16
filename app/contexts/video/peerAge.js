import { createContext, useState } from 'react';

const PeerAgeContext = createContext();

export const PeerAgeProvider = ({ children }) => {
    const [peerAge, setPeerAge] = useState();
    const handlePeerAge = (e) => {
        setPeerAge(e);
    }
    return (
    <PeerAgeContext.Provider value={[peerAge, handlePeerAge]}>
        {children}
    </PeerAgeContext.Provider>
    );
};

export default PeerAgeContext;