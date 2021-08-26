import React, {useEffect, useState, useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import TopBar from "./TopBar";
import {GridStyle} from "../../utils/UtilsStyle";
import ThemeContext from "../../utils/ThemeContext";
import Settings from "./Settings";
import MessagesManager from "../../utils/MessagesManager";
import {useDispatch} from "react-redux";
import {optionsShown} from "../../creators/options.creator";

const Options = () => {
    const {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        styles = StyleSheet.create({
            container: {
                ...GridStyle.define("56px max-content 28px", "auto"),
                backgroundColor: theme.OptionsPageBackground,
                fontFamily: '\'Roboto\', sans-serif',
                userSelect: "none",
                height: "-webkit-fill-available"
            },
            topBar: GridStyle.setRow(1),
            settings: GridStyle.setRow(2)
        });

    useEffect(() => {
        document.title = MessagesManager.get("adBlockSettings");
        dispatch(optionsShown({pageName: 2402}));
        return () => void (0);
    }, []);

    return (
        <div className={css(styles.container)}>
            <TopBar extraStyle={styles.topBar}/>
            <Settings extraStyle={styles.settings}/>
        </div>
    );
};

export default Options;
