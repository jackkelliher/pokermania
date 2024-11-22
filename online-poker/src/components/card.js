import { useState, useEffect } from "react";
import { GetCardInfo, SwapCard, listenToSwapNum } from "./game-logic";
import { useAuth } from "./authprovider";


const Card = (data) => {
    const [waiting, setWaiting] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const dataArr = data.data;
    const displayCard = dataArr[0];
    const game = dataArr[1];
    console.log(game);

    const fullSuit = GetCardInfo(displayCard);

    const uAuth = useAuth();
    const user = uAuth.user;

    return (
        <section>
            {fullSuit}
        </section>
    )
}

export default Card;