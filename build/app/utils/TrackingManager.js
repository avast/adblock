import StoreManager from "./StoreManager";
import TrackingConfig from "./TrackingConfig";

/*
 * This is a workaround to avoid excessive rendering and extra calculation of Header and Footer components
 * in order to get the page_name value. The shown event is fired once the screen is loaded and before any
 * possible click. So, it will always stored the current page_name of where the current click is having place.
 */
const Cache = {
    PAGE_NAME: TrackingConfig.PageNames.BLOCKING
};

export default class TrackingManager {
    static registerShown(pageName) {
        // There was a shown event. Then all the following click events must come from the stored page_name.
        setPageName(pageName);

        registerEvent(chrome.avast.stats.EventType.PAGE, {
            "group.page.page_name": pageName.toString()
        });
    }

    static registerClick(action) {
        registerEvent(chrome.avast.stats.EventType.CLICK, {
            "group.page.page_name": (action.pageName || Cache.PAGE_NAME).toString(),
            "event_action": action.eventAction
        });
    }

    static setPageName(pageName) {
        setPageName(pageName);
    }
}

function registerEvent(eventType, eventInfo) {
    const EVENT = {...eventInfo, ...getCommonEventData()};

    chrome.avast.stats.add(eventType, EVENT);
    console.log("TRACKING_REGISTERING:", eventType, EVENT);
}

function getCommonEventData() {
    return {
        "group.extension.version": chrome.runtime.getManifest().version,
        "group.extension.id": chrome.runtime.id,
        "event_category": StoreManager.state.main.settings.blockingMode,
        "page_domain": "adblock",
        "page_location": "secure://adblock"
    };
}

function setPageName(pageName) {
    Cache.PAGE_NAME = pageName;
}
