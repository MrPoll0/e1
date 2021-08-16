import { createContext, useState } from 'react';

const RemotingContext = createContext();

export const RemotingProvider = ({ children }) => {
    const [remoting, setRemoting] = useState(false);
    const handleRemoting = (e) => {
        setRemoting(e);
    }
    return (
    <RemotingContext.Provider value={[remoting, handleRemoting]}>
        {children}
    </RemotingContext.Provider>
    );
};

export default RemotingContext;