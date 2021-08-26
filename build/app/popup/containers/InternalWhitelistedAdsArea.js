import React, {useContext, useEffect} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import AdsAreaTitle from "../components/AdsAreaTitle";
import {AdBlockPrimaryButton} from "../../common_components/AdBlockButtons";
import {useDispatch} from "react-redux";
import {pauseAllRequest, popupShown} from "../../creators/popup.creator";
import TrackingConfig from "../../utils/TrackingConfig";
import TextDiv from "../../common_components/TextDiv";
import ThemeContext from "../../utils/ThemeContext";

const InternalWhitelistedAdsArea = () => {
    const dispatch = useDispatch(),
        {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            blockingAdsContainer: {
                display: "grid",
                gridTemplateRows: "14px auto 4px max-content 18px max-content 30px",
            },
            title: GridStyle.setRow(2),
            learnMore: {
                ...GridStyle.setRow(4),
                color: theme.AppLearnMore,
                fontSize: 12,
                lineHeight: 1.5,
                textAlign: "center",
                textDecoration: "underline",
                cursor: "pointer"
            },
            buttonWrapper: {
                display: "grid",
                gridTemplateRows: "max-content",
                gridTemplateColumns: "auto max-content auto",
                ...GridStyle.setRow(6),
            },
            button: GridStyle.setRowCol(1, 2),
        });

    useEffect(() => {
        dispatch(popupShown({pageName: TrackingConfig.PageNames.INTERNAL_WHITELISTED}));
        return () => void (0);
    }, []);

    function pauseAll() {
        dispatch(pauseAllRequest());
    }

    return (
        <div className={css(styles.blockingAdsContainer)}>
            <AdsAreaTitle text={MessagesManager.get("adsAreAllowed")} extraStyle={styles.title}/>
            <TextDiv extraStyle={styles.learnMore} text={MessagesManager.get("learnMore")}
                     accessibleName={MessagesManager.get("learnMoreAboutAdBLock")}
                     onClick={() => window.open(process.env.CONFIG.partnersFaq, "_blank")}/>
            <div className={css(styles.buttonWrapper)}>
                <AdBlockPrimaryButton text={MessagesManager.get("pauseAdBlockOnAllSites")}
                                      accessibleName={MessagesManager.get("pauseAdBlockOnAllSites")}
                                      extraStyle={styles.button}
                                      onClick={pauseAll}/>
            </div>
        </div>
    );
};

export default InternalWhitelistedAdsArea;
