export default class MessagesManager {
    static get(message) {
        return chrome.i18n.getMessage(message);
    }
}
