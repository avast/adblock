$(document).ready(function() {

    var reBadHostname,
        reHostnameExtractor;

    var reComment = /^\s*#/,
        reRegex = /^\/.+\/$/;

    const directiveFromLine = function(line) {
        const match = reComment.exec(line);
        return match === null
            ? line.trim()
            : line.slice(match.index + match[0].length).trim();
    };

    var validate = function(line) {

        var result = {
            puny: '',
            value: line,
            error: false,
        }
        var hostname = line, puny = '';

        //if comment
        if ( reComment.test(line) ) {
            result.error = true;
            return result;
        }

        //if regexp
        if (reRegex.test(line) ) {
            try {
                //test RegExp
                new RegExp(line.slice(1, -1));
            } catch (ex) {
                result.error = true;
                return result;
            }
        }

        //if bad hostname
        if (line.indexOf('/') === -1) {
            if (reBadHostname.test(line)) {
                result.error = true;
                return result;
            }
            puny = punycode.toUnicode(line);
            if (puny !== hostname) {
                result.puny = puny;
            }
            return result;
        }

        //if bad hostname in url
        if (!reHostnameExtractor.test(line)) {
            result.error = true;
            return result;
        }

        var el = document.createElement("a");
        el.href = line;
        hostname = el.hostname;
        puny = punycode.toUnicode(hostname);
        if (puny !== hostname) {
            result.puny = puny;
        }
        return result;
    };

    ListEdit.titleEdit = vAPI.i18n('extraEditSite');
    ListEdit.titleAdd = vAPI.i18n('extraAddSite');
    ListEdit.save = function(value) {
        var self = ListEdit;
        self.textarea.val(value);
        uDom('#whitelistApply').trigger('click');
    };

    ListEdit.observe = function() {
        var self = ListEdit;
        var value = '';
        $(self.textarea).on('change', function () {
            value = self.textarea.val();
            $('.list-items').html('');
            var items = self.textarea.val().split(/\n/);
            for (var i in items) {
                if (!items[i].length) continue;
                var item = self.template.clone();
                var line = validate(items[i].trim());

                if (!line.error) {
                    item.find('.item-value').text(line.value);
                    if (line.puny) item.find('.item-punycode').text(' [' + line.puny + ']');
                } else {
                    item.find('.item-value').text(line.value).hide();
                    item.find('.item-error').text(line.value);
                }

                $('.list-items').append(item);
            }
        });
        setInterval(function () {
            if (self.textarea.val() != value) self.textarea.change();
        }, 100);
    },
        ListEdit.init();


    /******************************************************************************/

    var messaging = vAPI.messaging,
        cachedWhitelist = '';

    /******************************************************************************/

    var getTextareaNode = function() {
        var me = getTextareaNode,
            node = me.theNode;
        if ( node === undefined ) {
            node = me.theNode = uDom.nodeFromSelector('#whitelist textarea');
        }
        return node;
    };

    var setErrorNodeHorizontalOffset = function(px) {
        var me = setErrorNodeHorizontalOffset,
            offset = me.theOffset || 0;
        if ( px === offset ) { return; }
        var node = me.theNode;
        if ( node === undefined ) {
            node = me.theNode = uDom.nodeFromSelector('#whitelist textarea + div');
        }
        node.style.right = px + 'px';
        me.theOffset = px;
    };

    /******************************************************************************/

    var renderWhitelist = async function() {
        const details = await messaging.send('dashboard', {
            what: 'getWhitelist',
        });

        const first = reBadHostname === undefined;
        if ( first ) {
            reBadHostname = new RegExp(details.reBadHostname);
            reHostnameExtractor = new RegExp(details.reHostnameExtractor);
            whitelistDefaultSet = new Set(details.whitelistDefault);
        }
        //const toAdd = new Set(whitelistDefaultSet);
        const toAdd = new Set();
        for ( const line of details.whitelist ) {
            const directive = directiveFromLine(line);
            if ( whitelistDefaultSet.has(directive) === false ) { continue; }
            toAdd.delete(directive);
            if ( toAdd.size === 0 ) { break; }
        }

        if ( toAdd.size !== 0 ) {
            details.whitelist.push(...Array.from(toAdd).map(a => `# ${a}`));
        }
        details.whitelist.sort((a, b) => {
            const ad = directiveFromLine(a);
            const bd = directiveFromLine(b);
            const abuiltin = whitelistDefaultSet.has(ad);
            if ( abuiltin !== whitelistDefaultSet.has(bd) ) {
                return abuiltin ? -1 : 1;
            }
            return ad.localeCompare(bd);
        });
        let whitelistStr = details.whitelist.join('\n').trim();
        if ( whitelistStr !== '' ) {
            whitelistStr += '\n';
        }
        cachedWhitelist = whitelistStr;
        getTextareaNode().value = cachedWhitelist;
    };

    /******************************************************************************/

    var handleImportFilePicker = function() {
        var fileReaderOnLoadHandler = function() {
            var textarea = getTextareaNode();
            textarea.value = [textarea.value.trim(), this.result.trim()].join('\n').trim();
            uDom('#whitelistApply').trigger('click');
        };
        var file = this.files[0];
        if ( file === undefined || file.name === '' ) {
            return;
        }
        if ( file.type.indexOf('text') !== 0 ) {
            return;
        }
        var fr = new FileReader();
        fr.onload = fileReaderOnLoadHandler;
        fr.readAsText(file);
    };

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

    var exportWhitelistToFile = function() {
        var val = getTextareaNode().value.trim();
        if ( val === '' ) { return; }
        var filename = vAPI.i18n('whitelistExportFilename')
            .replace('{{datetime}}', uBlockDashboard.dateNowToSensibleString())
            .replace(/ +/g, '_');
        vAPI.download({
            'url': 'data:text/plain;charset=utf-8,' + encodeURIComponent(val + '\n'),
            'filename': filename
        });
    };

    /******************************************************************************/

    var applyChanges = async function() {
        cachedWhitelist = getTextareaNode().value.trim();

        await messaging.send('dashboard', {
            what: 'setWhitelist',
            whitelist: cachedWhitelist,
        });
        renderWhitelist();
    };

    var revertChanges = function() {
        getTextareaNode().value = cachedWhitelist + '\n';
    };

    /******************************************************************************/

    var getCloudData = function() {
        return getTextareaNode().value;
    };

    var setCloudData = function(data, append) {
        if ( typeof data !== 'string' ) {
            return;
        }
        var textarea = getTextareaNode();
        if ( append ) {
            data = uBlockDashboard.mergeNewLines(textarea.value.trim(), data);
        }
        textarea.value = data.trim() + '\n';
    };

    self.cloud.onPush = getCloudData;
    self.cloud.onPull = setCloudData;

    /******************************************************************************/

    uDom('#importWhitelistFromFile').on('click', startImportFilePicker);
    uDom('#importFilePicker').on('change', handleImportFilePicker);
    uDom('#exportWhitelistToFile').on('click', exportWhitelistToFile);
    uDom('#whitelistApply').on('click', ( ) => { applyChanges(); });
    uDom('#whitelistRevert').on('click', revertChanges);

    renderWhitelist();

    /******************************************************************************/

});

