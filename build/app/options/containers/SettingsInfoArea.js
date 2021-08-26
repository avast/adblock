import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import Image from "../../common_components/Image";
import MessagesManager from "../../utils/MessagesManager";
import {useDispatch, useSelector} from "react-redux";
import ToggleSwitchMapped from "../components/ToggleSwitchMapped";
import {turnOnOffRequest} from "../../creators/options.creator";

const SettingsInfoArea = ({extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        {blockingMode, off} = useSelector(state => state.main.settings),
        styles = StyleSheet.create({
            container: {
                display: "grid",
                gridTemplateColumns: "auto max-content auto",
                gridTemplateRows: "max-content 16px max-content 22px"
            },
            content: {
                ...GridStyle.setRowCol(1, 2),
                display: "grid",
                gridTemplateColumns: "max-content",
                gridTemplateRows: "24px 50px 10px max-content 4px max-content"
            },
            switch: GridStyle.setRowCol(3, 2),
            logo: {
                ...GridStyle.setRow(2),
                width: 50,
                height: 50,
                margin: "0 auto"
            },
            title: {
                ...GridStyle.setRow(4),
                color: theme.SettingsInfoTitle,
                fontSize: 17,
                textAlign: "center"
            },
            secondTitle: {
                ...GridStyle.setRow(6),
                fontSize: 14,
                textAlign: "center",
                color: theme.SettingsInfoSecondTitle
            }
        });

    return (
        <div className={css(styles.container, extraStyle)}>
            <div className={css(styles.content)}>
                <Image extraStyle={styles.logo} name={"options_logo.png"}/>
                <div className={css(styles.title)}>
                    {MessagesManager.get("adBlock")}
                </div>
                <div className={css(styles.secondTitle)}>
                    {MessagesManager.get("indexDescription")}
                </div>
            </div>
            <ToggleSwitchMapped onClick={() => dispatch(turnOnOffRequest({blockingMode: off ? blockingMode : "off"}))}
                                accessibleName={MessagesManager.get(off? "turnOn": "turnOff")}
                                extraStyle={styles.switch} mappedValue={!off}/>
        </div>
    );
};

export default SettingsInfoArea;
