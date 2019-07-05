$(document).ready(function() {
    ListEdit.titleEdit = vAPI.i18n('extraEditSetting');
    ListEdit.titleAdd = vAPI.i18n('extraAddSetting');
    ListEdit.save = function(value) {
        var self = ListEdit;
        self.textarea.val(value);
        self.textarea.change();
        uDom('#advancedSettingsApply').trigger('click');
    };

    ListEdit.init();


    Hash.update = function() {
        let tab = Hash.get()['tab'];
        if (!tab) tab = '#settings';
        $('.tab').removeClass('active');
        $(tab).addClass('active');
    };
    Hash.init();
});

/******************************************************************************/

(function() {

    /******************************************************************************/

    var messaging = vAPI.messaging;
    var cachedData = '';
    var rawAdvancedSettings = uDom.nodeFromId('advancedSettings');

    /******************************************************************************/

    var hashFromAdvancedSettings = function(raw) {
        return raw.trim().replace(/\s+/g, '|');
    };

    /******************************************************************************/

// This is to give a visual hint that the content of user blacklist has changed.

    var advancedSettingsChanged = (function () {
        var timer = null;

        var handler = function() {
            timer = null;
            var changed = hashFromAdvancedSettings(rawAdvancedSettings.value) !== cachedData;
            uDom.nodeFromId('advancedSettingsApply').disabled = !changed;
        };

        return function() {
            if ( timer !== null ) {
                clearTimeout(timer);
            }
            timer = vAPI.setTimeout(handler, 100);
        };
    })();

    /******************************************************************************/

    function renderAdvancedSettings() {
        var onRead = function(raw) {
            cachedData = hashFromAdvancedSettings(raw);
            var pretty = [],
                whitespaces = '                                ',
                lines = raw.split('\n'),
                max = 0,
                pos,
                i, n = lines.length;
            for ( i = 0; i < n; i++ ) {
                pos = lines[i].indexOf(' ');
                if ( pos > max ) {
                    max = pos;
                }
            }
            for ( i = 0; i < n; i++ ) {
                pos = lines[i].indexOf(' ');
                pretty.push(whitespaces.slice(0, max - pos) + lines[i]);
            }
            rawAdvancedSettings.value = pretty.join('\n') + '\n';
            advancedSettingsChanged();
            rawAdvancedSettings.focus();
        };
        messaging.send('dashboard', { what: 'readHiddenSettings' }, onRead);
    }

    /******************************************************************************/

    var applyChanges = function() {
        messaging.send(
            'dashboard',
            {
                what: 'writeHiddenSettings',
                content: rawAdvancedSettings.value
            },
            renderAdvancedSettings
        );
    };

    /******************************************************************************/

// Handle user interaction
    uDom('#advancedSettings').on('input', advancedSettingsChanged);
    uDom('#advancedSettingsApply').on('click', applyChanges);

    renderAdvancedSettings();

    /******************************************************************************/

})();


