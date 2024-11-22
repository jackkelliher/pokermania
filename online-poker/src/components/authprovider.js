import { useContext, createContext, useState, useEffect } from "react";
import { listenForAuthChange, UserCollection } from "./datastore";
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { auth } from "../firebase";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState("");
    const [waiting, setWaiting] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        return listenForAuthChange(auth, (uID) => {
            console.log("Waiting");
            setWaiting(true);
            setUser(uID);
            console.log(uID);
            console.log("Navigating");
            navigate('/');
            setWaiting(false);
        });
    }, [auth]
    );

    return (
        <AuthContext.Provider value={{ user, waiting, setWaiting }}>
            {children}
        </AuthContext.Provider>
    );
}

const PrivateRoute = () => {
    const userData = useAuth();
    if (!userData.user) {
        return <Navigate to="/login" />;
    } else if (!userData.waiting) {
        console.log("outlet");
        return <Outlet />
    }
}

export const useAuth = () => {
    //console.log(useContext(AuthContext));
    return useContext(AuthContext);
}

export { AuthProvider, PrivateRoute };