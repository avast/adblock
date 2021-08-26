import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../utils/UtilsStyle";
import ThemeContext from "../utils/ThemeContext";
import Ripples from "react-ripples";
import * as Actions from "../actions/options.actions";

const AdBlockButton = (props) => {
    const styles = StyleSheet.create({
        buttonWrapper: {
            display: "grid",
            gridTemplateRows: "auto",
            gridTemplateColumns: "auto 1fr auto"
        },
        button: {
            display: "grid",
            ...GridStyle.setRowCol(1, 2),
            gridTemplateRows: "8px auto 9px",
            gridTemplateColumns: "16px auto 16px",
            minWidth: props.minWidth || 186,
            color: props.color,
            backgroundColor: props.backgroundColor,
            border: props.border,
            boxSizing: "content-box",
            fontSize: 13,
            borderRadius: 4,
            fontWeight: 500,
            textAlign: "center",
            ':hover': {
                cursor: "pointer",
                backgroundColor: props.backgroundColorHover
            }
        },
        text: {
            ...GridStyle.setRowCol(2, 2),
            zIndex: 1
        },
        standard: props.standard ? {maxHeight: props.standard} : {}
    });

    function onUserInteraction(event) {
        if (event.type === "click" || event.key === 'Enter') props.onClick();
    }

    return (
        <div className={css(styles.buttonWrapper, props.extraStyle)} tabIndex={0}
             onKeyDown={onUserInteraction} role="button" aria-label={props.accessibleName}>
            <Ripples color={props.backgroundColorActive}
                     onClick={onUserInteraction}
                     className={css(styles.button, styles.standard)} during={350}>
                <div className={css(styles.text)}>
                    {props.text}
                </div>
            </Ripples>
        </div>
    );
};

const AdBlockPrimaryButton = ({text, extraStyle, onClick, minWidth, accessibleName}) => {
    const {theme} = useContext(ThemeContext);

    return AdBlockButton({
        text,
        extraStyle,
        onClick,
        backgroundColor: theme.PrimaryButtonBackground,
        backgroundColorHover: theme.PrimaryButtonBackgroundHover,
        backgroundColorActive: theme.PrimaryButtonBackgroundActive,
        color: theme.PrimaryButtonText,
        border: 0,
        minWidth: minWidth,
        accessibleName: accessibleName || ""
    });
};

const AdBlockSecondaryButton = ({text, extraStyle, onClick, minWidth, accessibleName}) => {
    const {theme} = useContext(ThemeContext);

    return AdBlockButton({
        text,
        extraStyle,
        onClick,
        backgroundColor: theme.SecondaryButtonBackground,
        backgroundColorHover: theme.SecondaryButtonBackgroundHover,
        backgroundColorActive: theme.SecondaryButtonBackgroundActive,
        color: theme.SecondaryButtonText,
        border: `1px solid ${theme.SecondaryButtonBorderColor}`,
        standard: 32,
        minWidth: minWidth,
        accessibleName: accessibleName || ""
    });
};

export {AdBlockPrimaryButton, AdBlockSecondaryButton};
