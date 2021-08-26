import React, {useContext, useEffect} from 'react';
import {css, StyleSheet} from 'aphrodite';
import Header from "./Header";
import ThemeContext from "../../utils/ThemeContext";
import {useSelector} from "react-redux";
import AdsArea from "./AdsArea";
import {GridStyle} from "../../utils/UtilsStyle";
import Footer from "./Footer";
import TabContext from "../../utils/TabContext";
import MessagesManager from "../../utils/MessagesManager";

const Popup = () => {
    const {tabId} = useContext(TabContext),
        {
            isInternal,
            netFilteringSwitchExtra,
            pageBlockedRequestCount,
            domainIsPaused,
            netFilteringSwitch,
            isInUserWhitelist
        } = useSelector(state => tabId > 0 ? state.popup.tabs[tabId] : state.popup),
        {paused, blockingMode, off} = useSelector(state => state.main.settings),
        {theme} = useContext(ThemeContext),
        adsAreaInfo = {
            isInternal,
            paused,
            domainIsPaused,
            blockingMode,
            off,
            isInUserWhitelist,
            whitelisted: !netFilteringSwitch,
            amountAdsBlocked: pageBlockedRequestCount,
            pageBlockingStatus: netFilteringSwitchExtra
        },
        styles = StyleSheet.create({
            app: {
                minWidth: 320,
                minHeight: 246,
                backgroundColor: theme.AppBackgroundColor,
                display: 'grid',
                gridTemplateColumns: 'auto',
                gridTemplateRows: '129px auto max-content',
                fontFamily: '\'Roboto\', sans-serif',
                userSelect: "none"
            },
            header: GridStyle.setRow(1),
            adsArea: GridStyle.setRow(2),
            footer: GridStyle.setRow(3),
        }),
        offShield = paused || off || domainIsPaused || isInUserWhitelist || !netFilteringSwitch || isInternal;

    useEffect(() => {
        document.title = MessagesManager.get("adBlock")
        return () => void (0);
    }, []);

    return (
        <div className={css(styles.app)}>
            <Header offShield={offShield} extraStyle={styles.header}/>
            <AdsArea info={adsAreaInfo} extraStyle={styles.adsArea}/>
            {!offShield && <Footer extraStyle={styles.footer} blockingMode={blockingMode}/>}
        </div>
    );
};

export default Popup;
