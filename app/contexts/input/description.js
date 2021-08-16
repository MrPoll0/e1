import { createContext, useState } from 'react';

const DescriptionContext = createContext();

export const DescriptionProvider = ({ children }) => {
    const [description, setDescription] = useState("");
    const handleDescription = (e) => {
        setDescription(e);
    }
    return (
    <DescriptionContext.Provider value={[description, handleDescription]}>
        {children}
    </DescriptionContext.Provider>
    );
};

export default DescriptionContext;