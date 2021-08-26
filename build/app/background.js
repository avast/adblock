import {wrapStore} from 'webext-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga'
import popup from './reducers/popup.reducer';
import main from './reducers/main.reducer';
import tab from './reducers/tab.reducer';
import TabsManager from "./utils/TabsManager";
import LogMiddleWare from "./middlewares/log.middleware";
import rootSaga from "./sagas/saga";
import AdBlockManager from "./utils/AdBlockManager";
import UblockExtra from "../extra/js/ublock-extra";
import TrackingMiddleware from "./middlewares/tracking.middleware";

function run() {
    UblockExtra.run();
    wrapStore(store);
    sagaMiddleware.run(rootSaga);
    AdBlockManager.init();
    TabsManager.init();
    console.log("Running in background...");
}

const sagaMiddleware = createSagaMiddleware(),
    middleware = [sagaMiddleware, LogMiddleWare, TrackingMiddleware],
    store = createStore(
        combineReducers({main, popup, tab}),
        applyMiddleware(...middleware)
    );

run();

export default store;
