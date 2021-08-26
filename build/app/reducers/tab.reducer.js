import initialState from "./initial-state";
import * as Actions from "../actions/tabs.actions";

export default (state = initialState.tabs, action) => {
    switch (action.type) {
        case Actions.TAB_ACTIVATED: {
            return {
                ...state,
                active: action.tabId,
            };
        }
        default:
            return state;
    }
};
