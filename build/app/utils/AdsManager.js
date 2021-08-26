import StoreManager from "./StoreManager";
import * as Actions from "../creators/main.creator";

const RE_YAHOO = new RegExp(['yahoo\.com'].join('|'), 'i'),
    RE_YAHOO_ADS = new RegExp(['search\.yahoo\.com\/cbclk2'].join('|'), 'i'),
    ADS_TIMEOUT = 10000,
    TABS_ADS = {};

export default class AdsManager {
    /*
     * It is being executed to prevent some extra partner ads to be blocked.
     * Notes: unknowTab seems to be kinda Yahoo ping
    */
    static extraBeforeRequest(details) {
        const whiteListAfterRedirect = parseWhiteListAfterRedirect();

        if (isYahooAds(details)) watchTabsWithAds('unknowTab');

        if (details.type !== 'main_frame') return;

        if (tabHasAds('unknowTab')) {
            addToAdsWhitelist(details);
            return details;
        }

        whiteListAfterRedirect.forEach((afterRedirectRegex) => {
            if (afterRedirectRegex.test(details.url)) watchTabsWithAds(details.tabId);
        });

        //Add last hostname to whitelist
        if (tabHasAds(details.tabId)) addToAdsWhitelist(details);

        return details;
    }

    static cleanTabsAds(tabId) {
        delete TABS_ADS[tabId];
    }
}

function getHostName(url) {
    let targetHost = µBlock.URI.hostnameFromURI(url);
    targetHost = targetHost.split('.').slice(-2).join('.');

    return targetHost;
}

function addToAdsWhitelist(details) {
    let newEntry = [getHostName(details.url)];

    if (details.responseHeaders) {
        for (let i in details.responseHeaders) {
            let header = details.responseHeaders[i];

            if (header.name === 'location') {
                newEntry.push(getHostName(header.value));
                break;
            }
        }
    }

    addEntryToAdsWhitelist({tabId: details.tabId, entry: newEntry})
}

function tabHasAds(tabId) {
    if (!TABS_ADS[tabId]) TABS_ADS[tabId] = {ads: false};

    return TABS_ADS[tabId].ads;
}

function watchTabsWithAds(tabId) {
    if (!TABS_ADS[tabId]) TABS_ADS[tabId] = {ads: false};

    TABS_ADS[tabId].ads = true;

    if (TABS_ADS[tabId].timeout) clearTimeout(TABS_ADS[tabId].timeout);
    TABS_ADS[tabId].timeout = setTimeout((tabId) => delete TABS_ADS[tabId], ADS_TIMEOUT, tabId);
}

function isYahooAds(details) {
    return RE_YAHOO.test(details.initiator) && RE_YAHOO_ADS.test(details.url) && details.type === 'ping';
}

function parseWhiteListAfterRedirect() {
    const result = [];

    for (let line of StoreManager.state.main.whitelistAfterRedirect.split('\n')) {
        if (line.trim() !== '') result.push(new RegExp(line.trim(), 'i'));
    }

    return result;
}

const addEntryToAdsWhitelist = ({tabId, entry}) => {
    StoreManager.dispatch(Actions.addEntryToAdsWhitelist({tabId, entry}));
};
