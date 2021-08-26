import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import SettingsInfoArea from "./SettingsInfoArea";
import SettingsModeArea from "./SettingsModeArea";
import MainSettings from "./MainSettings";
import WhitelistSettings from "../components/WhitelistSettings";
import MessagesManager from "../../utils/MessagesManager";
import {useSelector} from "react-redux";

const Settings = ({extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        {whitelist, ublockUrl} = useSelector(state => state.popup),
        styles = StyleSheet.create({
            container: {
                ...GridStyle.define("max-content", "auto 680px auto"),
                backgroundColor: theme.OptionsPageBackground,
            },
            settingsWrapper: {
                ...GridStyle.defineAndSet("max-content 35px 152px max-content 52px 35px", "auto", 1, 2),
                backgroundColor: theme.SettingsBackground,
                boxShadow: theme.SettingsShadow,
                borderRadius: 4
            },
            settings: GridStyle.defineAndSet("max-content max-content max-content", "20px auto 20px", 1, 1),
            separator: {
                ...GridStyle.setRowCol(2, 1),
                borderBottom: `1px solid ${theme.SettingsModeSeparator}`
            },
            mainSettings: GridStyle.setRowCol(3, 1),
            whitelistSettings: GridStyle.setRowCol(4, 1),
            powered: {
                ...GridStyle.defineAndSet("9px auto 9px", "auto max-content auto", 6, 1),
                backgroundColor: theme.SettingsPoweredBackground,
                color: theme.SettingsPoweredColorText,
                fontSize: 12,
                textAlign: "center",
                alignItems: "center"
            },
            poweredText: GridStyle.setRowCol(2, 2),
            infoArea: GridStyle.setRowCol(1, 2),
            modeArea: GridStyle.setRowCol(2, 2)
        });

    function getPoweredByMessage() {
        return MessagesManager.get("poweredByUblock").replace("__SET_HREF__", ublockUrl);
    }

    return (
        <div className={css(styles.container, extraStyle)}>
            <div className={css(styles.settingsWrapper)}>
                <div className={css(styles.settings)}>
                    <SettingsInfoArea extraStyle={styles.infoArea}/>
                    <SettingsModeArea extraStyle={styles.modeArea}/>
                </div>
                <div className={css(styles.separator)}/>
                <MainSettings extraStyle={styles.mainSettings}/>
                <WhitelistSettings whitelist={whitelist} extraStyle={styles.whitelistSettings}/>
                <div className={css(styles.powered)}>
                    <div className={css(styles.poweredText)} dangerouslySetInnerHTML={{__html: getPoweredByMessage()}}/>
                </div>
            </div>
        </div>
    );
};

export default Settings;
