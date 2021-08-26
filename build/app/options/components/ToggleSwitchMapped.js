import React, {useContext} from 'react';
import ThemeContext from "../../utils/ThemeContext";
import {StyleSheet as Aphrodite} from 'aphrodite';

const {StyleSheet, css} = Aphrodite.extend([{
    selectorHandler: (selector, baseSelector, generateSubtreeStyles) => {
        return selector[0] === '>' ? generateSubtreeStyles(`${baseSelector} ${selector.slice(1)}`) : null;
    }
}]);

const ToggleSwitchMapped = ({extraStyle, onClick, mappedValue, accessibleName}) => {
    const {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            toggle: {
                margin: "0 auto",
                width: 28,
                height: 12,
                backgroundColor: `${mappedValue ? theme.SettingsCardToggleSwitchActive : theme.SettingsCardToggleSwitch}`,
                position: "relative",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background-color 0.3s box-shadow 0.3s",
                ":active": {
                    "> div": {
                        boxShadow: `${!mappedValue ? theme.SettingsCardToggleSwitchButtonBoxCircle : theme.SettingsCardToggleSwitchButtonBoxCircleActive}`,
                    }
                }
            },
            button: {
                position: "absolute",
                top: -2,
                right: `${mappedValue ? "-2px" : "50%"}`,
                height: 16,
                width: 16,
                boxShadow: `${mappedValue ? theme.SettingsCardToggleSwitchButtonBoxShadow : theme.SettingsCardToggleSwitchButtonBoxShadowActive}`,
                backgroundColor: `${mappedValue ? theme.SettingsCardToggleSwitchButtonActive : theme.SettingsCardToggleSwitchButton}`,
                borderRadius: "50%",
                transition: "right 0.3s"
            }
        });

    function onKeyDown(event) {
        if (event.key === 'Enter') onClick();
    }

    return (
        <div className={css(styles.toggle, extraStyle)} onClick={onClick} aria-label={accessibleName}
             onKeyDown={onKeyDown} tabIndex={0} role="switch" aria-checked={mappedValue}>
            <div className={css(styles.button)}/>
        </div>
    );
};

export default ToggleSwitchMapped;
