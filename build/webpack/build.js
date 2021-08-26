const shell = require('../node_modules/shelljs'),
    Config = {
        "adblock": require('../config/adblock/adblock.config'),
        "anti-tracking": require('../config/anti-tracking/anti-tracking.config')
    },
    DEFAULT_VERSION = "2.0.0.1";

function run() {
    for (let product in Config) {
        for (let brand in Config[product]) {
            if (brand !== "common") build(brand, product);
        }
    }
}

function build(brand, product) {
    console.log('[Webpack Build]');
    console.log('-'.repeat(80));
    shell.exec(`webpack --config webpack-prod.config.js --env.brand ${brand} --env.version ${getVersion()} --env.product ${product} --progress --profile --colors`);
}

function getVersion() {
    let version = process.argv.filter(a => a.match(/version=(\d+)/));

    return version[0] ? `2.7.${version[0].split("=")[1]}` : DEFAULT_VERSION;
}

run();
