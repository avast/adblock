import StoreManager from "../utils/StoreManager";

const LogMiddleWare = store => next => action => {
    logChange('dispatching', action);
    const result = next(action);
    logChange('next state', StoreManager.state);
    return result;
};

function logChange(stateInfo, values) {
    if (process.env.DEV) console.log(stateInfo, values);
}

export default LogMiddleWare;
