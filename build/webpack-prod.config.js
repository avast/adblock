const path = require('path'),
    CopyPlugin = require('copy-webpack-plugin'),
    ChromeExtensionManifest = require('chrome-extension-manifest-webpack-plugin'),
    WriteJsonPlugin = require('write-json-webpack-plugin'),
    webpack = require("webpack"),
    RemoteFilePlugin = require('remote-file-webpack-plugin'),
    WebpackCrx = require("webpack-crx"),
    WebpackCommon = require('./webpack-common');

module.exports = (args) => {
    const Config = {
        ProductConfig: require(`./config/${args.product}/${args.product}.config.json`),
        OriginalManifest: require('./config/manifests/manifest_dev.json'),
        OriginalAssets: require(`./config/${args.product}/assets/assets.json`)
    };

    let destinationFolder = path.resolve(__dirname, `../bin-webpack/prod/${args.product}`),
        assetsRelativeFolder = `../../../../../../build/config/${args.product}/assets`,
        serverUrl = `https://dev-update.${args.brand}browser.com/adblock`,
        brandDestinationFolder = path.resolve(__dirname, `${destinationFolder}/${args.brand}`);

    return {
        entry: {
            popup: './app/popup.js',
            background: './app/background.js',
            options: './app/options.js'
        },
        mode: "production",
        output: {
            path: path.resolve(__dirname, `${brandDestinationFolder}/extra/js`),
            filename: '[name].bundle.js',
            chunkFilename: '[id].chunk.js'
        },
        plugins: [
            new CopyPlugin(WebpackCommon.copyFiles(args.product, args.brand, destinationFolder, brandDestinationFolder), {debug: 'debug'}),
            new ChromeExtensionManifest({
                inputFile: './config/manifests/manifest_prod.json',
                outputFile: `${path.resolve(__dirname, `${brandDestinationFolder}/manifest.json`)}`,
                props: {
                    browser_action: {
                        ...Config.OriginalManifest.browser_action,
                        default_title: Config.ProductConfig[args.brand].title
                    },
                    name: Config.ProductConfig[args.brand].title,
                    short_name: Config.ProductConfig[args.brand].title,
                    key: Config.ProductConfig[args.brand].key,
                    version: args.version
                }
            }),
            new WebpackCrx({
                key: path.join(__dirname, `./keys/${args.product}/${args.brand}.pem`),
                src: brandDestinationFolder,
                dest: destinationFolder,
                name: `${args.product}.${args.brand}-${args.version}`
            }),
            new WriteJsonPlugin(WebpackCommon.combineAssetsFile(args.product, args.brand, Config)),
            ...args.version === "2.0.0.1" ? [new RemoteFilePlugin([
                {
                    url: `${serverUrl}/whitelist.txt`,
                    filepath: `${assetsRelativeFolder}/whitelist.txt`,
                    cache: true
                },
                {
                    url: `${serverUrl}/whitelistAfterRedirect.txt`,
                    filepath: `${assetsRelativeFolder}/whitelistAfterRedirect.txt`,
                    cache: true
                },
                {
                    url: `${serverUrl}/cba.txt`,
                    filepath: `${assetsRelativeFolder}/cba.txt`,
                    cache: true
                },
                {
                    url: `${serverUrl}/assets/ads/easylist.txt`,
                    filepath: `${assetsRelativeFolder}/ads/easylist.txt`,
                    cache: true
                },
                {
                    url: `${serverUrl}/filterlist.txt`,
                    filepath: `${assetsRelativeFolder}/default/internal-filter.txt`,
                    cache: true
                },
                {
                    url: "https://easylist-downloads.adblockplus.org/exceptionrules.txt",
                    filepath: `${assetsRelativeFolder}/acceptable/exceptionrules.txt`,
                    cache: true
                }
            ])] : [],
            new webpack.DefinePlugin(WebpackCommon.getEnvironmentVariables(args.product, args.brand, Config, false))
        ],
        resolve: {
            extensions: ['*', '.js']
        },
        module: {
            rules: [
                {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
                {
                    test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    use: 'base64-inline-loader?limit=1000&name=[name].[ext]'
                }
            ]
        }
    }
};
