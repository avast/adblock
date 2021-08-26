import {css, StyleSheet} from "aphrodite";
import React, {forwardRef, useContext, useImperativeHandle, useState} from 'react';
import {GridStyle} from "../../utils/UtilsStyle";
import ThemeContext from "../../utils/ThemeContext";
import Image from "../../common_components/Image";
import MessagesManager from "../../utils/MessagesManager";
import TextDiv from "../../common_components/TextDiv";
import {AdBlockPrimaryButton, AdBlockSecondaryButton} from "../../common_components/AdBlockButtons";
import {useDispatch, useSelector} from "react-redux";
import {keepModeRequest, strictModalShown} from "../../creators/options.creator";
import {setPageName} from "../../creators/main.creator";
import TrackingConfig from "../../utils/TrackingConfig";

const StrictModeConfirmationModal = forwardRef(({onClick}, ref) => {
        const [visible, setVisible] = useState(false),
            dispatch = useDispatch(),
            {blockingMode} = useSelector(state => state.main.settings),
            {theme} = useContext(ThemeContext),
            styles = StyleSheet.create({
                container: {
                    ...GridStyle.define("30px max-content auto", "auto 520px auto"),
                    backgroundColor: theme.SettingsModalBackground,
                    position: "fixed",
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    zIndex: 6
                },
                modalWrapper: {
                    ...GridStyle.defineAndSet("10px 50px 16px max-content 8px max-content 16px max-content", "auto", 2, 2),
                    backgroundColor: theme.SettingsModalBackgroundColor,
                    padding: "12px 12px 24px 30px",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.24)",
                },
                closeIcon: {
                    ...GridStyle.defineAndSet("10px", "1fr", 1, 1),
                    width: 10,
                    height: 10,
                    marginLeft: "auto",
                    cursor: "pointer"
                },
                support: {
                    ...GridStyle.defineAndSet("50px", "1fr", 2, 1),
                    width: 50,
                    height: 50,
                    margin: "0 auto"
                },
                setStrict: {
                    ...GridStyle.defineAndSet("max-content", "1fr", 4, 1),
                    color: theme.SettingsStrictSetStrict,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: 500
                },
                description: {
                    ...GridStyle.defineAndSet("max-content", "1fr", 6, 1),
                    color: theme.SettingsStrictSetStrictDescription,
                    textAlign: "center",
                    fontSize: 14
                },
                buttonsWrapper: {
                    ...GridStyle.defineAndSet("max-content", "max-content 8px max-content", 8, 1),
                    justifyContent: "center"
                },
                setStrictButton: GridStyle.setRowCol(1, 1),
                keepButton: GridStyle.setRowCol(1, 3),
            });

        useImperativeHandle(ref, () => ({
            show() {
                dispatch(strictModalShown());
                setVisible(true);
            }
        }));

        function close() {
            dispatch(setPageName({pageName: TrackingConfig.PageNames.OPTIONS}));
            setVisible(false);
        }

        function onConfirm() {
            onClick();
            close();
        }

        function keepMode() {
            dispatch(keepModeRequest({blockingMode}));
            close();
        }

        return (
            <React.Fragment>
                {visible && <div className={css(styles.container)} onClick={close} aria-hidden={!visible}>
                    <div className={css(styles.modalWrapper)} onClick={(e) => e.stopPropagation()}
                         role="dialog" aria-labelledby={MessagesManager.get("setStrictTitle")}>
                        <Image name={"strict_close.png"} extraStyle={styles.closeIcon} onClick={close}
                               alt={MessagesManager.get("cancelSetStrict")}/>
                        <Image name={"support.png"} extraStyle={styles.support}/>
                        <TextDiv extraStyle={styles.setStrict} text={MessagesManager.get("setStrictTitle")}/>
                        <TextDiv text={MessagesManager.get(`setStrictDescription_${process.env.BRAND}`)}
                                 extraStyle={styles.description}/>
                        <div className={css(styles.buttonsWrapper)}>
                            <AdBlockSecondaryButton extraStyle={styles.setStrictButton} minWidth={"max-content"}
                                                    accessibleName={MessagesManager.get("setStrictMode")}
                                                    text={MessagesManager.get("setStrict")} onClick={onConfirm}/>
                            <AdBlockPrimaryButton extraStyle={styles.keepButton} onClick={keepMode} minWidth={"max-content"}
                                                  accessibleName={MessagesManager.get(`stayOn_${blockingMode}`)}
                                                  text={MessagesManager.get(`keep_${blockingMode}`)}/>

                        </div>
                    </div>
                </div>}
            </React.Fragment>
        );
    }
);

export default StrictModeConfirmationModal;
