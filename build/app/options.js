import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'webext-redux';
import {ThemeProvider} from "./utils/ThemeContext";
import Options from "./options/containers/Options";

const store = new Store();

store.ready().then(() => {
    render(
        <Provider store={store}>
            <ThemeProvider>
                <Options/>
            </ThemeProvider>
        </Provider>,
        document.getElementById('root'));
});
