import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import ToggleSwitch from "../components/ToggleSwitch";
import {useDispatch, useSelector} from "react-redux";
import * as Actions from "../../creators/options.creator";

const MainSettings = ({extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        {showIconBadge} = useSelector(state => state.main.settings),
        dispatch = useDispatch(),
        styles = StyleSheet.create({
            mainSettings: {
                ...GridStyle.define("32px max-content 20px 44px 52px", "20px auto 20px"),
                fontSize: 13
            },
            generalSettings: {
                ...GridStyle.setRowCol(2, 2),
                color: theme.SettingsBlockingOptionsTextColor,
                fontWeight: 500
            },
            showBadge: {
                ...GridStyle.defineAndSet("auto", "1fr 50px", 4, 2),
                alignItems: "center",
                color: theme.SettingsGeneralTextColor,
                fontWeight: "normal"
            },
            showBadgeText: GridStyle.setCol(1),
            showBadgeToggleSwitch: GridStyle.setCol(2)
        });

    return (
        <div className={css(styles.mainSettings, extraStyle)}>
            <div className={css(styles.generalSettings)}>
                {MessagesManager.get("generalSettings")}
            </div>
            <div className={css(styles.showBadge)}>
                <div className={css(styles.showBadgeText)}>
                    {MessagesManager.get("settingsShowNumberBadge")}
                </div>
                <ToggleSwitch extraStyle={styles.showBadgeToggleSwitch} initialValue={showIconBadge}
                              accessibleName={MessagesManager.get(!showIconBadge ? "showAmountAds" : "hideAmountAds")}
                              onClick={() => dispatch(Actions.toggleShowBadgeRequest())}/>
            </div>
        </div>
    );
};

export default MainSettings;
