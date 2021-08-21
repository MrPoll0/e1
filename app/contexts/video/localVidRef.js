import { createContext, useRef } from 'react';

const LocalVidRefContext = createContext();

export const LocalVidRefProvider = ({ children }) => {
    const localVidRef = useRef(null);
    return (
    <LocalVidRefContext.Provider value={localVidRef}>
        {children}
    </LocalVidRefContext.Provider>
    );
};

export default LocalVidRefContext;