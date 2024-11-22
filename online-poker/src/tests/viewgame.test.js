
import { screen, fireEvent, render, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GamesPage from '../components/games-page';
import * as router from 'react-router'
import { act } from 'react';

const navigate = jest.fn()

beforeEach(() => {
    jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate)
})

const mockGames = new Object([
    {
        id: '1',
        data: () => {
            return {
                name: 'Game 1',

            }
        }
    },
    {
        id: '2',
        data: () => {
            return { name: 'Game 2' }
        }
    }
]);

jest.mock('../components/datastore', () => {
    return {
        listenForGames: (callback) => {
            callback(mockGames);
        },

        handleUserNumbers: (id, user) => {
            return ([['Game 1', 1, true, true, false], ['Game 2', 1, true, true, false]]);
        }
    }
})

jest.mock('../components/authprovider', () => {
    return {
        useAuth: () => {
            //console.log(useContext(AuthContext));
            return { user: 'testuser' };
        }
    }
})


it('tests loading games from storage and displaying', async () => {

    const { getByText } = render(<GamesPage />);

    await waitForElementToBeRemoved(screen.getByTestId('spinner')).then(() =>
        console.log('Element no longer in DOM'),
    )
    await expect(screen.getAllByText("View Game", { selector: 'button' }));
    await expect(screen.getByText('Game 1'));
    await expect(screen.getByText('Game 2'));
})