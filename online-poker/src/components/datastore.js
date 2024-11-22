import { auth, db } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { get } from "firebase/database";
import { setDoc, doc, collection, deleteDoc, getDoc, getDocs, onSnapshot, addDoc, getCountFromServer, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

//Gets database updates when new games are added
const listenForGames = (callback) => {
    const gameSnapshot = onSnapshot(collection(db, 'games'), (querySnapshot) => {

        callback(querySnapshot.docs);
    })
}

//Called when authenication has changed (e.g. user signed in etc)
const listenForAuthChange = (auth, callback) => {
    const authSnapshot = onAuthStateChanged(auth, (user) => {
        if (user) {
            callback(user.uid);
        } else {
            callback(null);
        }
    })

    return authSnapshot
}

const listenForUsers = (groupName, callback) => {
    const userSnapshot = onSnapshot(collection(db, "games", groupName, 'users'), (uSnapshot) => {
        callback(uSnapshot.docs);
    })
}

//Signs in an anonymous user
const SignIn = async () => {
    try {
        const result = await signInAnonymously(auth);
        return ("Success");
    } catch (e) {
        return (HandleError(e.code));
    }
}

const HandleError = async (error) => {
    console.log(error);
    return ("An error occured ", error)
}

//Group game functions 

//Creates a new game
const CreateGame = async (groupName, uID) => {

    const gameRef = doc(db, 'games', groupName);
    const userRef = doc(db, "games", groupName, "users", uID);

    try {
        await setDoc(gameRef, {
            owner: uID,
            name: groupName,
            running: 0,
            users_ready: 0,
            users: [uID],
            winner: [],
        });

        await setDoc(userRef, {
            uID: uID,
            role: "owner",
        });
    } catch (e) {
        return HandleError(e);;
    }

    return "Success"
}

//Handles a user joining a game
const JoinGame = async (groupName, uID) => {
    try {
        const userRef = doc(db, "games", groupName, "users", uID);
        const groupRef = doc(db, 'games', groupName);

        const users = await getDoc(groupRef);

        const userArray = users.data().users;
        userArray.push(uID);

        console.log(userArray);

        try {
            await updateDoc(groupRef, {
                users: userArray,
            });
            await setDoc(userRef, {
                uID: uID,
                role: "guest",
            });
        } catch (error) {
            return HandleError(error);
        }
    } catch (e) {
        console.log(e);

        return HandleError(e);
    }

    return "Success";
}

const EndGame = async (groupName) => {
    try {
        const gameRef = doc(db, 'games', groupName);

        //Getting data of user IDs to fully delete the game
        const data = await getDoc(gameRef);
        const userArr = data.data().users;
        for (const user of userArr) {
            const userDoc = doc(db, 'games', groupName, 'users', user);
            await deleteDoc(userDoc);
        }

        await deleteDoc(gameRef);
    } catch (e) {
        return HandleError(e.code);
    }
}

//Leaves a game a user is associated with
const LeaveGame = async (groupName, uID) => {
    try {
        const gameRef = doc(db, "games", groupName, 'users', uID);
        const userDoc = await getDoc(doc(db, "games", groupName, 'users', uID));
        const role = userDoc.data().role;
        if (role == 'owner') {
            EndGame(groupName)
        } else {
            await deleteDoc(gameRef);
        }

    } catch (e) {
        return HandleError(e.code);
    }
}

//Handles the number of users currently in a game
const handleUserNumbers = async (groups, uID) => {
    const tempArr = [];

    //Loops through each group and stores the number of current users into the array
    for (let i = 0; i < groups.length; i++) {
        const name = groups[i].name;

        const userExistance = doc(db, 'games', name, 'users', uID);

        let existance = false;
        let owner = false;
        let running = false;

        try {
            const result = await getDoc(userExistance);
            if (result.data()) {
                existance = true;

                if (result.data().role == 'owner') {
                    owner = true;
                }

            }

        } catch (e) {
            HandleError(e);
            return e;
        }

        const groupRef = doc(db, 'games', name);
        const userCol = collection(db, "games", name, "users");
        try {
            const userCount = await getCountFromServer(userCol);
            const group = await getDoc(groupRef);
            if (group.data().running == 0) {
                running = false;
            } else {
                running = true;
            }
            tempArr.push([name, userCount.data().count, existance, owner, running]);
        } catch (e) {
            return HandleError(e);
        }
    }
    return tempArr
}

const getUserRole = async (gameName, user) => {
    try {
        console.log(gameName, user);
        const userRef = doc(db, 'games', gameName, 'users', user);
        const userData = await getDoc(userRef);
        if (userData.data() != undefined && userData.data().role != undefined) {
            return (userData.data().role);
        } else {
            return ('No user data');
        }
    } catch (e) {
        return HandleError(e);
    }
}

//Returns all current active games 
const ViewGames = async () => {
    try {
        const gamesRef = collection(db, 'games');

        const games = await getDocs(gamesRef);

        const gameIDs = games.docs.map((doc) => (doc.data().name));

        return games;
    } catch (e) {
        return HandleError(e);
    }
}

//Gets user numbers
const GetUserCount = async (groupName) => {
    const users = doc(db, "groups", groupName);
    const userDocs = await getDoc(users);
    return userDocs;
}

const Navigate = (page) => {
    const navigate = useNavigate();
    navigate(page);
}

//Game Logic
const BeginGame = async (groupName) => {
    const gameRef = doc(db, 'games', groupName)

    const gameData = await getDoc(gameRef);
    try {
        await updateDoc(gameRef, {
            running: 1,
        })
    } catch (e) {
        return HandleError(e);
    }
}

const HandleRunning = async (groupName) => {
    const groupRef = doc(db, 'games', groupName);
    try {
        await getDoc(groupRef)
    } catch (e) {
        return HandleError(e);
    }
}



export { HandleError, BeginGame, SignIn, listenForAuthChange, CreateGame, EndGame, LeaveGame, ViewGames, listenForGames, Navigate, JoinGame, listenForUsers, GetUserCount, handleUserNumbers, getUserRole }