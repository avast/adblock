import * as Actions from "../actions/tabs.actions";

const tabIconUpdateRequest = ({tab, icons}) => ({type: Actions.TAB_ICON_UPDATE_REQUEST, tab, icons}),
    setBadgeTextRequest = ({tab, text}) => ({type: Actions.SET_BADGE_TEXT_REQUEST, tab, text}),
    setBadgeTitleRequest = ({tab, title}) => ({type: Actions.SET_BADGE_TITLE_REQUEST, tab, title}),
    tabActivated = ({tabId}) => ({type: Actions.TAB_ACTIVATED, tabId}),
    tabRemoved = ({tabId}) => ({type: Actions.TAB_REMOVED, tabId});

export {tabIconUpdateRequest, tabActivated, setBadgeTextRequest, setBadgeTitleRequest, tabRemoved};
