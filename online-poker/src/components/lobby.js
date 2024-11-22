import { useLocation } from "react-router-dom"
import { BeginGame, EndGame, HandleError, LeaveGame, listenForUsers } from "./datastore";
import { useAuth } from "./authprovider";
import React, { useEffect, useState } from "react";
import { collection, doc, getCountFromServer, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Game from "./game";
import { isGameRunning, DealCards } from "./game-logic";

const Lobby = () => {
    const [playerCount, setPlayerCount] = useState(0);
    const [running, setRunning] = useState(false);
    const uAuth = useAuth();
    const user = uAuth.user;
    const name = useLocation();
    const groupName = name.state[0];
    const membership = name.state[1];
    const navigate = useNavigate();

    useEffect(() => {
        return listenForUsers(groupName, async (newData) => {
            setPlayerCount(newData.length);
            console.log("Users");
        });
    }, [])

    useEffect(() => {
        return isGameRunning(groupName, async (data) => {
            console.log(data);
            if (data == 0) {
                console.log("Not running");
                setRunning(false);
            } else {
                console.log("Not running");
                setRunning(true);
            }
        });
    }, [])

    const handleLeave = () => {
        LeaveGame(name.state[0], user);
        navigate('/');
    }

    const handleEnd = () => {
        EndGame(name.state[0]);
        navigate('/');
    }

    const handleBegin = async () => {
        try {
            const result = await DealCards(groupName);
            await BeginGame(groupName);
        } catch (e) {
            HandleError(e);
        }
    }

    return (
        <div>
            <Navbar />
            <div className="container-sm">
                <div className="card">
                    <div className="card-body">
                        <div className="card-title">
                            <h1>{groupName}</h1>
                        </div>
                        {!running ?
                            <div className="card-text">
                                {membership ?
                                    <small className="d-block text-body-secondary">
                                        You are the Owner
                                    </small>
                                    :
                                    <small className="d-block text-body-secondary">
                                        You are a Guest
                                    </small>
                                }
                                <small
                                    className="d-block text-body-secondary"
                                >
                                    Player Count: {playerCount}/5</small>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        {membership
                                            ?
                                            <button
                                                onClick={() => {
                                                    handleBegin();
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                Begin Game
                                            </button>
                                            : null
                                        }
                                    </li>
                                    <li className="list-group-item">
                                        {membership ?
                                            <button
                                                onClick={() => {
                                                    handleEnd();
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                End Game
                                            </button>
                                            :
                                            <button
                                                onClick={() => {
                                                    handleLeave();
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                Leave Game
                                            </button>
                                        }
                                    </li>
                                </ul>
                            </div>
                            :
                            <React.StrictMode>
                                <Game data={[groupName, playerCount]} />
                            </React.StrictMode>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Lobby;