import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { TextEncoder, TextDecoder } from 'util';
import CreateGamePage from '../components/create-game.js';
import * as router from 'react-router'
import { JoinGame } from '../components/datastore.js';
import GamesPage from '../components/games-page.js';
import GameItem from '../components/game-item.js';

const navigate = jest.fn()

const mockData = new Object(
    {
        item:
        {
            item: () => {
                return ("Game 1", 1, true, false, false)
            }
        }
    }
)

beforeEach(() => {
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate)
})

jest.mock('../components/authprovider', () => {
    return {
        useAuth: () => {
            //console.log(useContext(AuthContext));
            return { user: 'testuser' };
        }
    }
})

//Object.assign(global, { TextDecoder, TextEncoder });

jest.mock('../components/datastore', () => {
    return {
        JoinGame: jest.fn(),
        listenForGames: (callback) => {
            callback(mockGames);
        },

        handleUserNumbers: (id, user) => {
            return ([['Game 1', 1, true, false, false]]);
        }
    }
})

it('Tests a user can join a game', async () => {

    const { getByText } = render(<GameItem item={mockData} />);

    const button = screen.getByText('Join Game', { selector: 'button' });

    await fireEvent.click(button);

    await expect(JoinGame).toHaveBeenCalled();
    expect(JoinGame).toHaveBeenCalledWith('Game1', 'testuser');

});