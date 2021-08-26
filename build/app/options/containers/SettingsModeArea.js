import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import {useDispatch, useSelector} from "react-redux";
import * as Actions from "../../actions/options.actions";
import SettingsCardArea from "./SettingsCardArea";
import {motion, AnimatePresence} from "framer-motion";

const SettingsModeArea = ({extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        {off} = useSelector(state => state.main.settings),
        dispatch = useDispatch(),
        styles = StyleSheet.create({
            container: {
                display: "grid",
                gridTemplateColumns: "auto",
                gridTemplateRows: "max-content 12px max-content"
            },
            textArea: {
                ...GridStyle.setRow(1),
                display: "grid",
                gridTemplateRows: "max-content",
                gridTemplateColumns: "max-content 8px auto",
                fontSize: 13
            },
            blockingOptions: {
                ...GridStyle.setCol(1),
                fontWeight: 500,
                color: theme.SettingsBlockingOptionsTextColor
            },
            learnMore: {
                ...GridStyle.setCol(3),
                color: theme.SettingsLearnMoreTextColor,
                textDecoration: "underline",
                cursor: "pointer"
            },
            cardsContainer: GridStyle.setRowCol(3, 1),
            firstCard: GridStyle.setRowCol(1, 1),
            secondCard: GridStyle.setRowCol(1, 3),
            thirdCard: GridStyle.setRowCol(1, 5),
        });

    function onUserInteraction(event) {
        if (event.type === "click" || event.key === 'Enter') dispatch({type: Actions.GO_TO_LEARN_MORE_REQUEST});
    }

    return (
        <AnimatePresence initial={false}>
            {!off &&
            <motion.div initial={{height: 0, overflow: "hidden", opacity: 0}}
                        animate={{height: "auto", overflow: "initial", opacity: 1}}
                        transition={{duration: 0.5}}
                        exit={{height: 0, overflow: "hidden"}} className={css(styles.container, extraStyle)}>
                <div className={css(styles.textArea)}>
                    <div className={css(styles.blockingOptions)}>{MessagesManager.get("blockingOptions")}</div>
                    <div tabIndex={0} onClick={onUserInteraction} onKeyDown={onUserInteraction}
                         role="button" aria-label={MessagesManager.get("learnMoreAboutAdBLock")}
                         className={css(styles.learnMore)}>{MessagesManager.get("learnMore")}</div>
                </div>
                <SettingsCardArea extraStyle={styles.cardsContainer}/>
            </motion.div>}
        </AnimatePresence>
    );
};

export default SettingsModeArea;
