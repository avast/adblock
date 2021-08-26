import React, {createContext, useEffect, useState} from 'react'

const TabContext = createContext({});

const TabProvider = (props) => {
    const [tabId, setTabId] = useState(-1);

    useEffect(() => {
        setCurrentTab();
        return () => void (0);
    }, []);

    async function setCurrentTab() {
        setTabId((await getCurrentTab()).id);
    }

    function getCurrentTab() {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
                    resolve(tabs[0]);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    return (
        <TabContext.Provider value={{tabId, setTabId}}>
            {props.children}
        </TabContext.Provider>
    )
};

export default TabContext;

export {TabProvider}
