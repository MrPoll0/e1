import Image from "next/image";
import Logotype from "../public/logotype.png";

export default function Header() {
    return (
        <header className="flex w-full border-b">
            <div className="m-auto -mb-4">
                <Image src={Logotype} alt="Logotype" width="409" height="109" quality="100"></Image>
            </div>
        </header>
    )
}