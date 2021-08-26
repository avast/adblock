import * as Actions from "../creators/main.creator";
import StoreManager from "./StoreManager";
import StorageManager from "./StorageManager";
import TabsManager from "./TabsManager";
import AdsManager from "./AdsManager";

const Config = {
    DEFAULT_BADGE_BACKGROUND_COLOR: [0x77, 0x77, 0x77, 0xFF],
    CONTEXT_MENU_ENABLED: process.env.CONFIG.contextMenu,
    BRAND_PREFIX: process.env.BRAND,
    Installation_Info: {
        campaignId: "1000",
        hostPrefix: "",
        host: `ext-update.${process.env.BRAND}browser.com`,
        eHost: `extension.${process.env.BRAND}browser.com`,
    },
    Whitelists: {
        defaultInternalWhitelist: {
            name: "defaultInternalWhitelist",
            url: process.env.CONFIG.whitelistUrl,
            defaultValue: process.env.CONFIG.whitelistDefault
        },
        whitelistAfterRedirect: {
            name: "whitelistAfterRedirect",
            url: process.env.CONFIG.whitelistAfterRedirectUrl,
            defaultValue: process.env.CONFIG.whitelistAfterRedirect
        },
        essentialWhitelist: {
            name: "essentialWhitelist",
            url: process.env.CONFIG.essentialWhitelistUrl,
            defaultValue: process.env.CONFIG.essentialWhitelist
        },
    },
    WHITELIST_TIMEOUT_LOCAL_STORAGE_KEY: "__WHITELIST_TIMEOUT__",
    HEARTBEAT_LOCAL_STORAGE_KEY: "AdBlockData",
    WHITELIST_TIMEOUT: 60 * 60 * 24 * 1000
}, Modes = {
    "off": 0,
    "essential": 1,
    "balanced": 2,
    "strict": 3
}, ORIGINAL_CALLERS = {
    normalizeDetails: vAPI.net.normalizeDetails,
    getNetFilteringSwitch: µBlock.getNetFilteringSwitch,
    fetchFilterList: µBlock.assets.fetchFilterList,
    fetchText: µBlock.assets.fetchText,
    fetch: µBlock.assets.fetch,
};

export default class AdBlockManager {
    static async init() {
        override(); //
        Config.Installation_Info = {...Config.Installation_Info, ...await getInstallationInfo()};
        Config.WHITELIST_TIMEOUT = (await StorageManager.getStorage(Config.WHITELIST_TIMEOUT_LOCAL_STORAGE_KEY)) || Config.WHITELIST_TIMEOUT;
        µBlock.assetsBootstrapLocation = replaceUrl(process.env.CONFIG.assetsUrl);
        await loadInternalWhitelists();
        setDefaultBadgeBackgroundColor();
        restoreSettingsFromLocalStorage();
        override();
        AdBlockManager.updateHeartbeat();
        setInterval(loadInternalWhitelists, Config.WHITELIST_TIMEOUT);
    }

    static onSettingsRestored() {
        onBrowserCall();
        onExternalCall();
        chrome.avast.browserCall('spc', 'ready', {});
    }

    static pauseAll() {
        µBlock.toggleFirewallRule(getFirewallRule(false));
        µBlock.saveWhitelist();
    }

    static unpauseAll() {
        const pausedDomains = StoreManager.state.main.pausedDomains;

        for (let i = 0; i < pausedDomains.length; i++) {
            unPauseOnSiteRequest({domain: pausedDomains[i]});
        }

        µBlock.toggleFirewallRule(getFirewallRule(true)); // It removes the * hostname global rule
        µBlock.saveWhitelist();
    }

    static isPaused(url) {
        return µBlock.sessionFirewall.evaluateCellZY(url ? AdBlockManager.urlToDomain(url) : "*", "*", '*') === 2;
    }

    static isOff() {
        return StoreManager.state.main.settings.off;
    }

    static getParameterizedUrl(url) {
        return replaceUrl(url);
    }

