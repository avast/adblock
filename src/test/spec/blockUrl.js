var testBlock = function(done, reqUrl, blockUrl) {
    if (!(blockUrl)) blockUrl = reqUrl;

    chrome.tabs.create({'active': false}, function(tab) {
        chrome.webRequest.onErrorOccurred.addListener(function (details) {
            chrome.tabs.remove(tab.id);
            done.fail(details.url + ' - blocked [' + details.error + ']');
        }, {urls: [blockUrl], tabId: tab.id});
        chrome.webRequest.onCompleted.addListener(function () {
            chrome.tabs.remove(tab.id);
            done();
        }, {urls: [blockUrl], tabId: tab.id});
        chrome.tabs.update(tab.id, {'url': reqUrl});
    });
};

describe("testing of filters", function() {

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000;
    });

    it("tells if https://bat.bing.com/bat.js blocked", function(done) {
        testBlock(done, 'https://bat.bing.com/bat.js');
        expect(true).toBe(true);
    });
    it("tells if https://s.yimg.com/wi/ytc.js blocked", function(done) {
        testBlock(done, 'https://s.yimg.com/wi/ytc.js');
        expect(true).toBe(true);
    });
    it("tells if bat.js blocked on www.1stopflorists.com", function(done) {
        testBlock(done, 'https://www.1stopflorists.com', 'https://bat.bing.com/bat.js');
        expect(true).toBe(true);
    });
    it("tells if ytc.js blocked on www.1stopflorists.com", function(done) {
        testBlock(done, 'https://www.1stopflorists.com', 'https://s.yimg.com/wi/ytc.js');
        expect(true).toBe(true);
    });
});
