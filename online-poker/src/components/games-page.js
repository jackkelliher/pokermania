import React, { useEffect, useState } from "react"
import { GetUserCount, JoinGame, listenForGames, listenForUsers, handleUserNumbers, EndGame } from "./datastore";
import Navbar from "./navbar";
import { useAuth } from "./authprovider";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import Spinner from "./spinner";
import GameItem from "./game-item";


const GamesPage = () => {
    const [games, setGames] = useState([]);
    const [waiting, setWaiting] = useState(true);

    const uAuth = useAuth();

    useEffect(() => {
        return listenForGames(async (newData) => {
            const gameIDs = newData.map((doc) => (doc.data()));
            const result = await handleUserNumbers(gameIDs, uAuth.user);
            setGames(result);
            setWaiting(false);
        });
    }, [])

    return (
        <section>
            <Navbar />
            <div id='avaliable-games' className="container-sm">
                <h1>Avaliable Games</h1>
                {waiting
                    ?
                    <div className="center-object">
                        <Spinner />
                    </div>
                    :

                    <div
                        className="d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-center justify-content-center"
                    >
                        {
                            games?.map((item, i) => (
                                <div id={i}>
                                    <React.StrictMode>
                                        <GameItem item={{ item }} />
                                    </React.StrictMode>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
        </section>
    )
}

export default GamesPage;