# How to install
```
git clone git@git.int.avast.com:extensions/extension-adblock.git
cd extension-adblock\build
npm install
```

# How to build for production
It will produce artifacts for AdBlock and Anti-Tracking and its CRX files
```
npm run build
```

# How to build for development
```
npm run dev [-- product [brand]]
```
Arguments are optional. Possible parameter values are the following:
- product: adblock | anti-tracking
- brand: avast | avg | ccleaner

# How to update the core
1. Download the latest released version from https://github.com/gorhill/uBlock/releases/ or install it in the browser and take it from the filesystem
2. Copy all the /src content into our /src
3. Compare the new manifest from the /src with ours from /build/config/manifests
4. Rewrite in console.js, messaging.js and background.js and pagestore.js the changes we have done to the core (easy to check with git history) or by searching by CORE_V2
5. Add to background.html our background script file to be loaded at the end
6. Test the extension and look for possible errors caused by changes into the core's API.

# Workspace structure
- __bin-webpack__ - output folder for development and production
- __build__ - our extension implementation
- __build\app__ - application files (JS, image and HTML files)
- __build\config__ - configuration files and specific translations
- __build\\extra__ - popup and options page (this folder will be copy into the original source during build process)
- __build\\keys__ - PEM key files
- __build\webpack__ - development and production building scripts
- __src__ - original source code folder from uBlock
