import React, {useEffect} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import {AdBlockPrimaryButton, AdBlockSecondaryButton} from "../../common_components/AdBlockButtons";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import {useDispatch} from "react-redux";
import {pauseAllRequest, popupShown, removeSiteFromWhitelistRequest} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";

const UserWhitelistedAdsArea = () => {
    const dispatch = useDispatch(),
        styles = StyleSheet.create({
            blockingAdsContainer: {
                display: "grid",
                gridTemplateRows: "14px auto 18px max-content 30px",
            },
            title: GridStyle.setRow(2),
            buttonsContainer: {
                ...GridStyle.setRow(4),
                display: "grid",
                gridTemplateColumns: "auto max-content auto",
                gridTemplateRows: `auto 8px auto`,
            },
            primaryButton: GridStyle.setRowCol(1, 2),
            secondaryButton: GridStyle.setRowCol(3, 2)
        });


    useEffect(() => {
        dispatch(popupShown({pageName: TrackingConfig.PageNames.USER_WHITELISTED}));
        return () => void (0);
    }, []);

    function pauseAll() {
        dispatch(pauseAllRequest());
    }

    function removeSiteFromWhitelist() {
        dispatch(removeSiteFromWhitelistRequest());
    }

    return (
        <div className={css(styles.blockingAdsContainer)}>
            <AdsAreaTitle text={MessagesManager.get("youHaveAllowAdsOnThisSite")} extraStyle={styles.title}/>
            <div className={css(styles.buttonsContainer)}>
                <AdBlockPrimaryButton text={MessagesManager.get("blockAdsOnThisSite")}
                                      extraStyle={styles.primaryButton}
                                      onClick={removeSiteFromWhitelist}/>
                <AdBlockSecondaryButton text={MessagesManager.get("pauseAdBlockOnAllSites")}
                                        extraStyle={styles.secondaryButton}
                                        onClick={pauseAll}/>
            </div>
        </div>
    );
};

export default UserWhitelistedAdsArea;
