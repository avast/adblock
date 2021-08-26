const fs = require('fs'),
    path = require('path');

module.exports = {
    getEnvironmentVariables: (product, brand, Config, dev) => {
        return {
            'process.env': {
                BRAND: JSON.stringify(brand),
                THEMES: JSON.stringify({
                    normal: {
                        ...Config.ProductConfig.common.themes.normal,
                        ...Config.ProductConfig.common.themes.bothThemes,
                        ...Config.ProductConfig[brand].themes.normal,
                        ...Config.ProductConfig[brand].themes.bothThemes,
                    },
                    dark: {
                        ...Config.ProductConfig.common.themes.dark,
                        ...Config.ProductConfig.common.themes.bothThemes,
                        ...Config.ProductConfig[brand].themes.dark,
                        ...Config.ProductConfig[brand].themes.bothThemes,
                    }
                }),
                CONFIG: JSON.stringify({
                    ...Config.ProductConfig.common,
                    partnersFaq: Config.ProductConfig[brand].partnersFaq,
                    whitelistDefault: `${fs.readFileSync(`../build/config/${product}/assets/whitelist.txt`)}`,
                    whitelistAfterRedirect: `${fs.readFileSync(`../build/config/${product}/assets/whitelistAfterRedirect.txt`)}`,
                    essentialWhitelist: `${fs.readFileSync(`../build/config/${product}/assets/cba.txt`)}`,
                    assetsUrl: `http://%host_prefix%update.${brand}browser.com/${product === "adblock" ? "adblock" : "privacy"}/assets/v2/assets.json`
                }),
                DEV: dev
            }
        };
    },
    combineAssetsFile: (product, brand, Config) => {
        return {
            object: {
                ...Config.OriginalAssets,
                ...Config.ProductConfig[brand].assets,
                "assets.json": {
                    ...Config.OriginalAssets["assets.json"],
                    contentURL: [
                        `http:///%host_prefix%%host%/${product === "adblock" ? "adblock" : "privacy"}/assets/v2/assets.json`,
                        "assets/assets.json"
                    ],
                }
            },
            path: '../../assets/',
            filename: 'assets.json',
            pretty: true
        };
    },
    copyFiles: (product, brand, destinationFolder, brandDestinationFolder) => {
        return [
            {from: '../src', to: brandDestinationFolder, ignore: ['test/**/*', '_locales/**/*', 'assets/**/*']},
            {
                from: `../build/app/icons/${product}/common/extensions_page`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/img/`)}`
            },
            {
                from: `../build/app/icons/${product}/common/navbar/`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/img/browsericons`)}`
            },
            {
                from: `../build/app/icons/${product}/${brand}/`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/img/browsericons`)}`
            },
            {
                from: `../build/extra/`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/extra/`)}`
            },
            {
                from: `../build/app/images/${brand}/`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/extra/img/`)}`
            },
            {
                from: `../build/app/images/common/`,
                to: `${path.resolve(__dirname, `${brandDestinationFolder}/extra/img/`)}`
            },
            {from: `./config/${product}/_locales/`, to: `${brandDestinationFolder}/_locales/`},
            {from: `../src/assets/resources`, to: `${brandDestinationFolder}/assets/resources`},
            {from: `../src/assets/ublock`, to: `${brandDestinationFolder}/assets/ublock`},
            {from: `./config/${product}/assets/`, to: `${brandDestinationFolder}/assets/`}
        ];
    }
};
