import { useState } from "react";
import { CreateGame } from "./datastore";
import { useAuth } from "./authprovider";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Spinner from "./spinner";

const CreateGamePage = () => {
    const [gameName, setGameName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [waiting, setWaiting] = useState(true);

    const uAuth = useAuth();
    const navigate = useNavigate();

    const HandleCreation = async () => {
        setWaiting(true);
        if (gameName == '') {
            setErrorMsg('Please Enter a name for this game');
            return;
        }

        const result = await CreateGame(gameName, uAuth.user);

        console.log(result);

        if (result != "Success") {
            setErrorMsg(result);
            return;
        }

        setErrorMsg("Game " + gameName + " created successfully.");
        navigate('/games', { state: gameName });
        setWaiting(false);
    }

    return (
        <section>
            <Navbar />
            <div id="create-game" className="container-sm">
                <h1>Create Game</h1>
                {waiting
                    ?
                    <div>
                        <label for='game-name'>
                            Enter a name for this game
                        </label>
                        <input id='game-name'
                            className="form-control"
                            onChange={(e) => setGameName(e.target.value)}
                            role="create-game-input"
                        />
                        {errorMsg}
                        <button
                            className="btn btn-secondary btn-margin"
                            onClick={() => {
                                HandleCreation();
                            }}
                        >
                            Create New Game
                        </button>
                    </div>
                    :
                    <div>
                        <Spinner />
                    </div>
                }
            </div>
        </section>
    )
}

export default CreateGamePage;