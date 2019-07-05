$(document).ready(function() {
    function rule_diff (orig, edit) {

        var orig_diff = [], edit_diff = edit.slice() /* copy edit */;
        var exist = false;
        for (var i = 0; i < orig.length; i++) {
            exist = false;
            for (var j = 0; j < edit_diff.length; j++) {
                if (orig[i] !== edit_diff[j]) continue;
                exist = true;
                edit_diff.splice(j, 1);
                break;
            }
            if (!exist) orig_diff.push(orig[i])
        }

        return {'orig': orig_diff, 'edit': edit_diff, 'cnt': orig_diff.length + edit_diff.length}
    }
    /******************************************************************************/

    var messaging = vAPI.messaging;

    var curRules = {
        orig: { doc: $('#diff > .left ul'), rules: [] },
        edit: { doc: $('.list-items'), rules: [] }
    };

    /******************************************************************************/

    var rulesToDoc = function() {
        for ( var key in curRules ) {
            if ( curRules.hasOwnProperty(key) === false ) { continue; }
            var doc = curRules[key].doc;
            var rules = curRules[key].rules;


            doc.html('');
            for (var i in rules) {
                var value = rules[i];
                if (!value) return;
                var item = ListEdit.template.clone();
                item.find('.item-value').text(value);
                doc.append(item);
            }
        }
    };

    /******************************************************************************/

    var renderRules = function(details) {
        details.permanentRules.sort();
        details.sessionRules.sort();
        curRules.orig.rules = details.permanentRules;
        curRules.edit.rules = details.sessionRules;
        rulesToDoc();

        onTextChanged(true);
    };

    /******************************************************************************/

    var applyDiff = function(permanent, toAdd, toRemove) {
        messaging.send(
            'dashboard',
            {
                what: 'modifyRuleset',
                permanent: permanent,
                toAdd: toAdd,
                toRemove: toRemove
            },
            renderRules
        );
    };

    /******************************************************************************/

    function handleImportFilePicker() {
        var fileReaderOnLoadHandler = function() {
            if ( typeof this.result !== 'string' || this.result === '' ) { return; }
            // https://github.com/chrisaljoudi/uBlock/issues/757
            // Support RequestPolicy rule syntax
            var result = this.result;
            var matches = /\[origins-to-destinations\]([^\[]+)/.exec(result);
            if ( matches && matches.length === 2 ) {
                result = matches[1].trim()
                    .replace(/\|/g, ' ')
                    .replace(/\n/g, ' * noop\n');
            }
            applyDiff(false, result, '');
        };
        var file = this.files[0];
        if ( file === undefined || file.name === '' ) { return; }
        if ( file.type.indexOf('text') !== 0 ) { return; }
        var fr = new FileReader();
        fr.onload = fileReaderOnLoadHandler;
        fr.readAsText(file);
    }

    /******************************************************************************/

    var startImportFilePicker = function() {
        var input = document.getElementById('importFilePicker');
        // Reset to empty string, this will ensure an change event is properly
        // triggered if the user pick a file, even if it is the same as the last
        // one picked.
        input.value = '';
        input.click();
    };

    /******************************************************************************/

    function exportUserRulesToFile() {
        var filename = vAPI.i18n('rulesDefaultFileName')
            .replace('{{datetime}}', uBlockDashboard.dateNowToSensibleString())
            .replace(/ +/g, '_');
        vAPI.download({
            url: 'data:text/plain,' + encodeURIComponent(curRules.orig.rules + '\n'),
            filename: filename,
            saveAs: true
        });
    }

    /******************************************************************************/

    var onTextChanged = (function() {
        var timer;

        var process = function(now) {
            timer = undefined;
            var diff = rule_diff(curRules.orig.rules, curRules.edit.rules);
            var isClean = (diff.cnt > 0) ? false : true;
            var ui = document.getElementById('diff');
            ui.classList.toggle('dirty', !isClean);
        };

        return function(now) {
            if ( timer !== undefined ) { clearTimeout(timer); }
            timer = now ? process(now) : vAPI.setTimeout(process, 57);
        };
    })();

    /******************************************************************************/

    var revertAllHandler = function() {
        var diff = rule_diff(curRules.orig.rules, curRules.edit.rules);
        applyDiff(false, diff.orig.join('\n'), diff.edit.join('\n'));
    };

    /******************************************************************************/

    var commitAllHandler = function() {
        var diff = rule_diff(curRules.orig.rules, curRules.edit.rules);
        applyDiff(true, diff.edit.join('\n'), diff.orig.join('\n'));
    };

    /******************************************************************************/

    messaging.send('dashboard', { what: 'getRules' }, renderRules);

    // Handle user interaction
    uDom('#importButton').on('click', startImportFilePicker);
    uDom('#importFilePicker').on('change', handleImportFilePicker);
    uDom('#exportButton').on('click', exportUserRulesToFile);
    uDom('#revertButton').on('click', revertAllHandler);
    uDom('#commitButton').on('click', commitAllHandler);
    /******************************************************************************/
    
    ListEdit.init = function() {
        var self = ListEdit;
        //list item add
        $('.add-item').bind('click', function (event) {
            event.preventDefault();
            self.edit('', function(res) {
                applyDiff(false, res, '');
            })
        });

        //list item edit
        $('.list-items').on('click', '.edit-item', function (event) {
            event.preventDefault();
            var item = $(this).parents('.list-item').find('.item-value');
            self.edit(item.text(), function(res) {
                applyDiff(false, res, item.text());
            })
        });
        //list item remove
        $('.list-items').on('click', '.remove-item', function () {
            var item = $(this).parents('.list-item');
            applyDiff(false, '', item.find('.item-value').text());

            return false;
        });
    }

    ListEdit.titleEdit = vAPI.i18n('extraEditRule');
    ListEdit.titleAdd = vAPI.i18n('extraAddRrule');

    ListEdit.init();
});