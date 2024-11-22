import { JoinGame, EndGame } from "./datastore";
import { useAuth } from "./authprovider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Spinner from "./spinner";

const GameItem = (item) => {
    const [waiting, setWaiting] = useState(false);

    const uAuth = useAuth();
    const navigate = useNavigate();

    //Item is an object inside of an object
    item = item.item.item;

    const handleJoinGame = async (groupData) => {
        const result = await JoinGame(groupData[0], uAuth.user);
        console.log(result);

        if (result == "Success") {
            navigate('/lobby', { state: [groupData[0], groupData[1]] });
        } else {
            console.log(result);
        }
    }

    const handleViewGame = async (groupData) => {
        navigate('/lobby', { state: [groupData[0], groupData[1]] })
    }

    const handleDeleteGame = async (groupName) => {
        setWaiting(true);
        await EndGame(groupName);

        setWaiting(false);
    }


    return (
        //Item[0] is the group name
        //Item[1] is the playercount of the game
        //Item[2] is the existance of the user in the game
        //Item[3] marks if the user is the owner of the game
        //Item[4] marks if the game has started or not
        <div>
            {!waiting
                ?
                <div>
                    {!item[4] || item[3]
                        ?
                        <div className='list-group list-group-item d-flex gap-3 game btn-margin'>
                            <span className="pt-1">
                                <strong>Name: {item[0]}</strong>
                                <small
                                    className="d-block text-body-secondary"
                                >
                                    Player Count: {item[1]}/5</small>
                            </span>
                            {!item[4]
                                ?
                                <div>
                                    {!item[3] ?
                                        <button
                                            onClick={() => { handleJoinGame([item[0], item[3]]) }}
                                            disabled={item[2] || item[3]}
                                            className="btn btn-secondary"
                                        >
                                            Join Game
                                        </button>
                                        :
                                        <div>
                                            <button
                                                disabled={!(item[3] || item[2])}
                                                onClick={() => { handleViewGame([item[0], item[3]]) }}
                                                className="btn btn-secondary"
                                            >
                                                View Game
                                            </button>
                                            <button
                                                disabled={!(item[3] || item[2])}
                                                onClick={() => { handleDeleteGame(item[0]) }}
                                                className="btn btn-secondary"
                                            >
                                                Delete Game
                                            </button>
                                        </div>
                                    }
                                </div>
                                :
                                <div>
                                    <p>Game Running</p>

                                    <button
                                        disabled={!(item[3] || item[2])}
                                        onClick={() => { handleDeleteGame(item[0]) }}
                                        className="btn btn-secondary"
                                    >
                                        Delete Game
                                    </button>
                                </div>}
                            {item[3] ?
                                <p>Owner</p>
                                :
                                ''
                            }
                        </div>
                        :
                        <div></div>
                    }
                </div>
                :
                <div className="center-object">
                    <Spinner />
                </div>
            }
        </div>
    )
}

export default GameItem;