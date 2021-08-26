const shell = require('../node_modules/shelljs'),
    Config = {
        "adblock": require('../config/adblock/adblock.config'),
        "anti-tracking": require('../config/anti-tracking/anti-tracking.config')
    };

function run(productsConfig) {
    for (let product in productsConfig) {
        for (let brand in productsConfig[product]) {
            if (brand !== "common") build(brand, product, Object.keys(productsConfig[product]).length === 1);
        }
    }
}

function build(brand, product, watch) {
    console.log('[Webpack Dev]');
    console.log('-'.repeat(80));
    shell.exec(`webpack ${watch ? "--watch" : ""} --config webpack-dev.config.js --env.brand ${brand} --env.product ${product} --progress --profile --colors`);
}

function getConfig(brand, product) {
    let config = {};

    if (product && Config[product]) {
        if (Config[product][brand]) {
            config[product] = {};
            config[product][brand] = Config[product][brand];
        } else {
            config[product] = Config[product]
        }
    } else {
        config = Config;
    }

    return config;
}

function getFilteredBrandParameter() {
    return process.argv.slice(3).length ? process.argv.slice(3)[0] : false;
}

function getFilterProductParameter() {
    return process.argv.slice(2).length ? process.argv.slice(2)[0] : false;
}

run(getConfig(getFilteredBrandParameter(), getFilterProductParameter()));
