import React, {useEffect} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import {AdBlockPrimaryButton} from "../../common_components/AdBlockButtons";
import {useDispatch} from "react-redux";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import {popupShown, unpauseAllRequest, unpauseOnSiteRequest} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";

const PausedAdsArea = ({global}) => {
    const dispatch = useDispatch(),
        styles = StyleSheet.create({
            pausedAdsContainer: {
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
        dispatch(popupShown({pageName: global ? TrackingConfig.PageNames.ALL_PAUSED : TrackingConfig.PageNames.SITE_PAUSED}));
        return () => void (0);
    }, []);

    function unpauseAll() {
        dispatch(unpauseAllRequest());
    }

    function unpauseOnSite() {
        dispatch(unpauseOnSiteRequest());
    }

    return (
        <div className={css(styles.pausedAdsContainer)}>
            <AdsAreaTitle text={MessagesManager.get(global ? "adblockIsPaused" : "adblockIsPausedOnSite")}
                          extraStyle={styles.title}/>
            <div className={css(styles.buttonWrapper)}>
                <AdBlockPrimaryButton text={MessagesManager.get("unpauseAdblockOnAllSites")}
                                      accessibleName={MessagesManager.get("unpauseAdBlockAllSites")}
                                      minWidth={"auto"}
                                      onClick={global ? unpauseAll : unpauseOnSite}
                                      extraStyle={styles.button}/>
            </div>
        </div>
    );
};

export default PausedAdsArea;
