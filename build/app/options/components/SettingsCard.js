import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import Image from "../../common_components/Image";
import ThemeContext from "../../utils/ThemeContext";
import {useSelector} from "react-redux";
import TextDiv from "../../common_components/TextDiv";

const SettingsCard = ({extraStyle, info, onClick}) => {
    const {theme} = useContext(ThemeContext),
        {blockingMode} = useSelector(state => state.main.settings),
        active = info.mode === blockingMode,
        styles = StyleSheet.create({
            card: {
                ...GridStyle.define("max-content 1fr 51px", "auto"),
                borderRadius: 4,
                border: active ? `2px solid ${theme.SettingsCardButtonActive}` : `2px solid ${theme.SettingsCardBorder}`,
                cursor: 'pointer'
            },
            topRow: {
                ...GridStyle.defineAndSet("18px 32px 10px max-content 12px", "auto max-content auto", 1, 1),
                color: theme.SettingsCardMainTextColor,
                textAlign: "center",
                fontSize: 16
            },
            modeIcon: {
                ...GridStyle.setRowCol(2, 2),
                width: 32,
                height: 32,
                margin: "0 auto"
            },
            modeName: GridStyle.setRowCol(4, 2),
            middleRow: {
                ...GridStyle.defineAndSet("max-content 8px max-content", "16px auto 16px", 2, 1),
                fontSize: 12,
                color: theme.SettingsLearnMoreTextColor,
                letterSpacing: -0.1
            },
            title: {
                ...GridStyle.setRowCol(1, 2),
                lineHeight: "17px",
                "> b": {
                    fontWeight: 500
                }
            },
            messagesContainer: {
                ...GridStyle.defineAndSet(`repeat(${info.messages.length}, max-content)`, "auto", 3, 2),
                gridRowGap: "5px",
                color: theme.SettingsCardSecondaryTextColor,
            },
            message: GridStyle.define("max-content", "11px 7px auto"),
            messageIcon: {
                ...GridStyle.setCol(1),
                width: 11,
                height: 10
            },
            messageText: GridStyle.setCol(3),
            bottomRow: GridStyle.defineAndSet("18px 16px 20px", "auto 16px auto", 3, 1),
            button: {
                ...GridStyle.defineAndSet("2px 8px 2px", "2px 8px 2px", 2, 2),
                width: 16,
                height: 16,
                boxSizing: "border-box",
                borderRadius: "50%",
                border: `2px solid ${active ? theme.SettingsCardButtonActive : theme.SettingsCardButton}`
            },
            buttonActive: {
                ...GridStyle.setRowCol(2, 2),
                backgroundColor: theme.SettingsCardButtonActive,
                borderRadius: "50%"
            }
        });

    function setMode(e) {
        if (!active && (e.target.tagName !== "A")) onClick(info.mode, active);
    }

    function onUserInteraction(event) {
        if (event.key === 'Enter' || event.type === "click") setMode(event);
    }

    return (
        <div className={css(styles.card, extraStyle)} onClick={onUserInteraction}
             onKeyDown={onUserInteraction} tabIndex={0} role="button"
             aria-label={info.accessibleName} aria-checked={active}>
            <div className={css(styles.topRow)}>
                <Image name={info.logo.replace(".png", active ? "_active.png" : ".png")} extraStyle={styles.modeIcon}/>
                <TextDiv text={info.name} extraStyle={styles.modeName}/>
            </div>
            <div className={css(styles.middleRow)}>
                <TextDiv extraStyle={styles.title} text={info.title}/>
                <div className={css(styles.messagesContainer)}>
                    {info.messages.map((message, i) =>
                        <div key={i} className={css(styles.message)}>
                            <Image name={"settings_card_tick.png"} extraStyle={styles.messageIcon}/>
                            <TextDiv extraStyle={styles.messageText} text={message.string}/>
                        </div>
                    )}
                </div>
            </div>
            <div className={css(styles.bottomRow)}>
                <div className={css(styles.button)}>
                    {active && <div className={css(styles.buttonActive)}/>}
                </div>
            </div>
        </div>
    );
};

export default SettingsCard;
