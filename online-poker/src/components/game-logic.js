import { addDoc, doc, getDoc, setDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { HandleError } from "./datastore";
import { db } from "../firebase";

//Gets database updates when new games are added
const listenForCards = (groupName, uID, callback) => {
    const gameSnapshot = onSnapshot(doc(db, 'games', groupName, 'users', uID), (querySnapshot) => {
        if (querySnapshot.data() != undefined) {
            callback(querySnapshot.data().cards);
        }

    })
}

const isGameRunning = (groupName, callback) => {
    const running = onSnapshot(doc(db, 'games', groupName), (querySnapshot) => {
        if (querySnapshot.data() != undefined && querySnapshot.data() != undefined) {
            callback(querySnapshot.data().running);
        } else {
            console.log("empty");
        }
    })
}

const listenToSwapNum = (groupName, uID, callback) => {
    const nums = onSnapshot(doc(db, 'games', groupName, 'users', uID), (querySnapshot) => {
        if (querySnapshot.data() != undefined && querySnapshot.data().swapped != undefined) {
            callback(querySnapshot.data().swapped);
        } else {
            console.log('empty');
        }
    })
}

const listenToUserReadys = (groupName, callback) => {
    const userReadys = onSnapshot(doc(db, 'games', groupName), (querySnapshot) => {
        if (querySnapshot.data() != undefined && querySnapshot.data().users_ready != undefined) {
            console.log("Users Ready: ", querySnapshot.data().users_ready);
            callback(querySnapshot.data().users_ready);
        }
    })
}

const listenForWinner = (groupName, callback) => {
    const winnerSelected = onSnapshot(doc(db, 'games', groupName), (querySnapshot) => {
        if (querySnapshot.data() != undefined && querySnapshot.data().winner != undefined) {
            callback(querySnapshot.data().winner);
        }
    })
}

const DealCards = async (gameID) => {

    const gameCol = doc(db, 'games', gameID);

    const gameRef = await getDoc(gameCol);
    const users = gameRef.data().users;

    const possibleCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]
    for (let i = 0; i < users.length; i++) {
        const hand = GetCards(5)

        const userRef = doc(db, 'games', gameID, 'users', users[i]);
        const userData = await getDoc(userRef);

        const role = userData.data().role;
        const uID = userData.data().uID;

        try {
            const result = await setDoc(userRef, {
                role: role,
                uID: uID,
                cards: hand,
                swapped: 0,
            })
        } catch (error) {
            const errMsg = HandleError(error);

            return errMsg;
        }


    }

    return 'Success';
}

const GetCards = (amount) => {
    const possibleCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]
    const hand = [];
    for (let i = 0; i < amount; i++) {
        let int = Math.floor(Math.random() * possibleCards.length);
        const card = possibleCards[int];
        hand.push(card);
        possibleCards.slice(int);
    }
    return hand;
}

//Swaps a chosen card with a new one
const SwapCard = async (card, uID, gameName) => {
    const cardRef = doc(db, 'games', gameName, 'users', uID);
    try {
        const cardsDocs = await getDoc(cardRef);
        const cards = cardsDocs.data().cards;
        const index = cards.indexOf(card);
        const newCard = GetCards(1);
        cards.splice(index, 1, newCard[0]);

        //Data to add back into the user doc
        const role = cardsDocs.data().role;
        const userID = cardsDocs.data().uID;
        const swapNum = cardsDocs.data().swapped;
        console.log("Role: ", role, " uID: ", userID);
        await setDoc(cardRef, {
            role: role,
            uID: userID,
            cards: cards,
            swapped: swapNum + 1,
        })
    } catch (error) {
        return HandleError(error);
    }
}

//Changes the count of ready users on the game document
const ReadyUser = async (gameName) => {
    const gameRef = doc(db, 'games', gameName);
    const gameData = await getDoc(gameRef);
    const readyNum = gameData.data().users_ready;
    try {
        await updateDoc(gameRef, {
            users_ready: readyNum + 1,
        })
    } catch (error) {
        return HandleError(error);
    }
}

