(function () {

    'use strict';

    let extra = {};
    µBlock.extra = extra;

    //contextMenu
    extra.contextMenu = 'true';
    if (extra.contextMenu == 'false') {
        µBlock.userSettings.contextMenuEnabled = false;
    }
    //contextMenu


    //default whitelist
    extra.defaultWhitelist = µBlock.netWhitelistDefault;
    µBlock.netWhitelistDefault = '';
    //default whitelist

    //whitelist
    extra.whitelist = '';
    extra.url = '';
    extra.saveWhitelist = function () {
        vAPI.storage.set(
            {
                'extraWhitelist': extra.whitelist,
                'extraWhitelistModifyTime': Date.now()
            }
        );
    };
    extra.getWhitelist = function () {
        vAPI.storage.get({
            'extraWhitelist': extra.whitelist,
            'extraWhitelistModifyTime': 0,
        }, function (fetched) {
            extra.whitelist = fetched.extraWhitelist;
            if (!extra.url) return;
            if (fetched.extraWhitelistModifyTime < Date.now() - 60 * 60 * 24 * 1000) {
                µBlock.assets.fetchText(extra.url, function (details) {
                    extra.whitelist = details.content;
                    extra.saveWhitelist();
                    extra.clearUserWhitelist();
                }, function () {});
            } else {
                extra.clearUserWhitelist();
            }
        });
    };
    extra.clearUserWhitelist = function () {
        vAPI.storage.get({
            'netWhitelist': '',
        }, function(fetched) {
            let current = µBlock.whitelistFromString(fetched.netWhitelist);

            if (!typeof current == 'undefined') return;
            if (Object.keys(current).length == 0) return;

            let extraWhitelist = µBlock.whitelistFromString(
                extra.defaultWhitelist + '\n' +
                extra.whitelist + '\n'
            );
            Object.keys(current).map(function(key) {
                current[key] = current[key].filter( function(el) {
                    if (!extraWhitelist[key]) return true;
                    return extraWhitelist[key].indexOf(el) < 0;
                } );
            });

            current = µBlock.stringFromWhitelist(current);

            vAPI.storage.set({
                'netWhitelist': current
            }, function () {
                if (µBlock.netWhitelistModifyTime > 0) {
                    µBlock.netWhitelist = µBlock.whitelistFromString(current);
                    µBlock.saveWhitelist();
                }
            });

        });
    };

    //whitelist

    //campaign_id
    extra.campaign_id = '1000'; // set default campaign ID
    extra.host_prefix = '';
    extra.fetchFilterList = µBlock.assets.fetchFilterList;
    µBlock.assets.fetchFilterList = function (mainlistURL, onLoad, onError) {
        mainlistURL = mainlistURL.replace('%campaign_id%', extra.campaign_id);
        mainlistURL = mainlistURL.replace('%host_prefix%', extra.host_prefix);
        extra.fetchFilterList.call(µBlock.assets, mainlistURL, onLoad, onError);
    };
    µBlock.assets.fetchFilterList.toParsedURL = extra.fetchFilterList.toParsedURL;

    extra.fetchText = µBlock.assets.fetchText;
    µBlock.assets.fetchText = function (url, onLoad, onError) {
        url = url.replace('%campaign_id%', extra.campaign_id);
        url = url.replace('%host_prefix%', extra.host_prefix);
        extra.fetchText.call(µBlock.assets, url, onLoad, onError);
    };
    try {
        chrome.avast.getPref('install_channel', function (key, install_channel) {
            if (install_channel) extra.campaign_id = install_channel;

            chrome.avast.getHostPrefix(function(host_prefix) {
                if (host_prefix) extra.host_prefix = host_prefix;

                extra.getWhitelist();
            });
        });

    } catch (e) {
        extra.getWhitelist();
        console.log (e);
    }
    //campaign_id

    //spc
    extra.mode = 1;
    extra.updateMode = function (mode) {
        extra.mode = mode;
        vAPI.storage.set({'extraMode': extra.mode});
        try {
            chrome.avast.browserCall('spc', 'state', {'mode': extra.mode});
        } catch (e) {
            console.log(e);
        }
        vAPI.messaging.broadcast({'what': 'extraUpdateMode', 'mode': extra.mode});
    };
    vAPI.storage.get({'extraMode': -1}, function (fetched) {
        //set default value
        if (fetched.extraMode == -1) {
            extra.updateMode(1)
        } else {
            extra.updateMode(fetched.extraMode);
        }
    });
    try {
        chrome.avast.onExtensionCall.addListener(function (sender, method, request) {
            if (sender.browserPartId && sender.browserPartId == 'spc') {
                switch (method) {
                    case 'setState':
                        extra.updateMode(request.mode);
                        break;
                    case 'showOptions':
                        chrome.tabs.create({url: chrome.runtime.getURL('options/index.html')});
                        break;
                }
            }
        });
    } catch (e) {
        console.log (e);
    }
    vAPI.messaging.listen('extraSetting', function (request, sender, callback) {
        switch (request.what) {
            case 'getMode':
                callback({'mode': extra.mode});
                break;
            case 'setMode':
                extra.updateMode(request.mode);
                callback(true);
                break;
            default:
                break;
        }
    });
    //spc

    //whitelistAds
    var tempWhitelist = {};
    let whitelistAds = parseInt('0');
    if (whitelistAds == 1) {

        let reAds = [
            //bing.com
            {
                url: new RegExp(['bing\.com\/aclick?', 'bing\.com\/aclk?'].join('|'), 'i')
            },
            //mysearch.com
            {
                url: new RegExp(['google\.com\/aclk'].join('|'), 'i')
            },
            //yahoo ads in new window
            {
                url: new RegExp(['search\.yahoo\.com\/cbclk2'].join('|'), 'i')
            },
            //ADM link
            {
                url: new RegExp(['avast_browser\.ampxdirect\.com'].join('|'), 'i')
            },
            //viglink
            {
                hostname: new RegExp(['redirect\.viglink\.com'].join('|'), 'i'),
                params: {
                    key: new RegExp(['adeb4e68644887c2bc4ebdff6d2f40a1', '9156956f961747f4c038ad32d8b63a7d'].join('|'), 'i')
                }
            }
        ];

        let reYahoo = new RegExp(['yahoo\.com'].join('|'), 'i');
        let reYahooAds = new RegExp(['search\.yahoo\.com\/cbclk2'].join('|'), 'i');

        //second-level domain
        let getHostName = function (url) {
            let targetHost = µBlock.URI.hostnameFromURI(url);
            targetHost = targetHost.split('.').slice(-2).join('.');

            return targetHost;
        };
        let setWhitelist = function (details) {
            let tabId = details.tabId;
            tempWhitelist[tabId] = [getHostName(details.url)];
            if (details.responseHeaders) {
                for (let i in details.responseHeaders) {
                    let header = details.responseHeaders[i];
                    if (header.name === 'location') {
                        tempWhitelist[tabId].push(getHostName(header.value));
                        break;
                    }
                }
            }
            return;
        };

        let adTabManager = {
            has: function(tabId) {
                let self = adTabManager;
                if (typeof self[tabId] == 'undefined') self[tabId] = {};

                return self[tabId].ads;
            },
            detect: function (tabId) {
                let self = adTabManager;
                if (typeof self[tabId] == 'undefined') self[tabId] = {};
                self[tabId].ads = true;
                if (self[tabId].timeout) clearTimeout(self[tabId].timeout);
                self[tabId].timeout = setTimeout(function(tabId){
                    delete self[tabId];
                }, 10 * 1000, tabId);
            }
        };
        chrome.tabs.onRemoved.addListener(function (tabId) {
            delete adTabManager[tabId];
            delete tempWhitelist[tabId];
        });


        var extraBeforeRequest = function (details) {
            // console.log('beforeNavigate' + ((details.statusLine) ? ' ' + details.statusLine : ''), details.url, details);
            //detect yahoo ads
            if (reYahoo.test(details.initiator) && reYahooAds.test(details.url) && details.type == 'beacon') {
                adTabManager.detect('unknowTab');
            };

            if (details.type !== 'main_frame') return;

            if (adTabManager.has('unknowTab')) {
                setWhitelist(details);
                return details;
            }

            let tabId = details.tabId;

            reAds.forEach(function(e) {

                if (e.url && !e.url.test(details.url)) return;

                if (e.hostname) {
                    let url = new URL(details.url);
                    if (!e.hostname.test(url.hostname)) return;
                }

                if (e.params) {
                    let url = new URL(details.url);
                    for(var key in e.params) {
                        if (!e.params[key].test(url.searchParams.get(key))) return;
                    }
                }

                adTabManager.detect(tabId);
            });


            //add last hostname to whitelist
            if (adTabManager.has(tabId)) {
                setWhitelist(details);
            }

            return details;
        };

        var normalizeDetails = vAPI.net.normalizeDetails;
        vAPI.net.normalizeDetails = function(details) {
            normalizeDetails.call(vAPI.net, details);
            extraBeforeRequest(details);
        };
    }
    //whitelistForAds


    //interstitial block
    µBlock.userSettings.extraInterstitialBlocking = false;
    var matchStringExactType = µBlock.staticNetFilteringEngine.matchStringExactType;
    µBlock.staticNetFilteringEngine.matchStringExactType = function(context, requestURL, requestType) {
        //don't block
        if (!µBlock.userSettings.extraInterstitialBlocking && requestType === 'main_frame') return 2;
        //call parent
        return matchStringExactType.call(µBlock.staticNetFilteringEngine, context, requestURL, requestType);
    };
    //interstitial block


    extra.oldGetNetFilteringSwitch = µBlock.getNetFilteringSwitch;

    var getNetFilteringSwitchExtra = function (url) {
        // Save current whitelist
        var current = µBlock.netWhitelist;
        var sessionWhitelist = true, extraWhitelist = true;
        // extra entries
        µBlock.netWhitelist = µBlock.whitelistFromString(extra.whitelist + '\n');
        extraWhitelist = extra.oldGetNetFilteringSwitch.call(µBlock, url);
        if (extraWhitelist) {
            µBlock.netWhitelist = µBlock.whitelistFromString(µBlock.stringFromWhitelist(tempWhitelist) + '\n');
            sessionWhitelist = extra.oldGetNetFilteringSwitch.call(µBlock, url);
        }
        // Restore original whitelist
        µBlock.netWhitelist = current;

        if (!extraWhitelist) return 1;
        if (!sessionWhitelist) return 2;
        return 0;
    }

    µBlock.getNetFilteringSwitch = function (url) {
        // Save current whitelist
        var current = this.netWhitelist;

        // Append extra entries
        this.netWhitelist = this.whitelistFromString(
            extra.defaultWhitelist + '\n' +
            extra.whitelist + '\n' +
            this.stringFromWhitelist(this.netWhitelist) + '\n' +
            this.stringFromWhitelist(tempWhitelist)
        );

        // Call original
        var result = extra.oldGetNetFilteringSwitch.call(µBlock, url);
        // Restore original whitelist
        this.netWhitelist = current;

        return result;
    };

    vAPI.messaging.listen('popupExtraPanel', function (request, sender, callback) {
        var response;

        switch (request.what) {
            case 'getPopupData':
                response = request.response;
                var res = getNetFilteringSwitchExtra(response.pageURL);
                if ( res == 0 && response.rawURL !== response.pageURL && response.rawURL !== '' ) {
                    res = getNetFilteringSwitchExtra(response.rawURL);
                }
                response.netFilteringSwitchExtra = res;
                callback(response);

                break;
            case 'getWhitelist':
                callback(µBlock.netWhitelist);

                break;
            case 'removeWhitelist':
                var key = request.key;
                var netWhitelist = µBlock.netWhitelist;
                if (netWhitelist[key] !== undefined) {
                    delete netWhitelist[key];
                }
                µBlock.saveWhitelist();
                response = true;

                callback(response);
                break;
            default:
                break;
        }
    });

    //set icon for incognito mode
    var icons = [
        {
            '19': 'img/browsericons/icon19-off-incognito.png',
            '38': 'img/browsericons/icon38-off-incognito.png'
        },
        {
            '19': 'img/browsericons/icon19-off.png',
            '38': 'img/browsericons/icon38-off.png'
        }
    ];
    var setDefaultIcon = function (tab) {
        chrome.browserAction.setIcon({
            path: icons[(tab.incognito === true) ? 0 : 1]
        });
    };
    var toChromiumTabId = function(tabId) {
        return typeof tabId === 'number' && !isNaN(tabId) && tabId > 0 ?
            tabId :
            0;
    };
    vAPI.setIcon = (function() {
        let browserAction = chrome.browserAction,
            titleTemplate = chrome.runtime.getManifest().browser_action.default_title + ' ({badge})';

        let iconPaths = [
            { '19': 'img/browsericons/icon19-off.png' ,'38': 'img/browsericons/icon38-off.png' },
            { '19': 'img/browsericons/icon19.png', '38': 'img/browsericons/icon38.png' },
            { '19': 'img/browsericons/icon19-off-incognito.png', '38': 'img/browsericons/icon38-off-incognito.png' }
        ];

        if ( browserAction.setBadgeBackgroundColor !== undefined ) {
            browserAction.setBadgeBackgroundColor({ color: [ 0x77, 0x77, 0x77, 0xFF ] });
        }

        var onTabReady = function(tab, status, badge, parts) {
            if ( vAPI.lastError() || !tab ) { return; }

            if ( browserAction.setIcon !== undefined ) {
                if ( parts === undefined || (parts & 0x01) !== 0 ) {
                    var icon = iconPaths[status];
                    if (tab.incognito === true && status === 0) icon = iconPaths[2];
                    browserAction.setIcon({ tabId: tab.id, path: icon });
                }

                browserAction.setBadgeText({ tabId: tab.id, text: badge });
            }

            if ( browserAction.setTitle !== undefined ) {
                browserAction.setTitle({
                    tabId: tab.id,
                    title: titleTemplate.replace(
                        '{badge}',
                        status === 1 ? (badge !== '' ? badge : '0') : 'off'
                    )
                });
            }
        };

        // parts: bit 0 = icon
        //        bit 1 = badge

        return function(tabId, state, badge, parts) {
            tabId = toChromiumTabId(tabId);
            if ( tabId === 0 ) { return; }

            chrome.tabs.get(tabId, function(tab) {
                onTabReady(tab, state, badge, parts);
            });

            if ( vAPI.contextMenu instanceof Object ) {
                vAPI.contextMenu.onMustUpdate(tabId);
            }
        };
    })();
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status && changeInfo.status === "loading") {
            setDefaultIcon(tab);
        }
    });
})();
