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

    const renderAdvancedSettings = async function(first) {
        const raw = await vAPI.messaging.send('dashboard', {
            what: 'readHiddenSettings',
        });

        beforeHash = hashFromAdvancedSettings(raw);
        cachedData = hashFromAdvancedSettings(raw);
        let pretty = [],
            whitespaces = '                                ',
            lines = raw.split('\n'),
            max = 0;
        for ( let line of lines ) {
            let pos = line.indexOf(' ');
            if ( pos > max ) { max = pos; }
        }
        for ( let line of lines ) {
            let pos = line.indexOf(' ');
            pretty.push(whitespaces.slice(0, max - pos) + line);
        }

        rawAdvancedSettings.value = pretty.join('\n') + '\n';
        advancedSettingsChanged();
        rawAdvancedSettings.focus();
    };

    /******************************************************************************/

    var applyChanges = async function() {
        await vAPI.messaging.send('dashboard', {
            what: 'writeHiddenSettings',
            content: rawAdvancedSettings.value,
        });
        renderAdvancedSettings();
    };

    /******************************************************************************/

// Handle user interaction
    uDom('#advancedSettings').on('input', advancedSettingsChanged);
    uDom('#advancedSettingsApply').on('click', applyChanges);

    renderAdvancedSettings();

    /******************************************************************************/

})();


