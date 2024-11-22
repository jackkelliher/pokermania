import { TailSpin } from 'react-loader-spinner';

const Spinner = () => {

    return (
        <div id='Spinner-div' data-testid="spinner">
            <TailSpin color="red" radius={"3px"} />
        </div>
    )
}

export default Spinner;