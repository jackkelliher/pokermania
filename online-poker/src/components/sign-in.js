import { useState } from "react"
import { useAuth } from "./authprovider";
import { SetUserName, SignIn } from "./datastore";
import Spinner from "./spinner";


const Login = () => {
    const [error, setError] = useState('');
    const [waiting, setWaiting] = useState(false);

    const uAuth = useAuth();

    const handleLogin = async () => {
        setWaiting(true);
        const result = await SignIn();
        setWaiting(false);
        if (result != 'Success') {
            setError(error);
        }
    }

    if (!uAuth.waiting) {
        return (
            <div>
                {!waiting
                    ?
                    <div id='signin'>
                        <h1>Jack's Online Poker</h1>
                        <button
                            onClick={() => handleLogin()}>
                            Enter
                        </button>
                        <p>{error}</p>
                    </div>
                    :
                    <div className="center-object">
                        <Spinner />
                        <small className="d-block text-body-secondary"> Logging In </small>
                    </div>
                }
            </div>
        )
    } else {
        return (
            <div className="center-object">
                <Spinner />
            </div>)
    }
}

export default Login;