import tabsSaga from "./tabs.saga";
import mainSaga from "./main.saga";
import {all} from "@redux-saga/core/effects";

export default function* rootSaga() {
    yield all([
        mainSaga(),
        tabsSaga()
    ]);
};
