import store from "../background";

export default class StoreManager {
    static get state() {
        return store.getState();
    }

    static get dispatch() {
        return store.dispatch;
    }
}
