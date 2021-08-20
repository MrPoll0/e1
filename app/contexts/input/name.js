import { createContext, useState } from 'react';

const NameContext = createContext();

export const NameProvider = ({ children }) => {
    const [name, setName] = useState("");
    const handleName = (e) => {
        let str = e.target.value.replace(/^\s+/, '');
        setName(str);
    }
    return (
    <NameContext.Provider value={[name, handleName]}>
        {children}
    </NameContext.Provider>
    );
};

export default NameContext;