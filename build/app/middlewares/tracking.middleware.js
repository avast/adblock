import TrackingManager from "../utils/TrackingManager";
import * as PopupActions from "../actions/popup.actions";
import * as OptionsActions from "../actions/options.actions";
import * as MainActions from "../actions/main.actions";

const TRACKING_ACTIONS_FILTER = {
    page: [
        PopupActions.POPUP_SHOWN,
        OptionsActions.OPTIONS_SHOWN,
        OptionsActions.STRICT_MODAL_SHOWN,
    ],
    click: [
        PopupActions.GO_TO_OPTIONS_REQUEST,
        PopupActions.ADD_SITE_TO_WHITELIST_REQUEST,
        PopupActions.PAUSE_ALL_REQUEST,
        PopupActions.PAUSE_ON_SITE_REQUEST,
        PopupActions.PAUSE_ON_SITE_REQUEST,
        PopupActions.UNPAUSE_ALL_REQUEST,
        PopupActions.UNPAUSE_ON_SITE_REQUEST,
        PopupActions.REMOVE_SITE_FROM_WHITELIST_REQUEST,
        MainActions.SET_MODE,
        OptionsActions.KEEP_MODE_REQUEST
    ]
};

const TrackingMiddleware = store => next => action => {
    if (TRACKING_ACTIONS_FILTER.page.indexOf(action.type) >= 0) {
        TrackingManager.registerShown(action.pageName);
    } else if ((TRACKING_ACTIONS_FILTER.click.indexOf(action.type) >= 0) && action.eventAction) {
        TrackingManager.registerClick(action);
    } else if (action.type === MainActions.SET_PAGE_NAME) {
        TrackingManager.setPageName(action.pageName);
    }

    return next(action);
};

export default TrackingMiddleware;
