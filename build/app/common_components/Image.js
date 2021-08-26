import React, {useContext} from "react";
import ThemeContext from "../utils/ThemeContext";
import GetImagePath from "../utils/Images";
import {css, StyleSheet} from "aphrodite";

const Image = ({name, extraStyle, onClick, alt}) => {
    const {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            image: {
                userSelect: "none",
                "-webkit-user-drag": "none"
            }
        });

    function onUserInteraction(event) {
        if ((event.type === "click" || event.key === 'Enter') && onClick) onClick();
    }

    return (
        <img className={css(styles.image, extraStyle)} onClick={onUserInteraction}
             onKeyDown={onUserInteraction} src={GetImagePath(`${theme.name}/${name}`)} alt={alt || ""}
             tabIndex={onClick ? 0 : -1} role={onClick ? "button" : ""}/>
    );
};

export default Image;
