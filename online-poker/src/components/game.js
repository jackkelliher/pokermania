import React, { useState, useEffect } from "react"
import { AllUsersReady, DealCards, ReadyUser, SwapCard, listenToUserReadys } from "./game-logic";
import { useAuth } from "./authprovider"
import Navbar from "./navbar";
import { listenForCards, listenToSwapNum } from "./game-logic";
import Card from "./card";
import Spinner from "./spinner";
import ResultsScreen from "./results-screen";


const Game = (data) => {
    const [cards, setCards] = useState([]);
    const [gameState, setGameState] = useState(0); //0 is waiting, 1 is running, 2 is finished, 
    const [waiting, setWaiting] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [finished, setFinished] = useState(false);
    const [readyNum, setReadyNum] = useState(0);
    const gameData = data.data;
    const uAuth = useAuth();
    const user = uAuth.user;
    const groupName = gameData[0];
    const userCount = gameData[1];

    useEffect(() => {
        return listenForCards(groupName, user, async (newData) => {
            if (newData != undefined) {
                setCards(newData);
                setWaiting(false);
                setGameState(1);
            }
        });
    }, [])

    useEffect(() => {
        return listenToUserReadys(groupName, async (newData) => {
            const userNums = newData;
            setReadyNum(newData);
            console.log('uCount: ', userCount, ' readynums: ', userNums);
            const readyState = await AllUsersReady(userCount, userNums);
            if (readyState == true) {
                console.log("All users ready");
                setWaiting(false);
                setFinished(true);
            } else {
                console.log("Not all users ready");
            }
        })
    })

    useEffect(() => {
        return listenToSwapNum(groupName, user, async (newData) => {
            if (newData >= 2) {
                setDisabled(true);
            }
        });
    }, [])

    const handleSwap = async (card) => {
        setWaiting(true);
        await SwapCard(card, user, groupName);
        setWaiting(false);
    }

    //Handles when a user has pressed the ready button, goes into waiting state until all users are ready
    const handleReady = async () => {
        setWaiting(true);
        await ReadyUser(groupName);
    }



    return (
        <section>
            {!finished
                ?
                <div>
                    {gameState == 0
                        ?

                        <div className="center-object">
                            <Spinner />
                        </div>
                        :

                        <div
                            className="d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-center justify-content-center"
                        >
                            {waiting
                                ?
                                <div className="center-object">
                                    <Spinner />
                                </div>
                                :
                                <div>
                                    <h1>Your Cards</h1>
                                    {!disabled
                                        ?
                                        <small className="d-block text-body-secondary">Choose two cards to swap for new ones</small>
                                        :
                                        <small className="d-block text-body-secondary">You have chosen two cards to swap</small>
                                    }
                                    {
                                        cards?.map((item, i) => (
                                            <div id={i}>
                                                <React.StrictMode>
                                                    <Card data={[item, groupName]} />
                                                </React.StrictMode>
                                                {!disabled
                                                    ?
                                                    <button
                                                        className='centerObject btn-margin btn btn-secondary'
                                                        disabled={disabled}
                                                        onClick={() => { handleSwap(item) }}
                                                    >
                                                        Swap Card
                                                    </button>
                                                    : null

                                                }
                                            </div>
                                        ))
                                    }
                                    <button
                                        className='centerObject btn-margin btn btn-secondary'
                                        onClick={() => { handleReady() }}>
                                        Ready
                                    </button>
                                </div>
                            }
                        </div>
                    }
                </div>
                :
                <React.StrictMode>
                    <ResultsScreen gameName={groupName} />
                </React.StrictMode>
            }
        </section>
    )
}

export default Game;