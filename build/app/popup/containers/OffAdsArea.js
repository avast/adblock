import React, {useEffect} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import {AdBlockPrimaryButton} from "../../common_components/AdBlockButtons";
import {useDispatch} from "react-redux";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import {popupShown, turnOnRequest} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";

const OffAdsArea = ({blockingMode}) => {
    const dispatch = useDispatch(),
        styles = StyleSheet.create({
            offAdsContainer: {
                display: "grid",
                gridTemplateRows: "14px auto 18px max-content 30px",
                alignItems: "center"
            },
            title: GridStyle.setRow(2),
            buttonWrapper: {
                display: "grid",
                gridTemplateRows: "max-content",
                gridTemplateColumns: "auto max-content auto",
                ...GridStyle.setRow(4),
            },
            button: GridStyle.setRowCol(1, 2),
        });

    useEffect(() => {
        dispatch(popupShown({pageName: TrackingConfig.PageNames.OFF}));
        return () => void (0);
    }, []);

    function turnOn() {
        dispatch(turnOnRequest({blockingMode}));
    }

    return (
        <div className={css(styles.offAdsContainer)}>
            <AdsAreaTitle text={MessagesManager.get("adblockIsOff")}
                          extraStyle={styles.title}/>
            <div className={css(styles.buttonWrapper)}>
                <AdBlockPrimaryButton text={MessagesManager.get("turnAdblockOn")}
                                      minWidth={"auto"}
                                      onClick={turnOn}
                                      extraStyle={styles.button}/>
            </div>
        </div>
    );
};

export default OffAdsArea;
