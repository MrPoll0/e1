import { createContext, useState } from 'react';

const DateContext = createContext();

export const DateProvider = ({ children }) => {
    const [date, setDate] = useState("");
    const handleDate = (e) => {
        setDate(e.target.value);
    }
    return (
    <DateContext.Provider value={[date, handleDate]}>
        {children}
    </DateContext.Provider>
    );
};

export default DateContext;