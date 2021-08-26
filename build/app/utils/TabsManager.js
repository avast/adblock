import {getExtensionId, isDarkMode} from "./BrowserUtils";
import * as TabsActions from "../creators/tabs.creators";
import * as PopupActions from "../creators/popup.creator";
import AdBlockManager from "./AdBlockManager";
import StoreManager from "./StoreManager";

const DEFAULT_ICON_PATH = "img/browsericons/",
    IconsPath = {
        normal: {
            active: {...getIconsPath("icon_16.png", "icon_32.png")},
            off: {...getIconsPath("icon_16_off.png", "icon_32_off.png")}
        },
        dark: {
            active: {...getIconsPath("icon_16.png", "icon_32.png")},
            off: {...getIconsPath("icon_16_off_dark.png", "icon_32_off_dark.png")}
        }
    },
    SETTINGS_URL = `chrome-extension://${getExtensionId()}/extra/options.html`;

export default class TabsManager {
    static async init() {
        chrome.tabs.onUpdated.addListener(onTabUpdated);
        chrome.tabs.onActivated.addListener(this.updateData);
        chrome.tabs.onRemoved.addListener(onTabRemoved);
        chrome.webRequest.onSendHeaders.addListener(onSendHeaders, {urls: ["<all_urls>"]}, ["requestHeaders"]);
        this.updateData();
    }

    static async updateData() {
        updateData();
    }

    static async setDefaultIcon(tab) {
        const tabToBeUpdated = tab || await getActiveTab();

        tabIconUpdateRequest({
            tab: tabToBeUpdated,
            icons: IconsPath[isDarkMode() ? "dark" : "normal"][TabsManager.isInternalUrl(tabToBeUpdated.url) ? "off" : "active"] // Hack for after unpasuse on an internal tab
        });
    }

    static async setOffIcon(tab) {
        tabIconUpdateRequest({
            tab: tab || await getActiveTab(), icons: IconsPath[isDarkMode() ? "dark" : "normal"].off
        });
    }

    static setIcon(tab, icons) {
        return new Promise((resolve, reject) => {
            try {
                chrome.browserAction.setIcon({
                    path: icons,
                    tabId: tab.id
                }, function () {
                    resolve({
                        tab,
                        icons
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static getActiveTab() {
        return getActiveTab();
    }

    static goToOptions() {
        return goToUrl(SETTINGS_URL);
    }

    static goToLearnMore() {
        return goToUrl(AdBlockManager.getParameterizedUrl(process.env.CONFIG.faqUrl));
    }

    static updateIcon(tab, iconUpdate) {
        if (iconUpdate.icon !== false) iconUpdate.icon === "on" ? TabsManager.setDefaultIcon(tab) : TabsManager.setOffIcon();
        if (iconUpdate.text !== false) setBadgeTextRequest({tab, text: iconUpdate.text});
        if (iconUpdate.title !== false) setBadgeTitleRequest({tab, title: iconUpdate.title});
    }

    static setBadgeText(tabId, text) {
        return new Promise((resolve, reject) => chrome.browserAction.setBadgeText({tabId, text}, () => resolve()));
    }

    static setBadgeTitle(tabId, badge) {
        let title = `${chrome.runtime.getManifest().browser_action.default_title} (${badge})`;

        return new Promise((resolve, reject) => chrome.browserAction.setTitle({tabId, title}, () => resolve()));
    }

    static isInternalUrl(rawURL = "") {
        return new RegExp("^(chrome|secure|chrome-extension|behind-the-scene)://", "i").test(rawURL);
    }
}

function goToUrl(url) {
    return new Promise(async (resolve, reject) => {
        chrome.tabs.query({url}, (tabs) => {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, {'active': true}, () => resolve());
            } else {
                chrome.tabs.create({url}, () => resolve());
            }
        });
    });
}

function onTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status && changeInfo.status === "loading") TabsManager.setDefaultIcon(tab);
}

function getIconsPath(iconName16, iconName32) {
    return {
        16: buildIconPath(iconName16),
        32: buildIconPath(iconName32)
    }
}

function buildIconPath(iconName) {
    return `${DEFAULT_ICON_PATH}${iconName}`
}

function getActiveTab() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
                resolve(tabs.length ? tabs[0] : await getAnyActiveTab());
            });
        } catch (e) {
            reject(e);
        }
    });
}

function getAnyActiveTab() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({active: true}, async function (tabs) {
                resolve(tabs[0]);
            });
        } catch (e) {
            reject(e);
        }
    });
}

function getPopupData(tab) {
    return {
        ...AdBlockManager.getPopupData(tab.id),
        isInternal: TabsManager.isInternalUrl(tab.url || tab.pendingUrl),
        domainIsPaused: AdBlockManager.isPaused(tab.url),
        netFilteringSwitchExtra: AdBlockManager.getNetFilteringSwitchExtra(tab.url),
        whitelist: AdBlockManager.getWhitelist(),
        isInUserWhitelist: AdBlockManager.isInUserWhitelist(tab.url || tab.pendingUrl),
        tabId: tab.id,
        ublockUrl: AdBlockManager.getParameterizedUrl(process.env.CONFIG.ublockUrl),
        faqUrl: AdBlockManager.getParameterizedUrl(process.env.CONFIG.faqUrl),
    }
}

async function onSendHeaders(details) {
    const activeTab = await getActiveTab();

    if (activeTab?.id === details.tabId) updatePopupData(getPopupData(activeTab));
    return {cancel: false};
}

async function updateData() {
    const activeTab = await getActiveTab();

    tabActivated({tabId: activeTab.id});
    updatePopupData(getPopupData(activeTab));
}

const tabActivated = (activeInfo) => {
    StoreManager.dispatch(TabsActions.tabActivated({tabId: activeInfo.tabId}));
};

const onTabRemoved = (tabId) => {
    StoreManager.dispatch(TabsActions.tabRemoved({tabId}));
};

const tabIconUpdateRequest = ({tab, icons}) => {
    StoreManager.dispatch(TabsActions.tabIconUpdateRequest({tab, icons}));
};

const updatePopupData = (popupData) => {
    StoreManager.dispatch(PopupActions.updatePopupData({popupData}));
};

const setBadgeTextRequest = ({tab, text}) => {
    StoreManager.dispatch(TabsActions.setBadgeTextRequest({tab, text}));
};

const setBadgeTitleRequest = ({tab, title}) => {
    StoreManager.dispatch(TabsActions.setBadgeTitleRequest({tab, title}));
};
