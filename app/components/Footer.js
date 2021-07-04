import { version } from "../package.json"

export default function Footer() {
    return (
        <footer>
            <hr/>
            <p>Copyright &copy; MrPoll0 2021</p><br/>
            <p>Version: {version}</p>
        </footer>
    )
}