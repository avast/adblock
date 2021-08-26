import {takeEvery} from 'redux-saga/effects'
import * as TabsActions from "../actions/tabs.actions";
import * as PopupActions from "../actions/popup.actions";
import * as OptionsActions from "../actions/options.actions";
import TabsManager from "../utils/TabsManager";
import {call, put} from "@redux-saga/core/effects";
import AdBlockManager from "../utils/AdBlockManager";
import AdsManager from "../utils/AdsManager";

function* onTabLoading(action) {
    const {tab, icons} = yield call(TabsManager.setIcon, action.tab, action.icons);
    yield put({type: TabsActions.TAB_ICON_UPDATED, tab, icons});
}

function* goToOptions() {
    yield call(TabsManager.goToOptions);
}

function* goToLearnMore() {
    yield call(TabsManager.goToLearnMore);
}

function* setBadgeText(action) {
    yield call(TabsManager.setBadgeText, action.tab.id, action.text);
    yield put({type: TabsActions.BADGE_TEXT_SET, tab: action.tab, text: action.text})
}

function* setBadgeTitle(action) {
    yield call(TabsManager.setBadgeTitle, action.tab.id, action.title);
    yield put({type: TabsActions.BADGE_TITLE_SET, tab: action.tab, text: action.title})
}

function* cleanTabAdsWhitelist(action) {
    AdBlockManager.cleanTabAdsWhitelist(action.tabId);
    AdsManager.cleanTabsAds(action.tabId);
}

function* tabsSaga() {
    yield takeEvery(TabsActions.TAB_ICON_UPDATE_REQUEST, onTabLoading);
    yield takeEvery(PopupActions.GO_TO_OPTIONS_REQUEST, goToOptions);
    yield takeEvery(OptionsActions.GO_TO_LEARN_MORE_REQUEST, goToLearnMore);
    yield takeEvery(TabsActions.SET_BADGE_TEXT_REQUEST, setBadgeText);
    yield takeEvery(TabsActions.SET_BADGE_TITLE_REQUEST, setBadgeTitle);
    yield takeEvery(TabsActions.TAB_REMOVED, cleanTabAdsWhitelist);
}

export default tabsSaga;
