export default {
    popup: {
        enabled: false,
        tabs: {}
    },
    main: {
        settings: {
            paused: false,
            off: false,
            blockingMode: "balanced",
            showIconBadge: true
        },
        pausedDomains: [],
        adsWhitelist: {},
        defaultInternalWhitelist: process.env.CONFIG.whitelistDefault,
        whitelistAfterRedirect: process.env.CONFIG.whitelistAfterRedirect,
        essentialWhitelist: process.env.CONFIG.essentialWhitelist,
    },
    tabs: {
        active: false
    }
};
