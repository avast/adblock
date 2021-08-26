import {updatePopupData} from "../creators/popup.creator";
import {store} from "../app";
import TabsManager from "./TabsManager";

let popupData = {};

const getPopupData = async function (id = null) {
    let tabId = id,
        response = await vAPI.messaging.send('popupPanel', {what: 'getPopupData', tabId: tabId});

    response.netFilteringSwitchExtra = await vAPI.messaging.send('popupExtraPanel', {
        what: 'getPopupDataExtra',
        tabId: tabId,
        response: response
    });
    store.dispatch(updatePopupData({
        popupData: {
            ...cachePopupData(response),
            isInternal: TabsManager.isInternalUrl(response.rawURL)
        }
    }));
    pollForContentChange();

    return void (0);
};

const pollForContentChange = (function () {
    let pollTimer = null;

    let pollCallback = async function () {
        pollTimer = null;
        const response = await vAPI.messaging.send('popupPanel', {
            what: 'hasPopupContentChanged',
            tabId: popupData.tabId,
            contentLastModified: popupData.contentLastModified,
        });
        queryCallback(response);
    };

    let queryCallback = function (response) {
        if (response) {
            getPopupData(popupData.tabId);
            return;
        }
        poll();
    };

    let poll = function () {
        if (pollTimer !== null) {
            return;
        }
        pollTimer = vAPI.setTimeout(pollCallback, 1500);
    };

    return poll;
})();

function cachePopupData(data) {
    popupData = {};
    let scopeToSrcHostnameMap = {
        '/': '*',
        '.': ''
    };
    let hostnameToSortableTokenMap = {};

    if (typeof data !== 'object') {
        return popupData;
    }
    popupData = data;
    scopeToSrcHostnameMap['.'] = popupData.pageHostname || '';
    let hostnameDict = popupData.hostnameDict;
    if (typeof hostnameDict !== 'object') {
        return popupData;
    }
    let domain, prefix;
    for (let hostname in hostnameDict) {
        if (hostnameDict.hasOwnProperty(hostname) === false) {
            continue;
        }
        domain = hostnameDict[hostname].domain;
        prefix = hostname.slice(0, 0 - domain.length);
        // Prefix with space char for 1st-party hostnames: this ensure these
        // will come first in list.
        if (domain === popupData.pageDomain) {
            domain = '\u0020';
        }
        hostnameToSortableTokenMap[hostname] = domain + prefix.split('.').reverse().join('.');
    }
    return popupData;
}

export {getPopupData};
