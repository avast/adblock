import React, {useRef} from 'react';
import {css, StyleSheet} from "aphrodite";
import SettingsCard from "../components/SettingsCard";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import {useDispatch, useSelector} from "react-redux";
import StrictModeConfirmationModal from "../components/StrictModeConfirmationModal";
import {setModeOptionsRequest, setStrictOptionsRequest} from "../../creators/options.creator";

const SettingsCardArea = ({extraStyle}) => {
    const styles = StyleSheet.create({
            cardsContainer: GridStyle.define("max-content", "208px 8px 208px 8px 208px"),
            firstCard: GridStyle.setRowCol(1, 1),
            secondCard: GridStyle.setRowCol(1, 3),
            thirdCard: GridStyle.setRowCol(1, 5),
        }),
        currentBlockingMode = useSelector(state => state.main.settings.blockingMode),
        {faqUrl} = useSelector(state => state.popup),
        confirmationModalRef = useRef(null),
        dispatch = useDispatch(),
        cards = [
            {
                mode: "essential",
                name: MessagesManager.get("essentialBlockingName"),
                title: MessagesManager.get("settingsCardAcceptableAds").replace("__SET_HREF__", faqUrl),
                accessibleName: MessagesManager.get("setEssentialMode"),
                messages: [
                    {string: MessagesManager.get("settingsCardPopups")},
                    {string: MessagesManager.get("settingsCardDisruptive")},
                ],
                logo: "essential_mode.png"
            },
            {
                mode: "balanced",
                name: MessagesManager.get("balancedBlockingName"),
                title: MessagesManager.get("settingsCardAcceptableAdsBlocks"),
                accessibleName: MessagesManager.get("setBalancedMode"),
                messages: [
                    {string: MessagesManager.get("settingsCardPopups")},
                    {string: MessagesManager.get("settingsCardDisruptive")},
                    {string: MessagesManager.get("settingsCardSocialMedia")}
                ],
                logo: "balanced_mode.png"
            },
            {
                mode: "strict",
                name: MessagesManager.get("strictBlockingName"),
                title: MessagesManager.get("settingsCardAcceptableAdsBlocksNearly"),
                accessibleName: MessagesManager.get("setStrictMode"),
                messages: [
                    {string: MessagesManager.get("settingsCardPopups")},
                    {string: MessagesManager.get("settingsCardDisruptive")},
                    {string: MessagesManager.get("settingsCardSocialMedia")},
                    {string: MessagesManager.get("settingsCardOtherAds")},
                ],
                logo: "strict_mode.png"
            }
        ];

    function onModeChange(blockingMode) {
        if (blockingMode === "strict") {
            confirmationModalRef.current.show();
        } else {
            setMode(blockingMode);
        }
    }

    function setMode(blockingMode) {
        if (currentBlockingMode !== blockingMode) dispatch(setModeOptionsRequest({blockingMode}));
    }

    function setStrict() {
        if (currentBlockingMode !== "strict") dispatch(setStrictOptionsRequest());
    }

    return (
        <React.Fragment>
            <div className={css(styles.cardsContainer, extraStyle)}>
                <SettingsCard onClick={onModeChange} extraStyle={styles.firstCard} info={cards[0]}/>
                <SettingsCard onClick={onModeChange} extraStyle={styles.secondCard} info={cards[1]}/>
                <SettingsCard onClick={onModeChange} extraStyle={styles.thirdCard} info={cards[2]}/>
            </div>
            <StrictModeConfirmationModal onClick={setStrict} ref={confirmationModalRef}/>
        </React.Fragment>
    );
};

export default SettingsCardArea;
