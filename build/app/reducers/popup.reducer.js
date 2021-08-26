import initialState from "./initial-state";
import * as PopupActions from "../actions/popup.actions";
import * as TabActions from "../actions/tabs.actions";
import {pickBy} from "lodash";

export default (state = initialState.popup, action) => {
    switch (action.type) {
        case PopupActions.UPDATE_POPUP_DATA: {
            return {
                ...state,
                ...action.popupData,
                tabs: {
                    ...state.tabs,
                    [action.popupData.tabId]: {
                        ...action.popupData
                    }
                }
            };
        }
        case TabActions.TAB_REMOVED: {
            return {
                ...state,
                tabs: pickBy(Object.assign({}, state.tabs), function (value, key) {
                    return parseInt(key) !== action.tabId;
                })
            };
        }
        default:
            return state;
    }
};
