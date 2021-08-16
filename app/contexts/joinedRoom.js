import { createContext, useState } from 'react';

const JoinedRoomContext = createContext();

export const JoinedRoomProvider = ({ children }) => {
    const [joinedRoom, setJoinedRoom] = useState(false);
    const handleJoinedRoom = (e) => {
        setJoinedRoom(e);
    }
    return (
    <JoinedRoomContext.Provider value={[joinedRoom, handleJoinedRoom]}>
        {children}
    </JoinedRoomContext.Provider>
    );
};

export default JoinedRoomContext;