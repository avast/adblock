import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'webext-redux';
import Popup from "./popup/containers/Popup";
import {ThemeProvider} from "./utils/ThemeContext";
import {TabProvider} from "./utils/TabContext";

const store = new Store();

store.ready().then(() => {
    render(
        <Provider store={store}>
            <ThemeProvider>
                <TabProvider>
                    <Popup/>
                </TabProvider>
            </ThemeProvider>
        </Provider>,
        document.getElementById('root'));
});