const AllUsersReady = async (userNum, readyNum) => {
    console.log('uNum: ', userNum, 'rCount: ', readyNum);
    if (userNum == readyNum) {
        console.log(true);
        return true;
    } else {
        console.log(false);
        return false;
    }
}

//Scoring round
const ScoreRound = async (gameName) => {
    let roundData = [];
    const gameRef = doc(db, 'games', gameName);
    const gameData = await getDoc(gameRef);
    const users = gameData.data().users;
    //Getting card data from firestore
    for (let i = 0; i < users.length; i++) {
        const userRef = doc(db, 'games', gameName, 'users', users[i]);
        const userData = await getDoc(userRef);
        if (userData.data() != undefined && userData.data().cards != undefined) {
            const cards = userData.data().cards;
            roundData.push([users[i], cards])
        } else {
            return HandleError("No user data exists");

        }
    }

    let tempArr = [];

    for (let i = 0; i < roundData.length; i++) {
        let modArr = [];
        const user = roundData[i][0];
        const userCards = roundData[i][1];
        userCards.sort();
        console.log(userCards);
        let winningHand = 0;
        let bestScore = '0';

        //Mod all cards to change them to 0 - 12 in order to find pairs etc
        for (let i = 0; i < userCards.length; i++) {
            let int = userCards[i] % 13
            if (int == 0) {
                int = 13
            }
            modArr.push(int);
        }

        //High Card counts as a 0

        //Pair
        let tempInt = 55; //Setting to 55 as a starting int in order for the for statement to pick up that this is the first card in the series
        let pair = false; //false by default, if any pair is found it is changed to true
        for (let i = 0; i < modArr.length; i++) {
            if (tempInt == 55) {
                tempInt = modArr[i]
            } else if (tempInt == modArr[i]) {
                pair = true;
                winningHand = 1;
            }


        }

        //Two Pair

        tempInt = 55;
        let tempPair = [55, 55] //Stores the last pair if one is found
        let twoPair = false;
        for (let i = 0; i < modArr.length; i++) {
            if (tempInt == 55) {
                tempInt = modArr[i];
            } else {
                if (tempInt == modArr[i]) {
                    //If a temp pair does not exist
                    if (tempPair[0] != 55 && tempPair[1] != 55) {
                        tempPair = [tempInt, modArr[i]];
                    } else {
                        twoPair = true;
                        winningHand = 2;
                    }
                }
                tempInt = modArr[i];
            }

        }

        //Three of a kind
        tempInt = 55; //Setting to 55 as a starting int in order for the for statement to pick up that this is the first card in the series
        let tempInt2 = 55;
        let threePair = false; //false by default, if any pair is found it is changed to true
        for (let i = 0; i < modArr.length; i++) {
            if (tempInt == 55) {
                tempInt = modArr[i]
            } else if (tempInt == modArr[i]) {
                if (tempInt2 == 55) {
                    tempInt2 = modArr[i];
                } else if (tempInt2 == modArr[i]) {
                    threePair = true;
                    winningHand = 3;
                }
            }

        }

        //Straight
        let straight = true; //switches to false as soon as the cards break the straight
        tempInt = 55;
        for (let i = 0; i < modArr.length; i++) {
            if (tempInt == 55) {
                tempInt = modArr[i];
            } else if (tempInt + 1 != modArr[i]) {
                straight = false;
            }

        }

        if (straight) {
            winningHand = 4;
        }

        //Flush
        let flush = true; //Switches to false as soon as the cards break the flush
        tempInt = 55; //In this case is used to record what group a card is in and then compare it to the tempgroup var
        let tempGroup = 5; //Only 4 groups, the 5 sigifies that a group has not been chosen yet 
        for (let i = 0; i < userCards.length; i++) {
            if (userCards[i] < 14) {
                tempInt = 1;
            } else if (userCards[i] > 13 && userCards[i] < 27) {
                tempInt = 2;
            } else if (userCards[i] > 26 && userCards[i] < 40) {
                tempInt = 3;
            } else {
                tempInt = 4;
            }

            //Comparing to the tempGroup to see if they do not match
            if (tempGroup == 5) {
                tempGroup = tempInt;
            } else if (tempGroup != tempInt) {
                flush = false;
            }

        }

        if (flush) {
            winningHand = 5;
        }

        //Full House
        let fullHouse = false;
        if (twoPair && threePair) {
            fullHouse = true;
            winningHand = 6;
        }

        //Four of a kind
        tempInt = 55; //Setting to 55 as a starting int in order for the for statement to pick up that this is the first card in the series
        tempInt2 = 55;
        let tempInt3 = 55;
        let fourPair = false; //false by default, if any pair is found it is changed to true
        for (let i = 0; i < modArr.length; i++) {
            if (tempInt == 55) {
                tempInt = modArr[i]
            } else if (tempInt == modArr[i]) {
                if (tempInt2 == 55) {
                    tempInt2 = modArr[i];
                } else if (tempInt2 == modArr[i]) {
                    if (tempInt3 == 55) {
                        tempInt3 = modArr[i];
                    } else if (tempInt3 == modArr[i]) {
                        fourPair = true;
                        winningHand = 7;
                    }
                }
            }

        }

        //Straight flush
        tempInt = 55; //Resetting tempInt
        let straightFlush = true; //Converts to false as soon as the cards fail the test
        for (let i = 0; i < userCards.length; i++) {
            if (tempInt == 55) {
                tempInt = userCards[i];
            } else {
                if ((tempInt + 1) != userCards[i]) {
                    straightFlush = false;
                }
            }

        }
        if (straightFlush) {
            winningHand = 8;
        }

        //Royal Flush

        let royalFlush = false;
        if (flush) {

            if (modArr[0] == 10) {
                royalFlush = true;
                winningHand = 9;
            }
        }

        tempArr.push([user, winningHand, userCards]);
    }

    //Values higher than there would be players
    let tempWinHand = 0;
    let tempWinner = 100;
    let winner = 100;
    for (let i = 0; i < tempArr.length; i++) {
        if (tempWinner == 100) {
            tempWinner = i;
            tempWinHand = tempArr[i][1];
        } else {
            if (tempArr[i][1] < tempWinHand) {
                tempWinner = i;
                tempWinHand = tempArr[i][0];
            }
        }

    }

    console.log(tempWinHand);
    let winType = '';
    switch (tempWinHand) {
        case 0:
            winType = 'High Card'
            break;
        case 1:
            winType = 'Pair';
            break;
        case 2:
            winType = "Two Pair"
            break;
        case 3:
            winType = 'Three Pair';
            break;
        case 4:
            winType = 'Straight';
            break;
        case 5:
            winType = 'Flush';
            break;
        case 6:
            winType = 'Full House';
            break;
        case 7:
            winType = 'Four Pair';
            break;
        case 8:
            winType = 'Straight Flush';
            break;
        case 9:
            winType = 'Royal Flush';
            break;
        default:
            winType = 'Ga';
            break;
    }

    console.log(tempWinner);
    console.log(winType);
    console.log(tempArr);
    const winnerArr = [tempArr[tempWinner][0], winType];

    console.log(winnerArr);

    try {
        await updateDoc(gameRef, {
            winner: winnerArr,
        })
    } catch (e) {
        return HandleError(e);
    }
}

//Creates a full sentance about what the card is (e.g. King of Spades, 4 of Diamonds)
const GetCardInfo = (card) => {
    let suit = '';

    //Determining the suit
    if (card < 14) {
        suit = 'Clubs'
    } else if (card < 27) {
        suit = 'Diamonds'
    } else if (card < 40) {
        suit = 'Hearts';
    } else {
        suit = 'Spades';
    }

    const num = card % 13

    let cardName = '';

    //Determining the picture cards
    switch (num) {
        case 0:
            cardName = 'King'
            break;
        case 1:
            cardName = 'Ace'
            break;
        case 11:
            cardName = 'Jack'
            break;
        case 12:
            cardName = 'Queen'
            break;

        default:
            cardName = num;
            break;
    }

    return (cardName + ' of ' + suit);
}



export { DealCards, listenForCards, isGameRunning, GetCardInfo, SwapCard, listenToSwapNum, listenToUserReadys, AllUsersReady, ReadyUser, ScoreRound, listenForWinner }