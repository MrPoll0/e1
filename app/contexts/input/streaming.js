import { createContext, useState } from 'react';

const StreamingContext = createContext();

export const StreamingProvider = ({ children }) => {
    const [streaming, setStreaming] = useState(false);
    const handleStreaming = (e) => {
        setStreaming(e);
    }
    return (
    <StreamingContext.Provider value={[streaming, handleStreaming]}>
        {children}
    </StreamingContext.Provider>
    );
};

export default StreamingContext;