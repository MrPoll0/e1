import { NameProvider } from "./input/name.js";
import { GenderProvider } from "./input/gender.js";
import { PrefProvider } from "./input/pref.js";
import { DateProvider } from "./input/date.js";
import { DescriptionProvider } from "./input/description.js";
import { PosProvider } from "./input/pos.js";
import { JoinedRoomProvider } from "./joinedRoom.js";
import { StreamingProvider } from "./input/streaming.js";
import { RemotingProvider } from "./input/remoting.js";
import { LocalVidRefProvider } from "./video/localVidRef.js";
import { RemoteVidRefProvider } from "./video/remoteVidRef.js";
import { PeerNameProvider } from "./video/peerName.js";
import { PeerAgeProvider } from "./video/peerAge.js";
import { PeerDescProvider } from "./video/peerDesc.js";
import { CamIStatusProvider } from "./video/camIStatus.js";
import { MicIStatusProvider } from "./video/micIStatus.js";

export const Providers = ({ children }) => (
    <NameProvider>
    <GenderProvider>
    <PrefProvider>
    <DateProvider>
    <DescriptionProvider>
    <PosProvider>
    <JoinedRoomProvider>
    <StreamingProvider>
    <RemotingProvider>
    <LocalVidRefProvider>
    <RemoteVidRefProvider>
    <PeerNameProvider>
    <PeerAgeProvider>
    <PeerDescProvider>
    <CamIStatusProvider>
    <MicIStatusProvider>
        {children}
    </MicIStatusProvider>
    </CamIStatusProvider>
    </PeerDescProvider>
    </PeerAgeProvider>
    </PeerNameProvider>
    </RemoteVidRefProvider>
    </LocalVidRefProvider>
    </RemotingProvider>
    </StreamingProvider>
    </JoinedRoomProvider>
    </PosProvider>
    </DescriptionProvider>    
    </DateProvider>
    </PrefProvider>
    </GenderProvider>
    </NameProvider>
);