    /*
    * returns
    * 0 when is a regular domain
    * 1 when is whitelisted internally
    * 2 when is whitelisted by the temporal ads whitelist (yahoo and partners)
     */
    static getNetFilteringSwitchExtra(url) {
        let originalNetWhitelist = µBlock.netWhitelist, allowedInAdsTempWhitelist = true, allowedInWhitelist;

        // Populate it with the internal whitelist
        µBlock.netWhitelist = µBlock.whitelistFromString(StoreManager.state.main.defaultInternalWhitelist + '\n');
        allowedInWhitelist = µBlock.getNetFilteringSwitch(url);

        if (allowedInWhitelist) {
            // Populate it with ads temporal whitelist
            µBlock.netWhitelist = µBlock.whitelistFromString(adsWhiteListToString());
            allowedInAdsTempWhitelist = µBlock.getNetFilteringSwitch(url);
        }

        // Restore original whitelist
        µBlock.netWhitelist = originalNetWhitelist;

        return !allowedInWhitelist ? 1 : !allowedInAdsTempWhitelist ? 2 : 0;
    }

    static pauseOnSite(domain) {
        µBlock.toggleFirewallRule(getFirewallRule(false, domain));
        µBlock.saveWhitelist();
    }

    static unpauseOnSite(domain) {
        µBlock.toggleFirewallRule(getFirewallRule(true, domain));
        µBlock.saveWhitelist();
    }

    static addSiteToWhitelist(tab) {
        toggleNetFilteringSwitch(tab, false);
    }

    static addDomainToWhitelist(domain) {
        µBlock.netWhitelist = µBlock.whitelistFromString([...AdBlockManager.getWhitelist(), domain].join('\r\n'));
        µBlock.saveWhitelist();
    }

    static removeDomainFromWhitelist(domain) {
        µBlock.netWhitelist = µBlock.whitelistFromString(AdBlockManager.getWhitelist().filter(url => url !== domain).join('\r\n'));
        µBlock.saveWhitelist();
    }

    static editFromWhitelist(url, originalUrl) {
        AdBlockManager.removeDomainFromWhitelist(originalUrl);
        AdBlockManager.addDomainToWhitelist(url);
    }

    static removeSiteFromWhitelist(tab) {
        toggleNetFilteringSwitch(tab, true);
    }

    static urlToDomain(url) {
        return µBlock.URI.hostnameFromURI(url);
    }

    static getPopupData(tabId) {
        return µBlock.v2.popupDataFromTabId(tabId);
    }

    static siteIsWhitelisted(url) {
        return µBlock.netWhitelist.has(AdBlockManager.urlToDomain(url)) || µBlock.netWhitelist.has(url);
    }

    static cleanTabAdsWhitelist(tabId) {
        if (StoreManager.state.main.adsWhitelist[tabId]) cleanTabAdsWhitelist(tabId);
    }

    static getWhitelist() {
        return µBlock.arrayFromWhitelist(µBlock.netWhitelist);
    }

    static toggleShowBadge() {
        µBlock.userSettings.showIconBadge = !µBlock.userSettings.showIconBadge;
        µBlock.saveUserSettings();
        return µBlock.userSettings.showIconBadge;
    }

    static saveSettings() {
        return StorageManager.setLocalSettings({
            ...StoreManager.state.main.settings,
            whitelist: AdBlockManager.getWhitelist() // Hack for keeping the whitelist on sync
        });
    }

    static async updateHeartbeat(extraData = {}) {
        const currentData = await StorageManager.getStorage(Config.HEARTBEAT_LOCAL_STORAGE_KEY),
            currentTime = new Date().getTime(),
            defaultData = {
                b1: AdBlockManager.getCurrentModeCode(),
                c1: currentTime,
                c2: currentTime,
                c3: currentTime
            };

        return StorageManager.setStorage(Config.HEARTBEAT_LOCAL_STORAGE_KEY, {...defaultData, ...currentData, ...extraData});
    }

