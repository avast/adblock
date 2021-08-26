import React, {useEffect} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import {AdBlockPrimaryButton} from "../../common_components/AdBlockButtons";
import {useDispatch} from "react-redux";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import {pauseAllRequest, popupShown} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";

const InternalAdsArea = () => {
    const dispatch = useDispatch(),
        styles = StyleSheet.create({
            internalAdsContainer: {
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
            button: GridStyle.setRowCol(1, 2)
        });

    useEffect(() => {
        dispatch(popupShown({pageName: TrackingConfig.PageNames.INTERNAL}));
        return () => void (0);
    }, []);

    function pauseAll() {
        dispatch(pauseAllRequest());
    }

    return (
        <div className={css(styles.internalAdsContainer)}>
            <AdsAreaTitle text={MessagesManager.get("noAdsToBlock")} extraStyle={styles.title}/>
            <div className={css(styles.buttonWrapper)}>
                <AdBlockPrimaryButton text={MessagesManager.get("pauseAdBlockOnAllSites")}
                                      accessibleName={MessagesManager.get("pauseAdBlockOnAllSites")}
                                      extraStyle={styles.button}
                                      onClick={pauseAll}/>
            </div>
        </div>
    );
};

export default InternalAdsArea;
