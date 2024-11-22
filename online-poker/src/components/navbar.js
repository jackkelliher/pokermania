import { useNavigate } from "react-router-dom"



const Navbar = () => {

    const navigate = useNavigate();

    const Navigation = (page) => {
        navigate(page);
    }

    return (
        <div id='navbar-area'>
            <ul className="poker-navbar">
                <li className="navbar-items"
                    onClick={() => Navigation('/')}
                >
                    Home
                </li>
                <li className="navbar-items"
                    onClick={() => { Navigation('/create') }}
                >
                    Create Game
                </li>
                <li className="navbar-items"
                    onClick={() => { Navigation('/games') }}
                >
                    View Games
                </li>
            </ul>
        </div>
    )
}

export default Navbar