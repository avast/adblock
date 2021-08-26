import * as Actions from "../actions/options.actions";
import * as MainActions from "../actions/main.actions";
import TrackingConfig from "../utils/TrackingConfig";

const addSiteToWhitelistFromUrlRequest = ({url}) => ({type: Actions.ADD_SITE_TO_WHITELIST_REQUEST_FROM_URL, url}),
    removeSiteToWhitelistFromUrlRequest = ({url}) => ({type: Actions.REMOVE_SITE_FROM_WHITELIST_REQUEST_FROM_URL, url}),
    editSiteFromWhitelistRequest = ({url, originalUrl}) => ({
        type: Actions.EDIT_SITE_FROM_WHITELIST_REQUEST_FROM_URL,
        url,
        originalUrl
    }),
    toggleShowBadgeRequest = () => ({type: Actions.TOGGLE_SHOW_BADGE_REQUEST}),
    optionsShown = () => ({type: Actions.OPTIONS_SHOWN, pageName: TrackingConfig.PageNames.OPTIONS}),
    strictModalShown = () => ({type: Actions.STRICT_MODAL_SHOWN, pageName: TrackingConfig.PageNames.STRICT_MODAL}),
    setModeOptionsRequest = ({blockingMode}) => ({
        type: MainActions.SET_MODE,
        blockingMode,
        eventAction: blockingMode,
        pageName: TrackingConfig.PageNames.OPTIONS
    }),
    turnOnOffRequest = ({blockingMode}) => ({
        type: MainActions.SET_MODE,
        blockingMode,
        eventAction: blockingMode === "off" ? blockingMode : "on",
        pageName: TrackingConfig.PageNames.OPTIONS
    }),
    setStrictOptionsRequest = () => ({
        type: MainActions.SET_MODE,
        blockingMode: "strict",
        eventAction: "set-strict",
        pageName: TrackingConfig.PageNames.STRICT_MODAL
    }),
    keepModeRequest = ({blockingMode}) => ({
        type: Actions.KEEP_MODE_REQUEST,
        eventAction: `keep-${blockingMode}`,
        pageName: TrackingConfig.PageNames.STRICT_MODAL
    });

export {
    addSiteToWhitelistFromUrlRequest,
    removeSiteToWhitelistFromUrlRequest,
    editSiteFromWhitelistRequest,
    toggleShowBadgeRequest,
    optionsShown,
    strictModalShown,
    setModeOptionsRequest,
    turnOnOffRequest,
    setStrictOptionsRequest,
    keepModeRequest
};
