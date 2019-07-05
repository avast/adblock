(function () {
    var renderPopup = function (popupData) {
        var $wrapper = $(".wrapper-info");
        if (popupData.netFilteringSwitchExtra == 1) {
            $wrapper.find(".wrapper-info-item").hide();
            $wrapper.find(".extra").show();
            $('.footer-actual').first().hide();
        } else if (popupData.netFilteringSwitchExtra == 2) {
            $wrapper.find(".wrapper-info-item").hide();
            $wrapper.find(".session").show();
            $('.footer-actual').first().hide();
        } else if (
            (popupData.pageURL === '') ||
            (!popupData.netFilteringSwitch) ||
            (popupData.pageHostname === 'behind-the-scene' && !popupData.advancedUserEnabled)
        ) {
            $wrapper.find(".wrapper-info-item").hide();
            $wrapper.find(".whitelist").show();
            $('.footer-actual').first().hide();
        } else {
            $wrapper.find(".wrapper-info-item").hide();
            $wrapper.find(".normal").show();
            $('.footer-actual').first().show();
        }

        uDom('body')
            .toggleClass('advancedUser', popupData.advancedUserEnabled)
            .toggleClass(
                'off',
                (popupData.pageURL === '') ||
                (!popupData.netFilteringSwitch) ||
                (popupData.pageHostname === 'behind-the-scene' && !popupData.advancedUserEnabled)
            )
            .toggleClass(
                'extra',
                (popupData.netFilteringSwitchExtra > 0)
            )
        ;

        $('.block-request-count').text(popupData.pageBlockedRequestCount);
        $('.block-data-total').text(formatData(popupData.globalBlockedRequestCount));

        var blocked = {}, item;
        for (var i in popupData.hostnameDict) {
            item = popupData.hostnameDict[i];
            if (item.blockCount > 0) {
                if (blocked[item.domain] === undefined) blocked[item.domain] = [];

                if (item.blockCount > 1) {
                    blocked[item.domain].push(i + ' (' + item.blockCount + ')');
                } else {
                    blocked[item.domain].push(i);
                }
            }
        }

        var li, ui = $('.page-block .footer-blocks');
        ui.text('');
        for (var i in blocked) {
            li = $('' +
                '<div class="footer-blocks-body">' +
                '<div class="footer-blocks-tittle">' +
                '<div class="right-arrow"></div>' +
                '<div class="down-arrow-blocks"></div>' +
                i +
                '</div>' +
                '<div class="blocks-body-info"></div>' +
                '</div>');
            n = blocked[i].length;
            for (var j = 0; j < n; j++) {
                li.find('.blocks-body-info').append('<p>' + blocked[i][j] + '</p>');
            }
            ui.append(li);
        }
        ui.find('.down-arrow-blocks').hide();
    };

    formatData = function (bytes) {
        var res = '0';
        if (bytes) {
            bytes = Math.round(bytes);
            if (bytes >= 1000 * 1000) {
                res = (bytes / 1000 / 1000).toFixed(1) + 'M';
            } else if (bytes >= 1000) {
                res = (bytes / 1000).toFixed(1) + 'K';
            } else {
                res = bytes;
            }
        }
        return res;
    };

    var messaging = vAPI.messaging;
    var popupData = {};
    var scopeToSrcHostnameMap = {
        '/': '*',
        '.': ''
    };
    var hostnameToSortableTokenMap = {};

    var toggleNetFilteringSwitch = function (ev) {
        if (!popupData || !popupData.pageURL) {
            return;
        }
        if (popupData.pageHostname === 'behind-the-scene' && !popupData.advancedUserEnabled) {
            return;
        }
        messaging.send(
            'popupPanel',
            {
                what: 'toggleNetFiltering',
                url: popupData.pageURL,
                scope: '',
                state: !uDom('body').toggleClass('off').hasClass('off'),
                tabId: popupData.tabId
            }
        );
    };

    var cachePopupData = function (data) {
        popupData = {};
        scopeToSrcHostnameMap['.'] = '';
        hostnameToSortableTokenMap = {};

        if (typeof data !== 'object') {
            return popupData;
        }
        popupData = data;
        scopeToSrcHostnameMap['.'] = popupData.pageHostname || '';
        var hostnameDict = popupData.hostnameDict;
        if (typeof hostnameDict !== 'object') {
            return popupData;
        }
        var domain, prefix;
        for (var hostname in hostnameDict) {
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
    };

    var pollForContentChange = (function () {
        var pollTimer = null;

        var pollCallback = function () {
            pollTimer = null;
            messaging.send(
                'popupPanel',
                {
                    what: 'hasPopupContentChanged',
                    tabId: popupData.tabId,
                    contentLastModified: popupData.contentLastModified
                },
                queryCallback
            );
        };

        var queryCallback = function (response) {
            if (response) {
                getPopupData(popupData.tabId);
                return;
            }
            poll();
        };

        var poll = function () {
            if (pollTimer !== null) {
                return;
            }
            pollTimer = vAPI.setTimeout(pollCallback, 1500);
        };

        return poll;
    })();

    var getPopupData = function (tabId) {
        var onDataReceived = function (response) {
            messaging.send(
                'popupExtraPanel',
                {what: 'getPopupData', tabId: tabId, response: response},
                function (response) {
                    cachePopupData(response);
                    renderPopup(popupData);
                    pollForContentChange();
                }
            );
        };
        messaging.send(
            'popupPanel',
            {what: 'getPopupData', tabId: tabId},
            onDataReceived
        );
    };


    var tabId = null;

    // Extract the tab id of the page this popup is for
    var matches = window.location.search.match(/[\?&]tabId=([^&]+)/);
    if (matches && matches.length === 2) {
        tabId = matches[1];
    }
    getPopupData(tabId);

    //whitelist
    var renderWhitelistUI = function (whitelist) {
        var li, ui = $('.page-allow .footer-allow');
        ui.text('');
        for (var i in whitelist) {
            if (i == '#' || i == '') continue;
            li = $('' +
                '<div class="footer-allow-body">' +
                '<div class="cross-icon"></div>' +
                i +
                '</div>');
            ui.append(li);
        }
        if ($(".footer-allow").find(".footer-allow-body").length == 0) {
            $('<img src="img/icon-file.svg">').appendTo(".footer-allow");
            $(".footer-allow").append("<p>" + vAPI.i18n('popupExtraNoSitesAddedYet') + "</p>");
        }
    }
    $('.page-allow .footer-allow').on('click', '.cross-icon', function (e) {

        var key = $(this).closest(".footer-allow-body").text();
        messaging.send('popupExtraPanel', {what: 'removeWhitelist', key: key}, renderWhitelist);

        $(this).closest(".footer-allow-body").remove();
    });
    var renderWhitelist = function() {
        var onRead = function(whitelist) {
            renderWhitelistUI(whitelist);
        };
        messaging.send('popupExtraPanel', { what: 'getWhitelist' }, onRead);
    };
    renderWhitelist();

    //ui bind
    $(document).ready(function () {
        $('.page-toggle').bind('click', function (e) {
            $('.page-allow, .page-block, .page-main').hide();
            var show = $(this).attr('href').replace('#', '.');
            $(show).show();

            return false;
        })

        //main
        $(".wrapper-info-options").hide();
        $(".up-arrow").hide();
        $(".less").hide();
        $(".wrapper-info-more").click(function (e) {
            $(this).next(".wrapper-info-options").animate({height: 'toggle'});
            $(this).find(".down-arrow, .up-arrow").toggle();
            $(this).find(".more, .less").toggle();
        });

        $('#btn-on').bind('click', function (e) {
            if ($('body').hasClass('extra')) return;

            toggleNetFilteringSwitch();

            var $wrapper = $(".wrapper-info");
            setTimeout(function () {
                $wrapper.find(".wrapper-info-item").addClass("animated fadeInUp");
                setTimeout(function () {
                    $wrapper.find(".wrapper-info-item").removeClass("animate fadeInUp");
                }, 450);
                $wrapper.find(".normal, .whitelist").toggle();
                $('.state-off').animate({height: 'toggle'});
            }, 350);

            //animation
            var ink, d, x, y;
            $(this).find("span").remove();
            $(this).prepend("<span class='ink'></span>");
            ink = $(this).find('.ink');
            if (!ink.height() && !ink.width()) {
                d = Math.max($(this).outerWidth(), $(this).outerHeight());
                ink.css({height: d, width: d});
            }
            x = e.pageX - $(this).offset().left - ink.width() / 2;
            y = e.pageY - $(this).offset().top - ink.height() / 2;
            ink.css({top: y + 'px', left: x + 'px'}).addClass("animate");

            setTimeout(function () {
                ink.remove();
            }, 450);
        });
        //main

        //block
        $('.page-block .footer-blocks').on('click', '.footer-blocks-tittle', function (e) {
            $(this).next(".blocks-body-info").slideToggle(0);
            $(this).find(".right-arrow, .down-arrow-blocks").toggle();

            //animation
            var ink, d, x, y;
            if ($(this).find(".ink-gray").length == 0)
                $(this).prepend("<span class='ink-gray'></span>");

            ink = $(this).find(".ink-gray");
            ink.removeClass("animate");

            if (!ink.height() && !ink.width()) {
                d = Math.max($(this).outerWidth(), $(this).outerHeight());
                ink.css({height: d, width: d});
            }
            x = e.pageX - $(this).offset().left - ink.width() / 2;
            y = e.pageY - $(this).offset().top - ink.height() / 2;

            ink.css({top: y + 'px', left: x + 'px'}).addClass("animate");
            setTimeout(function () {
                ink.remove();
            }, 450)
        });

        $(".footer-blocks").scroll(function (e) {
            if ($('.footer-blocks').scrollTop() > 0) {
                $('.wrapper-blocks').addClass('shadow');
            } else {
                $('.wrapper-blocks').removeClass('shadow');
            }
        });
        //block
    });
})();
