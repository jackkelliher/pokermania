import { SignIn, CreateGame, ViewGames } from './datastore'
import { useState } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';
import Spinner from './spinner';


const OnlinePoker = () => {
    const [games, setGames] = useState([])

    const navigate = useNavigate();

    const getGames = async () => {
        const currentGames = await ViewGames();

        setGames(currentGames);
        console.log(games);
    }

    return (
        <div>
            <Navbar />
            <div id='content' className='gridbox'>
                <h1 className='centerObject'>Online Poker</h1>

                <button
                    onClick={() =>
                        navigate('/create')
                    }
                    className='centerObject btn-margin btn btn-secondary'
                >
                    Create New Game
                </button>
                <button
                    onClick={() =>
                        navigate('/games')
                    }
                    className='centerObject btn-margin btn btn-secondary'
                >
                    View Games
                </button>
            </div>
        </div>
    )
}

export default OnlinePoker;