    static getCurrentModeCode() {
        const currentSettings = StoreManager.state.main.settings;

        return currentSettings.off ? Modes.off : Modes[currentSettings.blockingMode];
    }

    static asyncUpdateModeHeartbeat() {
        AdBlockManager.updateHeartbeat({b1: AdBlockManager.getCurrentModeCode()});
    }

    static updateFilters(blockingMode) {
        const acceptableFilterName = "acceptable",
            minimumFilters = ["assets.json", "easylist", "internal-filter", "ublock-filters"],
            currentFilters = [...new Set([...µBlock.selectedFilterLists, ...minimumFilters])],
            newFilters = blockingMode === "essential" ? [...currentFilters, acceptableFilterName] : currentFilters.filter(name => name !== acceptableFilterName);

        return new Promise((resolve, reject) => {
            reloadFilters(newFilters).then(() => {
                µBlock.saveWhitelist(); // It forces AdBlock to reevaluate the requests
                console.log("FILTERS_UPDATED:", blockingMode);
                resolve(true);
            });
        });
    }

    static notifySPC(blockingMode = "off") {
        chrome.avast.browserCall('spc', 'state', {'mode': Modes[blockingMode]});
    }

    static isInUserWhitelist(url) {
        return !ORIGINAL_CALLERS.getNetFilteringSwitch.call(µBlock, url);
    }
}

function onBrowserCall() {
    chrome.avast.onExtensionCall.addListener(function (sender, method, request) {
        const currentState = getBrowserState();

        if (method === "setState") {
            setMode(Object.keys(Modes).find(key => Modes[key] === request.mode) || currentState);
        } else if (method === "getState") {
            AdBlockManager.notifySPC(currentState);
        } else if (method === "showOptions") {
            TabsManager.goToOptions();
        }
    });
}

function onExternalCall() {
    chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
        const currentState = getBrowserState();

        if (request.method === "setState") {
            setMode(Object.keys(Modes).find(key => Modes[key] === request.mode) || currentState);
        } else if (request.method === "getState") {
            sendResponse(Modes[currentState]);
        } else if (request.method === "getStats") {
            sendResponse({blockedAdsCount: µBlock.localSettings.blockedRequestCount});
        } else if (request.method === "showOptions") {
            TabsManager.goToOptions();
        }
    });
}

function getBrowserState() {
    return StoreManager.state.main.settings.off ? "off" : StoreManager.state.main.settings.blockingMode;
}

/*
* From µBlock internal Implementation
* parts: bit 0 = icon
*        bit 1 = badge text
*        bit 2 = badge color
*        bit 3 = hide badge
 */
async function updateIcon(tabId, details) {
    const tab = await vAPI.tabs.get(typeof tabId === 'number' && isNaN(tabId) === false ? tabId : 0);

    if (tab === null) return;

    let {badge, parts, state} = details;

    // It keeps the badge after adding a site to  the whitelist
    if (AdBlockManager.siteIsWhitelisted(tab.url)) {
        let pageBlockedRequestCount = AdBlockManager.getPopupData(tab.id).pageBlockedRequestCount;
        if (pageBlockedRequestCount !== 0) badge = pageBlockedRequestCount.toString();
    }

    const iconUpdate = {
        icon: iconEnabled(parts) ? isOffIcon(tab.url) ? "off" : "on" : false,
        text: badgeEnabled(parts) ? hideBadgeDisabled(details.parts) ? badge : '' : false,
        title: state === 1 ? (badge !== '' ? badge : '0') : 'off'
    };

    TabsManager.updateIcon(tab, iconUpdate);

    if (vAPI.contextMenu instanceof Object) vAPI.contextMenu.onMustUpdate(tabId);
}

function isOffIcon(url) {
    return AdBlockManager.isOff()
        || AdBlockManager.isPaused(url)
        || AdBlockManager.siteIsWhitelisted(url)
        || (StoreManager.state.main.settings.blockingMode !== "strict" && AdBlockManager.getNetFilteringSwitchExtra(url))
        || TabsManager.isInternalUrl(url);
}

