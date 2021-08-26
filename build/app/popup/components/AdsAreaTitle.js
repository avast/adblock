import {css, StyleSheet} from "aphrodite";
import ThemeContext from "../../utils/ThemeContext";
import React, {useContext} from "react";

const AdsAreaTitle = ({text, extraStyle}) => {
    const {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            text: {
                color: theme.AdsAreaTitle,
                textAlign: "center",
                fontSize: 18,
                fontWeight: 500
            }
        });

    return (
        <div className={css(styles.text, extraStyle)}>
            {text}
        </div>
    );
};

export default AdsAreaTitle;
