import { createContext, useState } from 'react';

const NameContext = createContext();

export const NameProvider = ({ children }) => {
    const [name, setName] = useState("");
    const handleName = (e) => {
        if(e.target){
            if(e.target.value){ 
                setName(e.target.value);
            }
        }else{
            setName(e);
        }
    }
    return (
    <NameContext.Provider value={[name, handleName]}>
        {children}
    </NameContext.Provider>
    );
};

export default NameContext;