async function loadInternalWhitelists() {
    const promises = [];

    for (let key in Config.Whitelists) {
        promises.push(loadWhitelist(Config.Whitelists[key]));
    }

    const result = await Promise.all(promises);

    for (let i = 0; i < result.length; i++) {
        updateWhitelist(result[i]);
        µBlock.netWhitelistModifyTime = Date.now();
    }

    return result;
}

function loadWhitelist(whitelist) {
    return new Promise((resolve, reject) => {
        vAPI.storage.get({[whitelist.name]: {content: whitelist.defaultValue, touch: 0}}).then(async (fetched) => {
                let result = {whitelist: fetched[whitelist.name].content, serverUrl: "localStorage", name: whitelist.name},
                    fetchUrl = replaceUrl(whitelist.url);

                if (fetched[whitelist.name].touch < Date.now() - Config.WHITELIST_TIMEOUT) {
                    result = {
                        whitelist: (await µBlock.assets.fetchText(fetchUrl)).content,
                        serverUrl: fetchUrl,
                        name: whitelist.name
                    };
                    vAPI.storage.set({[whitelist.name]: {content: result.whitelist, touch: Date.now()}});
                }

                resolve(result);
            }
        )
    });
}

function setDefaultBadgeBackgroundColor() {
    chrome.browserAction.setBadgeBackgroundColor({color: Config.DEFAULT_BADGE_BACKGROUND_COLOR});
}

function iconEnabled(parts) {
    return parts === undefined || (parts & 0b0001) !== 0;
}

function badgeEnabled(parts) {
    return (parts & 0b0010) !== 0;
}

function hideBadgeDisabled(parts) {
    return (parts & 0b1000) === 0;
}

function toggleNetFilteringSwitch(tab, block) {
    const pageStore = µBlock.pageStoreFromTabId(tab.id);

    if (pageStore) {
        pageStore.toggleNetFilteringSwitch(tab.url, "", block);
        µBlock.updateToolbarIcon(tab.id, 0b111);
    }
}

function getFirewallRule(block, srcHostname = "*") {
    return {
        srcHostname,
        desHostname: "*",
        requestType: "*",
        action: block ? 0 : 2,
        persist: false,
    }
}

function adsWhiteListToString() {
    let adsWhitelist = StoreManager.state.main.adsWhitelist, adsWhitelistString = '\n';

    Object.keys(adsWhitelist).forEach((item) => {
        adsWhitelistString += adsWhitelist[item] + '\n';
    });

    return adsWhitelistString;
}

function getNetFilteringSwitch(url, originalCaller) {
    let currentNetWhitelist = µBlock.netWhitelist, result;

    if (StoreManager.state.main.settings.paused || AdBlockManager.isPaused(url) || StoreManager.state.main.settings.off) return false;

    // Append extra entries
    µBlock.netWhitelist = µBlock.whitelistFromString(
        µBlock.netWhitelistDefault + '\n' +
        (isStrictMode() ? [] : StoreManager.state.main.defaultInternalWhitelist) + '\n' +
        (isEssentialMode() ? StoreManager.state.main.essentialWhitelist : []) + '\n' +
        µBlock.stringFromWhitelist(µBlock.netWhitelist) + '\n' +
        adsWhiteListToString()
    );

    result = originalCaller.call(µBlock, url);
    µBlock.netWhitelist = currentNetWhitelist;

    return result;
}

