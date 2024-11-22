import { useState, useEffect } from "react";
import { useAuth } from "./authprovider";
import { EndGame, getUserRole } from "./datastore";
import { ScoreRound, listenForWinner } from "./game-logic";
import Spinner from "./spinner";
import { useNavigate } from "react-router-dom";


const ResultsScreen = (gameName) => {
    const [winner, setWinner] = useState('');
    const [waiting, setWaiting] = useState(true);
    const [spinner, setSpinner] = useState(false);
    const uAuth = useAuth();
    const user = uAuth.user;
    const groupName = gameName.gameName;

    const navigate = useNavigate();

    useEffect(() => {
        return listenForWinner(groupName, async (newData) => {
            console.log('newdata: ', newData);
            if (newData != '') {
                let winMsg = ''
                if (user == newData[0]) {
                    winMsg = 'Congratulations, you won the round with a ' + newData[1] + '!';
                } else {
                    winMsg = 'Unfortunatly, user: ' + newData[0] + ' won the round with a ' + newData[1];
                }
                console.log(winMsg);
                setWinner(winMsg);
            }
            setWaiting(false);
            console.log("winner chosen");
        });
    }, [])

    const GetResults = async () => {
        const role = await getUserRole(groupName, user);
        console.log(role);
        if (role == 'owner') {
            console.log(groupName);
            await ScoreRound(groupName);
        }
    }

    const handleLeaveGame = async () => {
        setSpinner(true);
        await EndGame(groupName);
        navigate('/');
    }

    const result = GetResults();

    return (
        <div>
            {waiting
                ?
                <div>
                    <small className="d-block text-body-secondary">Game finshed, winner is being decided</small>
                    <div className="center-object">
                        <Spinner />
                    </div>
                </div>
                :
                <div>
                    {!spinner
                        ?
                        <div>
                            {winner}
                            <button
                                className='centerObject btn-margin btn btn-secondary'
                                onClick={() => { handleLeaveGame() }}>
                                End Game
                            </button>
                        </div>
                        :
                        <div className="center-object">
                            <Spinner />
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default ResultsScreen;