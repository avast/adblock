import * as PopupActions from "../actions/popup.actions";
import * as MainActions from "../actions/main.actions";

const updatePopupData = ({popupData}) => ({type: PopupActions.UPDATE_POPUP_DATA, popupData}),
    goToOptionsRequestHeader = () => ({type: PopupActions.GO_TO_OPTIONS_REQUEST, eventAction: "settings"}),
    goToOptionsRequestFooter = () => ({type: PopupActions.GO_TO_OPTIONS_REQUEST, eventAction: "status"}),
    addSiteToWhitelistRequest = () => ({type: PopupActions.ADD_SITE_TO_WHITELIST_REQUEST, eventAction: "allow-site"}),
    removeSiteFromWhitelistRequest = () => ({
        type: PopupActions.REMOVE_SITE_FROM_WHITELIST_REQUEST,
        eventAction: "block-site"
    }),
    pauseAllRequest = () => ({type: PopupActions.PAUSE_ALL_REQUEST, eventAction: "pause-all"}),
    pauseOnSiteRequest = () => ({type: PopupActions.PAUSE_ON_SITE_REQUEST, eventAction: "pause-site"}),
    turnOnRequest = ({blockingMode}) => ({type: MainActions.SET_MODE, blockingMode, eventAction: "turn-on"}),
    unpauseAllRequest = () => ({type: PopupActions.UNPAUSE_ALL_REQUEST, eventAction: "unpause-all"}),
    unpauseOnSiteRequest = () => ({type: PopupActions.UNPAUSE_ON_SITE_REQUEST, eventAction: "unpause-site"}),
    popupShown = ({pageName}) => ({type: PopupActions.POPUP_SHOWN, pageName});

export {
    updatePopupData,
    goToOptionsRequestHeader,
    goToOptionsRequestFooter,
    addSiteToWhitelistRequest,
    removeSiteFromWhitelistRequest,
    pauseAllRequest,
    pauseOnSiteRequest,
    turnOnRequest,
    unpauseAllRequest,
    unpauseOnSiteRequest,
    popupShown
};
