import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import ThemeContext from "../../utils/ThemeContext";
import TextDiv from "../../common_components/TextDiv";

const TopBar = ({extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            container: {
                ...GridStyle.define("17px max-content 19px", "24px max-content auto"),
                position: "fixed",
                width: "100%",
                backgroundColor: theme.HeaderBackgroundColor,
                color: theme.TopBarTextColor,
                letterSpacing: -0.6,
                height: 56,
                fontSize: 17,
                fontWeight: 500,
                zIndex: 2
            },
            text: GridStyle.setRowCol(2, 2)
        });

    return (
        <div className={css(styles.container, extraStyle)}>
            <TextDiv extraStyle={styles.text} text={MessagesManager.get("adBlockSettings")}/>
        </div>
    );
};

export default TopBar;
