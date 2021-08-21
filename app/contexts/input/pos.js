import { createContext, useState } from 'react';

const PosContext = createContext();

export const PosProvider = ({ children }) => {
    const [pos, setPos] = useState([]);
    const handlePos = (e) => {
        setPos(e);
    }
    return (
    <PosContext.Provider value={[pos, handlePos]}>
        {children}
    </PosContext.Provider>
    );
};

export default PosContext;