function override() {
    µBlock.userSettings.contextMenuEnabled = Config.CONTEXT_MENU_ENABLED;
    µBlock.getNetFilteringSwitch = (url) => getNetFilteringSwitch(url, ORIGINAL_CALLERS.getNetFilteringSwitch);
    µBlock.assets.fetchFilterList = async (mainlistURL, onLoad, onError) => ORIGINAL_CALLERS.fetchFilterList.call(µBlock.assets, replaceUrl(mainlistURL, onLoad, onError));
    µBlock.assets.fetchFilterList.toParsedURL = ORIGINAL_CALLERS.fetchFilterList.toParsedURL
    µBlock.assets.fetchText = async (url, onLoad, onError) => ORIGINAL_CALLERS.fetchText.call(µBlock.assets, replaceUrl(replaceUrl(url), onLoad, onError));
    µBlock.assets.fetch = (url, options = {}) => {
        return new Promise((resolve, reject) => {
            ORIGINAL_CALLERS.fetch.call(µBlock.assets, url, options).then((details) => {
                if (/(http(s?)):\/\//i.test(details.url)) updateListHeartbeat(url);
                resolve(details);
            }).catch((details) => {
                reject(details);
            });
        });
    };
    vAPI.setIcon = ((tabId, details) => updateIcon(tabId, details));

    vAPI.net.normalizeDetails = (details) => {
        ORIGINAL_CALLERS.normalizeDetails.call(vAPI.Net, details);
        if (!isStrictMode()) AdsManager.extraBeforeRequest(details);
    }
}

function getInstallationInfo() {
    return new Promise((resolve, reject) => {
        chrome.avast.getPref('install_channel', (key, campaignId) => {
            chrome.avast.getHostPrefix((hostPrefix) => resolve({
                campaignId: campaignId || Config.Installation_Info.campaignId,
                hostPrefix
            }));
        });
    });
}

function replaceUrl(url) {
    return url
        .replace("%campaign_id%", Config.Installation_Info.campaignId)
        .replace("%host_prefix%", Config.Installation_Info.hostPrefix)
        .replace("%host%", Config.Installation_Info.host)
        .replace("%eHost%", Config.Installation_Info.eHost)
        .replace("%brand%", Config.BRAND_PREFIX);
}

function isStrictMode() {
    return StoreManager.state.main.settings.blockingMode === "strict";
}

function isEssentialMode() {
    return StoreManager.state.main.settings.blockingMode === "essential";
}

async function restoreSettingsFromLocalStorage() {
    const settings = await StorageManager.getLocalSettings();
    if (settings && settings.whitelist) restoreWhitelistFromSync(settings.whitelist);
    restoreSettings({settings: await StorageManager.getLocalSettings()});
}

const restoreSettings = ({settings}) => {
    StoreManager.dispatch(Actions.settingsRestored({settings}));
};

const unPauseOnSiteRequest = ({domain}) => {
    StoreManager.dispatch(Actions.unPauseOnSiteRequest({domain}));
};

const cleanTabAdsWhitelist = (tabId) => {
    StoreManager.dispatch(Actions.cleanTabAdsWhitelist({tabId}));
};

const updateWhitelist = ({name, whitelist, serverUrl}) => {
    StoreManager.dispatch(Actions.updateInternalWhitelist({name, whitelist, serverUrl}));
};

const setMode = (blockingMode) => {
    StoreManager.dispatch(Actions.setMode({blockingMode}));
};

function reloadFilters(filters) {
    µBlock.applyFilterListSelection({toSelect: filters, toImport: [], toRemove: []});
    return µBlock.loadFilterLists();
}

function updateListHeartbeat(url) {
    const keysToFilter = {
        whitelist: {
            filename: "whitelist.txt",
            key: "c1"
        },
        easylist: {
            filename: "easylist.txt",
            key: "c2"
        },
        acceptable: {
            filename: "exceptionrules.txt",
            key: "c3"
        }
    };

    for (let key in keysToFilter) {
        if (url.indexOf(keysToFilter[key].filename) >= 0) {
            AdBlockManager.updateHeartbeat({[keysToFilter[key].key]: new Date().getTime()});
            break;
        }
    }
}

function restoreWhitelistFromSync(whitelist) {
    if (!whitelist) return;

    for (let i = 0; i < whitelist.length; i++) {
        AdBlockManager.addDomainToWhitelist(whitelist[i]);
    }
}
