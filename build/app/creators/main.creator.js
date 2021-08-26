import * as Actions from "../actions/main.actions";

const unPauseOnSiteRequest = ({domain}) => ({type: Actions.UNPAUSE_ON_SITE_REQUEST, domain}),
    addEntryToAdsWhitelist = ({tabId, entry}) => ({type: Actions.ADD_ENTRY_TO_TAB_ADS_WHITELIST, tabId, entry}),
    cleanTabAdsWhitelist = ({tabId}) => ({type: Actions.CLEAN_TAB_ADS_WHITELIST, tabId}),
    updateInternalWhitelist = ({name, whitelist, serverUrl}) => ({
        type: Actions.UPDATE_INTERNAL_WHITELIST,
        name,
        whitelist,
        serverUrl
    }),
    settingsRestored = ({settings}) => ({type: Actions.SETTINGS_RESTORED, settings}),
    setMode = ({blockingMode}) => ({type: Actions.SET_MODE, blockingMode}),
    setPageName = ({pageName}) => ({type: Actions.SET_PAGE_NAME, pageName});

export {
    unPauseOnSiteRequest,
    cleanTabAdsWhitelist,
    addEntryToAdsWhitelist,
    updateInternalWhitelist,
    settingsRestored,
    setMode,
    setPageName
};
