const SETTINGS_LOCAL_STORAGE_KEY = "__ADBLOCK_SETTINGS__";

export default class StorageManager {
    static getStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, (result) => {
                if (typeof result === "object" && result[key]) {
                    resolve(result[key]);
                } else {
                    resolve(null);
                }
            });
        });
    };

    static setStorage(key, data) {
        return new Promise((resolve, reject) => {
            const object = {
                [key]: data
            };

            chrome.storage.local.set(object, function () {
                chrome.runtime.lastError ? reject() : resolve();
            });
        });
    }

    static getLocalSettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(SETTINGS_LOCAL_STORAGE_KEY, (result) => {
                if (result[SETTINGS_LOCAL_STORAGE_KEY]) {
                    removeLocalSettingsFromNonSyncStorage();
                    resolve(result[SETTINGS_LOCAL_STORAGE_KEY]);
                } else {
                    resolve(StorageManager.getStorage(SETTINGS_LOCAL_STORAGE_KEY));
                }
            });
        });
    }

    static setLocalSettings(settings) {
        return new Promise((resolve, reject) => {
            const object = {
                [SETTINGS_LOCAL_STORAGE_KEY]: settings
            };

            chrome.storage.sync.set(object, function () {
                chrome.runtime.lastError ? reject() : resolve();
            });
        });
    }
}

function removeLocalSettingsFromNonSyncStorage() {
    chrome.storage.local.remove(SETTINGS_LOCAL_STORAGE_KEY, function () {
        if (chrome.runtime.lastError) console.log("Error:", chrome.runtime.lastError);
    });
}
