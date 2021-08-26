import React, {useEffect, useState} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import {AdBlockSecondaryButton} from "../../common_components/AdBlockButtons";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import AdBlockExpandableButton from "../components/AdBlockExpandableButton";
import {useDispatch} from "react-redux";
import {addSiteToWhitelistRequest, pauseAllRequest, pauseOnSiteRequest, popupShown} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";
import useComponentVisible from "../../options/custom_hooks/useComponentVisible";

const BlockingAdsArea = ({amountAdsBlocked}) => {
    const [expanded, setExpanded] = useState(false),
        {ref, isComponentVisible, setIsComponentVisible} = useComponentVisible(true),
        dispatch = useDispatch(),
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
                gridTemplateRows: `auto ${expanded ? 0 : "8px"} auto`,
            },
            primaryButton: GridStyle.setRowCol(1, 2),
            secondaryButton: GridStyle.setRowCol(3, 2)
        });

    useEffect(() => {
        dispatch(popupShown({pageName: TrackingConfig.PageNames.BLOCKING}));
        return () => void (0);
    }, []);

    useEffect(() => {
        if (!isComponentVisible) setExpanded(false);
        if (!expanded) setIsComponentVisible(true);
    }, [isComponentVisible, expanded]);

    function onExpandableButtonClick(buttonId) {
        if (buttonId !== 0) dispatch(buttonId === 2 ? pauseAllRequest() : pauseOnSiteRequest());
        setExpanded(!expanded);
    }

    function addSiteToWhitelist() {
        dispatch(addSiteToWhitelistRequest());
    }

    return (
        <div className={css(styles.blockingAdsContainer)}>
            <AdsAreaTitle text={`${MessagesManager.get("adsBlocked")}${amountAdsBlocked}`}
                          extraStyle={styles.title}/>
            <div className={css(styles.buttonsContainer)}>
                <AdBlockExpandableButton text={MessagesManager.get("pauseAdBlock")}
                                         extraStyle={styles.primaryButton}
                                         extRef={ref}
                                         expanded={expanded}
                                         onClick={onExpandableButtonClick}/>
                {!expanded && <AdBlockSecondaryButton text={MessagesManager.get("allowAdsOnSite")}
                                                      accessibleName={MessagesManager.get("allowAdsOnSite")}
                                                      minWidth={184}
                                                      extraStyle={styles.secondaryButton}
                                                      onClick={addSiteToWhitelist}/>}
            </div>
        </div>
    );
};

export default BlockingAdsArea;
