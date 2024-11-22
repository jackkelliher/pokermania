import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { TextEncoder, TextDecoder } from 'util';
import CreateGamePage from '../components/create-game.js';
import * as router from 'react-router'
import { CreateGame } from '../components/datastore.js';

const navigate = jest.fn()

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
        CreateGame: jest.fn()
    }
})

it('Tests a user can create a game', async () => {

    const { getByText } = render(<CreateGamePage />);

    const create_input = screen.getByRole('create-game-input');
    const button = getByText('Create New Game');
    act(() => {
        userEvent.type(create_input, "New Poker Game")
    });
    expect(screen.getByText('Create New Game', { selector: 'button' }));

    fireEvent.click(button);
    expect(CreateGame).toHaveBeenCalled();
    expect(CreateGame).toHaveBeenCalledWith('New Poker Game', 'testuser');

});