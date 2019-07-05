function createSticky(sticky) {
    if (typeof sticky !== "undefined") {
        var pos = sticky.offset().top,
            win = $(window);
        win.on("scroll", function () {
            if (win.scrollTop() > pos) {
                sticky.addClass("fixed")
            } else {
                sticky.removeClass("fixed");
            }
        });
    }
}
$(function () {
    createSticky($("#header"));
});

/*****************************************/
$(document).ready(function () {
    var ripple, d, x, y;
    $(".btn-add, .btn-open").click(function (e) {
        if ($(this).find(".ripple_eff_modal").length == 0) {
            $(this).prepend("<span class='ripple_eff_modal'></span>");
        }
        ripple = $(this).find(".ripple_eff_modal");
        ripple.removeClass("animate");

        if (!ripple.height() && !ripple.width()) {
            d = Math.max($(this).outerWidth(), $(this).outerHeight());
            ripple.css({height: d, width: d});
        }
        x = e.pageX - $(this).offset().left - ripple.width() / 2;
        y = e.pageY - $(this).offset().top - ripple.height() / 2;

        ripple.css({top: y + 'px', left: x + 'px'}).addClass("animate");
    });
});

$(document).ready(function () {
    var ripple, d, x, y;
    $(".btn").click(function (e) {
        if ($(this).find(".ripple_eff").length == 0) {
            $(this).prepend("<span class='ripple_eff'></span>");
        }
        ripple = $(this).find(".ripple_eff");
        ripple.removeClass("animate");

        if (!ripple.height() && !ripple.width()) {
            d = Math.max($(this).outerWidth(), $(this).outerHeight());
            ripple.css({height: d, width: d});
        }
        x = e.pageX - $(this).offset().left - ripple.width() / 2;
        y = e.pageY - $(this).offset().top - ripple.height() / 2;

        ripple.css({top: y + 'px', left: x + 'px'}).addClass("animate");
    });
});
/*****************************************/
$(function () {
    // Dropdown toggle
    $('body').on('click', '.nav-toggle-dropdown', function () {
        $('.dropdown-menu').hide();
        $(this).next('.dropdown-menu').toggle();

    });

    $(document).click(function (e) {
        var target = e.target;
        if (!$(target).is('.nav-toggle-dropdown') && !$(target).parents().is('.nav-toggle-dropdown')) {
            $('.dropdown-menu').hide();
        }
    });

});

$('body').keydown(function(e) {
    if ($('.modal_form').css('display') === 'block') {
        if (e.keyCode == 13) {
            $('.modal-body .btn-add').click();
            return false;
        } else if (e.keyCode == 27) {
            $('.modal-body .btn-cancel').click();
            return false;
        }
    }
});

$('.modal_close, .btn-cancel, .btn-add, .cancel, .overlay').click(function () {
    $('.modal_form').animate({opacity: 0, top: '45%'}, 200, function () {
        $(this).css('display', 'none');
        $('.overlay').fadeOut(400);
    });
});

var ListEdit = {
    titleEdit: 'Edit site',
    titleAdd: 'Add site',
    textarea: $('.list-items-value'),
    template: $('.template .list-item'),
    save: function() {},
    update: function () {
        var self = ListEdit;
        var value = '';
        $('.list-items').find('.list-item').each(function () {
            value += $(this).find('.item-value').text() + '\n';
        });
        self.save(value);
    },
    edit: function(value, callback) {
        var self = ListEdit;
        var item = $(this).parents('.list-item').find('.item-value');
        $('.overlay').fadeIn(400, function () {
            $('.modal_form').css('display', 'block').animate({opacity: 1, top: '35%'}, 200);
            $('.modal_form.err').css('display', 'block').animate({opacity: 1, top: '75%'}, 200);

            $('#name').val(value);
            $('#name').focus();

            var title = self.titleEdit;
            var btn_title = vAPI.i18n('extraBtnEdit');
            if (!value) {
                title = self.titleAdd;
                btn_title = vAPI.i18n('extraBtnAdd');
            }
            $(".modal-header-tittle").text(title);
            $('.btn-add').text(btn_title).unbind('click.edit').bind('click.edit', function() {
                var res = $('#name').val();
                if (callback) callback(res);
            });
        });
    },
    observe: function() {
        var self = ListEdit;
        var value = '';
        $(self.textarea).on('change', function () {
            value = self.textarea.val();
            $('.list-items').html('');
            var items = self.textarea.val().split(/\n/);
            for (var i in items) {
                if (!items[i].length) continue;
                var item = self.template.clone();
                item.find('.item-value').text(items[i].trim());
                $('.list-items').append(item);
            }
        });
        setInterval(function () {
            if (self.textarea.val() != value) self.textarea.change();
        }, 100);
    },
    init: function() {
        var self = ListEdit;
        //list item add
        $('.add-item').bind('click', function (event) {
            event.preventDefault();

            self.edit('', function(res) {
                var item = self.template.clone();
                item.find('.item-value').text(res);
                $('.list-items').append(item);
                self.update();
            })
        });

        //list item edit
        $('.list-items').on('click', '.edit-item', function (event) {
            event.preventDefault();

            var item = $(this).parents('.list-item').find('.item-value');
            self.edit(item.text(), function(res) {
                item.text(res);
                self.update();
            })
        });
        //list item remove
        $('.list-items').on('click', '.remove-item', function () {
            $(this).parents('.list-item').remove();
            self.update();

            return false;
        });

        //add observe for uBlock
        self.observe();
    }
};

var Hash = {
    update: function() {},
    init: function() {
        var self = Hash;
        /*** tab toggle ***/
        $('.tab-toggle').bind('click', function() {
            let tab = $(this).attr('href');
            self.add('tab', tab);
            self.update();

            return false;
        });
        /******************/
        window.onpopstate = function(event) {
            self.update();
        };
        self.update();
    },
    get: function() {
        let vars = {}, hash, splitter, hashes;

        let pos = window.location.href.indexOf('?');
        hashes = (pos != -1) ? decodeURIComponent(window.location.href.substr(pos + 1)) : '';
        splitter = '&';

        if (hashes.length == 0) {return vars;}
        else {hashes = hashes.split(splitter);}

        for (let i in hashes) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    set: function(vars) {
        let hash = '';
        for (let i in vars) {
            hash += '&' + i + '=' + vars[i];
        }
        if (hash.length != 0) {
            hash = '?' + hash.substr(1);
        }
        window.history.pushState(hash, '', document.location.pathname + hash);
    },
    add: function(key, val) {
        if (!val) val = '';
        let hash = this.get();
        hash[key] = val;
        this.set(hash);
    },
    remove: function(key) {
        let hash = this.get();
        delete hash[key];
        this.set(hash);
    },
    clear: function() {
        this.set({});
    }
};