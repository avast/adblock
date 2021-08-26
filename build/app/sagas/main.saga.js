import {takeEvery} from 'redux-saga/effects'
import * as PopupActions from "../actions/popup.actions";
import * as OptionsActions from "../actions/options.actions";
import * as MainActions from "../actions/main.actions";
import {call, put, takeLatest, throttle} from "@redux-saga/core/effects";
import AdBlockManager from "../utils/AdBlockManager";
import TabsManager from "../utils/TabsManager";
import StoreManager from "../utils/StoreManager";

function* pauseAll() {
    AdBlockManager.pauseAll();
    TabsManager.setOffIcon();
    yield put({type: MainActions.PAUSED_ALL});
}

function* unpauseAll() {
    AdBlockManager.unpauseAll();
    TabsManager.setDefaultIcon();
    yield put({type: MainActions.UNPAUSED_ALL});
}

function* pauseOnSite() {
    const activeTab = yield call(TabsManager.getActiveTab), domain = AdBlockManager.urlToDomain(activeTab.url);
    AdBlockManager.pauseOnSite(domain)
    TabsManager.setOffIcon();
    yield put({type: MainActions.PAUSED_ON_SITE, domain});
}

function* unpauseOnSite() {
    const activeTab = yield call(TabsManager.getActiveTab), domain = AdBlockManager.urlToDomain(activeTab.url);
    AdBlockManager.unpauseOnSite(domain);
    TabsManager.setDefaultIcon();
    yield put({type: MainActions.UNPAUSED_ON_SITE, domain: domain});
}

function* unpauseOnSiteFromDomain(action) {
    AdBlockManager.unpauseOnSite(action.domain);
    yield put({type: MainActions.UNPAUSED_ON_SITE, domain: action.domain});
}

function* addSiteToWhitelist() {
    const activeTab = yield call(TabsManager.getActiveTab);
    AdBlockManager.addSiteToWhitelist(activeTab);
    yield put({type: MainActions.DOMAIN_ADDED_TO_WHITELIST, domain: AdBlockManager.urlToDomain(activeTab.url)});
}

function* addSiteToWhitelistFromUrl(action) {
    AdBlockManager.addDomainToWhitelist(action.url);
    yield put({type: MainActions.DOMAIN_ADDED_TO_WHITELIST, domain: action.url});
}

function* removeSiteFromWhitelist() {
    const activeTab = yield call(TabsManager.getActiveTab);
    AdBlockManager.removeSiteFromWhitelist(activeTab);
    yield put({type: MainActions.DOMAIN_REMOVED_FROM_WHITELIST, domain: AdBlockManager.urlToDomain(activeTab.url)});
}

function* removeSiteFromWhitelistFromUrl(action) {
    AdBlockManager.removeDomainFromWhitelist(action.url);
    yield put({type: MainActions.DOMAIN_REMOVED_FROM_WHITELIST, domain: action.url});
}

function* editSiteToWhitelistFromUrl(action) {
    AdBlockManager.editFromWhitelist(action.url, action.originalUrl);
    yield put({type: MainActions.DOMAIN_EDITED_FROM_WHITELIST, domain: action.url, url: action.originalUrl});
}

function* toggleShowBadge() {
    const showIconBadge = AdBlockManager.toggleShowBadge();
    yield put({type: MainActions.SHOW_BADGE_REQUEST_TOGGLED, showIconBadge});
}

function* updateData() {
    TabsManager.updateData();
}

function* saveInLocalStorage() {
    AdBlockManager.updateHeartbeat();
    AdBlockManager.saveSettings();
}

function* setMode(action) {
    yield call(AdBlockManager.notifySPC, action.blockingMode);
    yield call(action.blockingMode === "off" ? TabsManager.setOffIcon : TabsManager.setDefaultIcon);
    if (action.blockingMode !== "off" && (StoreManager.state.main.settings.previousBlockingModeIsOff)) AdBlockManager.unpauseAll();
    yield put({type: MainActions.UPDATE_FILTERS, blockingMode: action.blockingMode});
}

function* updateFilters(action) {
    yield call(AdBlockManager.updateFilters, action.blockingMode);
    yield call(AdBlockManager.asyncUpdateModeHeartbeat);
}

function* onSettingsRestored() {
    yield call(AdBlockManager.onSettingsRestored);
}

function* popupSaga() {
    yield takeEvery(PopupActions.PAUSE_ALL_REQUEST, pauseAll);
    yield takeEvery(PopupActions.UNPAUSE_ALL_REQUEST, unpauseAll);
    yield takeEvery(PopupActions.PAUSE_ON_SITE_REQUEST, pauseOnSite);
    yield takeEvery(PopupActions.UNPAUSE_ON_SITE_REQUEST, unpauseOnSite);
    yield takeEvery(MainActions.UNPAUSE_ON_SITE_REQUEST, unpauseOnSiteFromDomain);
    yield takeEvery(PopupActions.ADD_SITE_TO_WHITELIST_REQUEST, addSiteToWhitelist);
    yield takeEvery(OptionsActions.ADD_SITE_TO_WHITELIST_REQUEST_FROM_URL, addSiteToWhitelistFromUrl);
    yield takeEvery(PopupActions.REMOVE_SITE_FROM_WHITELIST_REQUEST, removeSiteFromWhitelist);
    yield takeEvery(OptionsActions.REMOVE_SITE_FROM_WHITELIST_REQUEST_FROM_URL, removeSiteFromWhitelistFromUrl);
    yield takeEvery(OptionsActions.EDIT_SITE_FROM_WHITELIST_REQUEST_FROM_URL, editSiteToWhitelistFromUrl);
    yield takeEvery(OptionsActions.TOGGLE_SHOW_BADGE_REQUEST, toggleShowBadge);
    yield takeLatest(MainActions.SET_MODE, setMode);
    yield takeLatest(MainActions.SETTINGS_RESTORED, onSettingsRestored);
    yield throttle(15000, MainActions.UPDATE_FILTERS, updateFilters);
    yield takeEvery([
        MainActions.PAUSED_ALL,
        MainActions.UNPAUSED_ALL,
        MainActions.PAUSED_ON_SITE,
        MainActions.UNPAUSED_ON_SITE,
        MainActions.DOMAIN_ADDED_TO_WHITELIST,
        MainActions.DOMAIN_REMOVED_FROM_WHITELIST,
        MainActions.DOMAIN_EDITED_FROM_WHITELIST,
        MainActions.SHOW_BADGE_REQUEST_TOGGLED,
        MainActions.SET_MODE
    ], updateData);
    yield takeEvery([
        MainActions.PAUSED_ALL,
        MainActions.UNPAUSED_ALL,
        MainActions.SET_MODE,
        MainActions.SHOW_BADGE_REQUEST_TOGGLED,
        MainActions.UPDATE_FILTERS,
        MainActions.DOMAIN_ADDED_TO_WHITELIST,
        MainActions.DOMAIN_REMOVED_FROM_WHITELIST,
        MainActions.DOMAIN_EDITED_FROM_WHITELIST
    ], saveInLocalStorage);
}

export default popupSaga;
