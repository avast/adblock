const isDarkMode = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getExtensionId = () => {
    return chrome.runtime.id;
};

export {isDarkMode, getExtensionId};
