import React, {useContext} from "react";
import {css, StyleSheet} from "aphrodite";
import {GridStyle, ImgStyle} from "../../utils/UtilsStyle";
import ThemeContext from "../../utils/ThemeContext";
import Image from "../../common_components/Image";
import MessagesManager from "../../utils/MessagesManager";
import {useDispatch} from "react-redux";
import {goToOptionsRequestHeader} from "../../creators/popup.creator";

const Header = ({offShield, extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        styles = StyleSheet.create({
            headerWrapper: {
                height: 129,
                boxSizing: "border-box",
                color: "#e8eaed",
                fontSize: 16,
                fontWeight: 500
            },
            header: {
                height: 49,
                backgroundColor: theme.HeaderBackgroundColor,
                display: 'grid',
                gridTemplateRows: "14px 28px 7px"
            },
            headerContent: {
                padding: "0 19px 0 14px",
                ...GridStyle.setRow(2),
                alignItems: "center",
                display: 'grid',
                gridTemplateColumns: "max-content auto 28px",
            },
            title: {
                ...GridStyle.setCol(1)
            },
            settings: {
                ...GridStyle.setCol(3),
                height: 28,
                width: 28,
                alignItems: "center",
                display: "grid",
                ':hover': {
                    cursor: "pointer",
                    backgroundColor: theme.SettingsIconHover,
                    borderRadius: "50%"
                }
            },
            settingsIcon: {
                ...ImgStyle.setNonDraggable(),
                margin: "0 auto",
                height: 20,
                width: 20
            },
            imageWrapper: GridStyle.define("6px 75px", "auto max-content auto"),
            filledColor: {
                ...GridStyle.setCol(1, 4),
                ...GridStyle.setRow(1, 2),
                backgroundColor: theme.HeaderBackgroundColor
            },
            headerLogo: {
                ...GridStyle.setRow(1, 3),
                ...GridStyle.setCol(2),
                ...ImgStyle.setNonDraggable(),
                maxWidth: 320,
                height: 80
            }
        });

    function goToOptions() {
        dispatch(goToOptionsRequestHeader());
    }

    function onUserInteraction(event) {
        if (event.type === "click" || event.key === 'Enter') goToOptions();
    }

    return (
        <div className={css(styles.headerWrapper, extraStyle)}>
            <div className={css(styles.header)}>
                <div className={css(styles.headerContent)}>
                    <div className={css(styles.title)}>{MessagesManager.get("adBlock")}</div>
                    <div onClick={onUserInteraction} onKeyDown={onUserInteraction} className={css(styles.settings)}
                         aria-label={MessagesManager.get("openSettings")} tabIndex={0} role="button">
                        <Image extraStyle={styles.settingsIcon} name={"settings_icon.png"}/>
                    </div>
                </div>
            </div>
            <div className={css(styles.imageWrapper)}>
                <div className={css(styles.filledColor)}/>
                <Image extraStyle={styles.headerLogo} name={`header_logo${!offShield ? '' : '_disabled'}.png`}/>
            </div>
        </div>
    );
};

export default Header;
