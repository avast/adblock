const path = require('path'),
    CopyPlugin = require('copy-webpack-plugin'),
    ChromeExtensionManifest = require('chrome-extension-manifest-webpack-plugin'),
    WriteJsonPlugin = require('write-json-webpack-plugin'),
    webpack = require("webpack"),
    WebpackCommon = require('./webpack-common');

module.exports = (args) => {
    const Config = {
        ProductConfig: require(`./config/${args.product}/${args.product}.config.json`),
        OriginalManifest: require('./config/manifests/manifest_dev.json'),
        OriginalAssets: require(`./config/${args.product}/assets/assets.json`)
    };

    let destinationFolder = path.resolve(__dirname, `../bin-webpack/dev/${args.product}`),
        brandDestinationFolder = path.resolve(__dirname, `${destinationFolder}/${args.brand}`);

    return {
        devtool: "eval-cheap-module-source-map",
        entry: {
            popup: './app/popup.js',
            background: './app/background.js',
            options: './app/options.js'
        },
        mode: "development",
        output: {
            path: path.resolve(__dirname, `${brandDestinationFolder}/extra/js`),
            filename: '[name].bundle.js',
            chunkFilename: '[id].chunk.js'
        },
        plugins: [
            new CopyPlugin(WebpackCommon.copyFiles(args.product, args.brand, destinationFolder, brandDestinationFolder), {debug: 'debug'}),
            new ChromeExtensionManifest({
                inputFile: './config/manifests/manifest_dev.json',
                outputFile: `${path.resolve(__dirname, `${brandDestinationFolder}/manifest.json`)}`,
                props: {
                    browser_action: {
                        ...Config.OriginalManifest.browser_action,
                        default_title: Config.ProductConfig[args.brand].title
                    },
                    name: Config.ProductConfig[args.brand].title,
                    short_name: Config.ProductConfig[args.brand].title,
                    key: Config.ProductConfig[args.brand].key
                }
            }),
            new WriteJsonPlugin(WebpackCommon.combineAssetsFile(args.product, args.brand, Config)),
            new webpack.DefinePlugin(WebpackCommon.getEnvironmentVariables(args.product, args.brand, Config, true))
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
