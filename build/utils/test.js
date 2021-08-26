const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const gutil = require('gulp-util');

module.exports = function (extensionPath, testUrl, done) {
    const browserPath = '/usr/bin/google-chrome-beta';
    // const browserPath        = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    const browserInitTime = 3000; //ms

    const testTimeout = 50000; //ms //this is tests on page

    let options = new chrome.Options()
        .setChromeBinaryPath(browserPath)
        .addArguments("--no-sandbox")
        .addArguments("--load-extension=" + extensionPath)

    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    driver.sleep(browserInitTime)
        .then(_ => driver.get(testUrl))
        .then(_ => driver.wait(function (driver) {
            return driver.executeScript("return (typeof jsApiReporter != 'undefined') ? jsApiReporter.status() == 'done' : false; ")
        }, testTimeout))
        .then(_ => driver.executeScript("return {status: jsApiReporter.runDetails.overallStatus, specs: jsApiReporter.specs()}; "))
        .then(function (result) {
            for (let i = 0; i < result.specs.length; i++) {
                let msg = "spec: " + result.specs[i].description + " || status: " + result.specs[i].status;
                if (result.specs[i].status == 'passed') {
                    gutil.log(gutil.colors.blue.bgGreen(msg));
                } else {
                    gutil.log(gutil.colors.bgRed(msg));
                }
            }

            if (result.status !== 'passed') {
                throw new Error('Test failed!');
            }
            driver.quit();

            done();
        });
}

