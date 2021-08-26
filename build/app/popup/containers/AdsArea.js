import React from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle as Grid} from "../../utils/UtilsStyle";
import InternalAdsArea from "./InternalAdsArea";
import PausedAdsArea from "./PausedAdsArea";
import BlockingAdsArea from "./BlockingAdsArea";
import UserWhitelistedAdsArea from "./UserWhitelistedAdsArea";
import InternalWhitelistedAdsArea from "./InternalWhitelistedAdsArea";
import OffAdsArea from "./OffAdsArea";

const AdsArea = ({info, extraStyle}) => {
    const styles = StyleSheet.create({
            adsAreaContainer: {
                minHeight: 116,
                maxHeight: "max-content",
                display: 'grid',
                gridTemplateColumns: 'minmax(15px, 30px) 1fr minmax(15px, 30px)',
            },
            adsAreaContentColumn: {
                ...Grid.setCol(2)
            }
        }),
        isInternalAdsArea = !info.paused && info.isInternal,
        sitePaused = info.paused || (info.isInternal ? false : info.domainIsPaused),
        isInternalWhiteListed = !sitePaused && !info.isInternal && (info.pageBlockingStatus === 1) && (info.blockingMode !== "strict"),
        isBlockingAdsArea = !sitePaused && !isInternalWhiteListed && !info.isInternal && !info.isInUserWhitelist,
        isUserWhitelisted = !sitePaused && !isInternalWhiteListed && !info.isInternal && info.whitelisted && info.isInUserWhitelist
            && (info.pageBlockingStatus !== 1 || (info.pageBlockingStatus === 1 && info.blockingMode === "strict"));

    return (
        <div className={css(styles.adsAreaContainer, extraStyle)}>
            <div className={css(styles.adsAreaContentColumn)}>
                {info.off ? <OffAdsArea blockingMode={info.blockingMode}/>
                    : <React.Fragment>
                        {isInternalAdsArea && <InternalAdsArea/>}
                        {isInternalWhiteListed && <InternalWhitelistedAdsArea/>}
                        {isBlockingAdsArea && <BlockingAdsArea amountAdsBlocked={info.amountAdsBlocked}/>}
                        {isUserWhitelisted && <UserWhitelistedAdsArea/>}
                        {sitePaused && <PausedAdsArea global={info.paused}/>}
                    </React.Fragment>}
            </div>
        </div>
    );
};

export default AdsArea;
