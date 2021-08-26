import React, {forwardRef, useContext, useImperativeHandle, useState} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import {AdBlockPrimaryButton, AdBlockSecondaryButton} from "../../common_components/AdBlockButtons";
import TextDiv from "../../common_components/TextDiv";

const WhitelistModal = ({onClick, title, innerRef, accessibleNames}) => {
    const [url, setUrl] = useState(null),
        [originalUrl, setOriginalUrl] = useState(null),
        [visible, setVisible] = useState(false),
        {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            modalContainer: {
                ...GridStyle.define("auto 201px auto", "auto 512px auto"),
                backgroundColor: theme.SettingsModalBackground,
                position: "fixed",
                width: "100%",
                height: "100%",
                left: 0,
                top: 0,
                zIndex: 6
            },
            modalWrapper: {
                ...GridStyle.defineAndSet("auto", "auto", 2, 2),
                backgroundColor: theme.SettingsModalBackgroundColor,
                padding: "16px 20px 16px 20px",
                borderRadius: 8,
                boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.24)",
            },
            modalContent: GridStyle.defineAndSet("21px 10px max-content 51px 32px", "auto", 1, 1),
            modalTitle: {
                ...GridStyle.setRowCol(1, 1),
                fontSize: 15,
                color: theme.SettingsWhitelistModalTitle,
                alignItems: "center"
            },
            modalInput: GridStyle.defineAndSet("17px 6px 32px", "auto", 3, 1),
            buttons: GridStyle.defineAndSet("32px", "auto max-content 8px max-content", 5, 1),
            modalInputText: {
                ...GridStyle.setRow(1),
                color: theme.SettingsWhitelistModalInputTitle,
                fontSize: 10,
                letterSpacing: 0.1,
                fontWeight: 500
            },
            modalInputInput: {
                ...GridStyle.setRow(3),
                backgroundColor: theme.SettingsWhitelistInputBackground,
                color: theme.SettingsWhitelistModalInputText,
                border: 0,
                borderBottom: `1px solid ${theme.SettingsWhitelistInputBorder}`,
                fontSize: 13,
                padding: "7px 8px 9px 8px",
                borderRadius: 3,
                outlineColor: "transparent",
                ':hover': {
                    cursor: "auto"
                },
                ":focus": {
                    outline: "unset"
                }
            },
            buttonCancel: GridStyle.setRowCol(1, 2),
            buttonAdd: {
                ...GridStyle.setRowCol(1, 4),
                opacity: url ? 1 : 0.4,
                pointerEvents: url ? "auto" : "none"
            }
        });

    function onkeydown(e) {
        if (e.key === "Enter" && url) onClick(url, originalUrl);
    }

    function close() {
        setVisible(false);
    }

    useImperativeHandle(innerRef, () => ({
        show(url = "") {
            setUrl(url);
            setOriginalUrl(url);
            setVisible(true);
        },
        close() {
            setVisible(false);
        }
    }));

    return (
        <React.Fragment>
            {visible && <div className={css(styles.modalContainer)} onClick={close} aria-hidden={!visible}>
                <div className={css(styles.modalWrapper)} onClick={(e) => e.stopPropagation()}>
                    <div className={css(styles.modalContent)} role="dialog"
                         aria-labelledby={MessagesManager.get("whitelistModalDescription")}>
                        <TextDiv extraStyle={styles.modalTitle} text={title}/>
                        <div className={css(styles.modalInput)}>
                            <TextDiv text={MessagesManager.get("site")} extraStyle={styles.modalInputText}/>
                            <input aria-label={title} value={url} onChange={(e) => setUrl(e.target.value)}
                                   onKeyDown={onkeydown} className={css(styles.modalInputInput)} type="text" autoFocus/>
                        </div>
                        <div className={css(styles.buttons)}>
                            <AdBlockSecondaryButton text={MessagesManager.get("cancel")} minWidth={"max-content"}
                                                    accessibleName={accessibleNames.cancel}
                                                    extraStyle={styles.buttonCancel} onClick={close}/>
                            <AdBlockPrimaryButton text={MessagesManager.get("save")} minWidth={"max-content"}
                                                  accessibleName={accessibleNames.save}
                                                  extraStyle={styles.buttonAdd}
                                                  onClick={() => onClick(url, originalUrl)}/>
                        </div>
                    </div>
                </div>
            </div>}
        </React.Fragment>
    );
};

const AddWhitelistModal = forwardRef(({onClick}, ref) => {
    return (
        <WhitelistModal accessibleNames={{
            save: MessagesManager.get("saveSiteIntoWhitelist"),
            cancel: MessagesManager.get("cancelAddSiteOperation")
        }} title={MessagesManager.get("addSite")} onClick={onClick} innerRef={ref}/>
    );
});

const EditWhitelistModal = forwardRef(({onClick}, ref) => {
    return (
        <WhitelistModal accessibleNames={{
            save: MessagesManager.get("editSiteFromWhitelist"),
            cancel: MessagesManager.get("cancelEditSiteOperation")
        }} title={MessagesManager.get("edit")} onClick={onClick} innerRef={ref}/>
    );
});
export {AddWhitelistModal, EditWhitelistModal};
