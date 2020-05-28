$(document).ready(function() {
    var ListEdit = {
        update: function (res) {
            if (!res) return;
            $('#externalLists').val(res);
            uDom('#buttonApply').trigger('click');
        },
        edit: function(value, callback) {
            var self = ListEdit;
            var item = $(this).parents('.list-item').find('.item-value');
            $('.overlay').fadeIn(400, function () {
                $('.modal_form').css('display', 'block').animate({opacity: 1, top: '35%'}, 200);
                $('.modal_form.err').css('display', 'block').animate({opacity: 1, top: '75%'}, 200);

                $('#name').val('');
                $('#name').focus();

                $('.btn-add').unbind('click.edit').bind('click.edit', function() {
                    var res = $('#name').val();
                    if (callback) callback(res);
                });
            });
        },
        init: function() {
            var self = ListEdit;
            //item add
            $('.add-item').bind('click', function (event) {
                event.preventDefault();

                self.edit('', function(res) {
                    self.update(res);
                })
            });

            $('.btn-remove').bind('click', function(){
                return false;
            })
        }
    };
    ListEdit.init();

    let messaging = vAPI.messaging;

    $('.filter-list-settings').find('input').bind('change', function(){
        uDom('#buttonApply').trigger('click');
    });

    $('#extraButtonUpdate').bind('click', function() {
        // uDom('#extraButtonUpdate').toggleClass('disabled');
        messaging.send('dashboard', { what: 'purgeAllCaches', hard: false });
        messaging.send('dashboard', { what: 'forceUpdateAssets' });
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
                    if (ui.hasClass('external')) {
                        item.addClass('external');
                        item.find('.btn-remove').bind('click', function(){
                            let listKey = ui.data('listkey');
                            if ( listKey ) {
                                item.remove();
                                ui.toggleClass('toRemove');
                            }
                            uDom('#buttonApply').trigger('click');
                            return false;
                        });
                    }
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