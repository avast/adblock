import MessagesManager from "../../utils/MessagesManager";
import {css, StyleSheet} from "aphrodite";
import React, {useContext} from 'react';
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import Image from "../../common_components/Image";
import {useDispatch} from "react-redux";
import {goToOptionsRequestFooter} from "../../creators/popup.creator";

const Footer = ({blockingMode, extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        styles = StyleSheet.create({
            footer: {
                display: "grid",
                gridTemplateRows: "6px 24px 8px",
                gridTemplateColumns: "auto max-content auto",
                backgroundColor: theme.FooterBackground,
                height: 38
            },
            footerContent: {
                ...GridStyle.setRowCol(2, 2),
                display: "grid",
                gridTemplateColumns: "auto 3px 24px",
                gridTemplateRows: "24px",
                color: theme.FooterBackgroundText,
                fontSize: 12,
                textAlign: "center",
                alignItems: "center"
            },
            textWrapper: {
                ...GridStyle.setRowCol(1, 1),
            },
            infoWrapper: {
                ...GridStyle.setRowCol(1, 3),
                display: "grid",
                alignItems: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                ':hover': {
                    backgroundColor: theme.InfoIconHover,
                    cursor: "pointer"
                },
                ':active': {
                    backgroundColor: theme.InfoIconActive,
                    cursor: "pointer"
                }
            },
            info: {
                margin: "0 auto",
                width: 14,
                height: 14,
            }
        });

    function goToOptions() {
        dispatch(goToOptionsRequestFooter());
    }

    function onUserInteraction(event) {
        if (event.type === "click" || event.key === 'Enter') goToOptions();
    }

    return (
        <div className={css(styles.footer, extraStyle)}>
            <div className={css(styles.footerContent)}>
                <div className={css(styles.textWrapper)}>
                    {MessagesManager.get(`${blockingMode}Blocking`)}
                </div>
                <div onClick={onUserInteraction} onKeyDown={onUserInteraction} role="button"
                     aria-label={MessagesManager.get("openSettings")}
                     tabIndex={0} className={css(styles.infoWrapper)}>
                    <Image name={"info_icon.png"} extraStyle={styles.info}/>
                </div>
            </div>
        </div>
    );
};

export default Footer;
