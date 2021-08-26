import React, {useContext, useRef} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import {AdBlockSecondaryButton} from "../../common_components/AdBlockButtons";
import {AddWhitelistModal, EditWhitelistModal} from "./WhitelistModal";
import * as Actions from "../../creators/options.creator";
import {addSiteToWhitelistFromUrlRequest} from "../../creators/options.creator";
import {useDispatch} from "react-redux";
import WhitelistActions from "./WhitelistActions";
import TextDiv from "../../common_components/TextDiv";

const WhitelistSettings = ({extraStyle, whitelist}) => {
    const {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        addModalReference = useRef(null),
        editModalReference = useRef(null),
        styles = StyleSheet.create({
            whitelistSettings: {
                ...GridStyle.define("32px 32px max-content", "20px auto 20px"),
                fontSize: 13
            },
            whitelistSettingsTextRow: {
                ...GridStyle.defineAndSet("auto", "1fr max-content", 1, 2),
                color: theme.SettingsBlockingOptionsTextColor,
                fontWeight: 500,
                alignItems: "center"
            },
            whitelistSection: {
                ...GridStyle.defineAndSet("max-content", "20px 1fr", 3, 2),
                color: theme.SettingsGeneralTextColor,
                fontWeight: "normal"
            },
            whitelistSettingsText: GridStyle.setCol(1),
            whitelistSettingsAddButton: GridStyle.setCol(2),
            whiteListEmptyText: GridStyle.setRowCol(1, 2),
            whiteListDisplay: GridStyle.defineAndSet(`repeat(${whitelist.length}, max-content)`, "1fr", 1, 2),
            whitelistDisplayRow: {
                ...GridStyle.defineAndSet("36px 6px 6px", "1fr max-content", "auto", 1),
                alignItems: "center",
                listStyleType: "unset",
                marginBlockStart: "unset",
                marginBlockEnd: "unset",
                marginInlineStart: "unset",
                marginInlineEnd: "unset",
                paddingInlineStart: "unset"
            },
            whitelistDisplayText: {
                ...GridStyle.setRowCol(1, 1),
                maxWidth: 570,
                overflow: "hidden",
                textOverflow: "ellipsis"
            },
            whitelistDisplayIcon: GridStyle.setRowCol(1, 3),
            whitelistSeparator: {
                ...GridStyle.setRow(2),
                ...GridStyle.setCol(1, 2),
                borderBottom: `1px solid ${theme.SettingsModeSeparator}`
            }
        });

    function addToWhitelist(url) {
        dispatch(addSiteToWhitelistFromUrlRequest({url}));
        addModalReference.current.close();
    }

    function editFromWhitelist(url, originalUrl) {
        dispatch(Actions.editSiteFromWhitelistRequest({url, originalUrl}));
        editModalReference.current.close();
    }

    return (
        <React.Fragment>
            <div className={css(styles.whitelistSettings, extraStyle)}>
                <div className={css(styles.whitelistSettingsTextRow)}>
                    <TextDiv extraStyle={styles.whitelistSettingsText}
                             text={MessagesManager.get("alwaysAllowAdsOnSites")}/>
                    <AdBlockSecondaryButton minWidth={"max-content"}
                                            accessibleName={MessagesManager.get("addWebsiteToAllowAds")}
                                            onClick={() => addModalReference.current.show()}
                                            text={MessagesManager.get("btnAdd").replace(/^\w/, c => c.toUpperCase())}
                                            extraStyle={styles.whitelistSettingsAddButton}/>
                </div>
                <div className={css(styles.whitelistSection)}>
                    {!whitelist.length && <TextDiv extraStyle={styles.whiteListEmptyText}
                                                   text={MessagesManager.get("sitesYouHaveAllowed")}/>}
                    {(whitelist.length > 0) && <ul className={css(styles.whiteListDisplay)}>
                        {whitelist.map((domain, i) =>
                            <li key={i} className={css(styles.whitelistDisplayRow)}>
                                <TextDiv title={domain} extraStyle={styles.whitelistDisplayText} text={domain}/>
                                <WhitelistActions dialog={editModalReference} domain={domain}
                                                  extraStyle={styles.whitelistDisplayIcon}/>
                                {i < (whitelist.length - 1) && <div className={css(styles.whitelistSeparator)}/>}
                            </li>
                        )}
                    </ul>}
                </div>
            </div>
            <AddWhitelistModal ref={addModalReference} onClick={addToWhitelist}/>
            <EditWhitelistModal ref={editModalReference} onClick={editFromWhitelist}/>
        </React.Fragment>
    );
};

export default WhitelistSettings;
