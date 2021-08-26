import initialState from "./initial-state";
import * as Actions from "../actions/main.actions";
import {pickBy} from "lodash";

export default (state = initialState.main, action) => {
    switch (action.type) {
        case Actions.PAUSED_ALL: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    paused: true
                }
            };
        }
        case Actions.UNPAUSED_ALL: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    paused: false
                }
            };
        }
        case Actions.UNPAUSED_ON_SITE: {
            return {
                ...state,
                pausedDomains: [
                    ...state.pausedDomains.slice(0, state.pausedDomains.indexOf(action.domain)),
                    ...state.pausedDomains.slice(state.pausedDomains.indexOf(action.domain) + 1),
                ]
            }
        }
        case Actions.PAUSED_ON_SITE: {
            return {
                ...state,
                pausedDomains: [...state.pausedDomains, action.domain],
            };
        }
        case Actions.CLEAN_TAB_ADS_WHITELIST: {
            return {
                ...state,
                adsWhitelist: pickBy(Object.assign({}, state.adsWhitelist), function (value, key) {
                    return parseInt(key) !== action.tabId;
                })
            };
        }
        case Actions.ADD_ENTRY_TO_TAB_ADS_WHITELIST: {
            return {
                ...state,
                adsWhitelist: {
                    ...state.adsWhitelist,
                    [action.tabId]: action.entry
                }
            };
        }
        case Actions.UPDATE_INTERNAL_WHITELIST: {
            return {
                ...state,
                [action.name]: action.whitelist
            };
        }
        case Actions.SET_MODE: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    previousBlockingModeIsOff: state.settings.off,
                    paused: action.blockingMode === "off",
                    off: action.blockingMode === "off",
                    blockingMode: action.blockingMode !== "off" ? action.blockingMode : state.settings.blockingMode
                }
            };
        }
        case Actions.SHOW_BADGE_REQUEST_TOGGLED: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    showIconBadge: action.showIconBadge
                }
            };
        }
        case Actions.SETTINGS_RESTORED: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.settings,
                    paused: false
                }
            };
        }
        default:
            return state;
    }
};
