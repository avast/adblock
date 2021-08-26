let run = () => {

    'use strict';

    let extra = {};
    µBlock.extra = extra;

    //default whitelist
    extra.defaultWhitelist = µBlock.netWhitelistDefault;
    µBlock.netWhitelistDefault = '';
    //default whitelist

    //whitelist
    extra.whitelist = process.env.CONFIG.whitelistDefault;
    extra.url = process.env.CONFIG.whitelistUrl;
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
        }).then((fetched) => {
            extra.whitelist = fetched.extraWhitelist;
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
        }).then((fetched) => {
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
    try {
        chrome.avast.getPref('install_channel', function (key, install_channel) {
            if (install_channel) extra.campaign_id = install_channel;

            chrome.avast.getHostPrefix(function(host_prefix) {
                if (host_prefix) extra.host_prefix = host_prefix;

                // extra.getWhitelist();
            });
        });

    } catch (e) {
        // extra.getWhitelist();
        console.log (e);
    }
    //campaign_id

    //whitelistAds
    var tempWhitelist = {};
    let whitelistAds = parseInt(process.env.CONFIG.whitelistAds);
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
                    key: new RegExp(['adeb4e68644887c2bc4ebdff6d2f40a1', '9156956f961747f4c038ad32d8b63a7d', '56af4f5fea672e4b3941c743b0fef947'].join('|'), 'i')
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
            if (reYahoo.test(details.initiator) && reYahooAds.test(details.url) && details.type == 'ping') {
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
            normalizeDetails.call(vAPI.Net, details);
            extraBeforeRequest(details);
        };
    }
    //whitelistForAds

    //interstitial block
    µBlock.userSettings.extraInterstitialBlocking = false;

    var matchString = µBlock.staticNetFilteringEngine.matchString;

    µBlock.staticNetFilteringEngine.matchString = function(fctxt, requestType) {
        //don't block
        if (!µBlock.userSettings.extraInterstitialBlocking && fctxt.type === 'main_frame') return 2;
        //call parent
        return matchString.call(µBlock.staticNetFilteringEngine, fctxt, requestType);
    };
    //interstitial block

    const tempWhitelistToString = function() {
        let tempWhitelistString = '\n';
        Object.keys(tempWhitelist).forEach((item) => {
            tempWhitelistString += tempWhitelist[item] + '\n';
        });
        return tempWhitelistString;
    }
    extra.oldGetNetFilteringSwitch = µBlock.getNetFilteringSwitch;

    const getNetFilteringSwitch = function (url) {
        // Save current whitelist
        var current = this.netWhitelist;

        // Append extra entries
        this.netWhitelist = this.whitelistFromString(
            extra.defaultWhitelist + '\n' +
            extra.whitelist + '\n' +
            µBlock.stringFromWhitelist(this.netWhitelist) + '\n' +
            tempWhitelistToString()
        );

        // Call original
        var result = extra.oldGetNetFilteringSwitch.call(µBlock, url);
        // Restore original whitelist
        this.netWhitelist = current;

        return result;
    };

    // µBlock.getNetFilteringSwitch = getNetFilteringSwitch();
};

const UblockExtra = {
    run
};

export default UblockExtra;
