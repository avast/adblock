$(document).ready(function() {
    let messaging = vAPI.messaging;

    $('.filter-list-settings').find('input').bind('change', function(){
        uDom('#buttonApply').trigger('click');
    });

    $('#extraButtonUpdate').bind('click', function() {
        uDom('#extraButtonUpdate').toggleClass('disabled');
        // uDom('#buttonPurgeAll').trigger('click');
        messaging.send(
            'dashboard',
            {
                what: 'purgeAllCaches',
                hard: false
            },
            function() {
                messaging.send('dashboard', { what: 'forceUpdateAssets' }, function () {
                    // uDom('#buttonUpdate').trigger('click');
                    uDom('#extraButtonUpdate').toggleClass('disabled');
                })
            }
        );
        return false;
    });

    Hash.update = function() {
        let vars = Hash.get();

        let tab = vars['tab'];
        if (!tab) tab = '#3p-filters';

        $('.tab').removeClass('active');

        if (tab == '#filter-list') {
            let group = vars['group'];
            $('.filter-list').html('');
            setTimeout(function() {
                $('.groupEntry[data-groupkey="' + group + '"]').find('.listEntry').each(function () {
                    var ui = $(this);
                    var title = ui.find('.content').text();
                    var link = chrome.extension.getURL('') + ui.find('.content').attr('href');
                    var checked = ui.find('input').prop('checked');
                    var support = ui.find('.support').attr('href');
                    if (support.length) title += ' <a href="' + support + '" class="learn" target="_blank">' + vAPI.i18n('extraLearnMore') + '</a>';
                    var item = $('.template .template-filter-item').clone();
                    item.find('.item-title').html(title);
                    item.find('.item-link').attr('href', link);
                    item.find('input').prop('checked', checked).bind('change', function () {
                        var checked = $(this).prop('checked');
                        ui.find('input').prop('checked', checked);

                        uDom('#buttonApply').trigger('click');
                    });
                    $('.filter-list').append(item);
                });
                let title = $('.groupEntry[data-groupkey="' + group + '"]').find('.geName').text() || vAPI.i18n('extraAdsFilters');
                $('.filter-title').text(title);
            }, 100);
        }
        $(tab).addClass('active');
    };

    $('#lists').on('click', '.groupEntry', function() {
        Hash.set({
            'tab': '#filter-list',
            'group': $(this).data('groupkey')
        });
        Hash.update();

        return false;
    });

    Hash.init();
});