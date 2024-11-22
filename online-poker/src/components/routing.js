import OnlinePoker from "./online-poker";
import GamesPage from "./games-page";
import CreateGamePage from "./create-game";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./sign-in";
import { PrivateRoute, AuthProvider } from "./authprovider";
import Lobby from './lobby';
import Game from "./game";

//Handles routing
const Routing = () => {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<OnlinePoker />}>
              <Route index element={<OnlinePoker />} />
            </Route>
            <Route path='/games' element={<GamesPage />}>
              <Route index element={<GamesPage />} />
            </Route>
            <Route path='/create' element={<CreateGamePage />}>
              <Route index element={<CreateGamePage />} />
            </Route>
            <Route path='/lobby' element={<Lobby />}>
              <Route index element={<Lobby />} />
            </Route>
            <Route path='/game' element={<Game />}>
              <Route index element={<Game />} />
            </Route>
          </Route>
          <Route path='/login' element={<Login />}>
            <Route index element={<Login />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Routing;