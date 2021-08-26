import React, {useContext, useState} from 'react';
import ThemeContext from "../../utils/ThemeContext";
import {StyleSheet as Aphrodite} from 'aphrodite';

const {StyleSheet, css} = Aphrodite.extend([{
    selectorHandler: (selector, baseSelector, generateSubtreeStyles) => {
        return selector[0] === '>' ? generateSubtreeStyles(`${baseSelector} ${selector.slice(1)}`) : null;
    }
}]);

const ToggleSwitch = ({extraStyle, onClick, initialValue, accessibleName}) => {
    const {theme} = useContext(ThemeContext),
        [toggle, setToggle] = useState(initialValue),
        styles = StyleSheet.create({
            toggle: {
                margin: "0 auto",
                width: 28,
                height: 12,
                backgroundColor: `${toggle ? theme.SettingsCardToggleSwitchActive : theme.SettingsCardToggleSwitch}`,
                position: "relative",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background-color 0.3s box-shadow 0.3s",
                ":active": {
                    "> div": {
                        boxShadow: `${!toggle ? theme.SettingsCardToggleSwitchButtonBoxCircle : theme.SettingsCardToggleSwitchButtonBoxCircleActive}`,
                    }
                }
            },
            button: {
                position: "absolute",
                top: -2,
                right: `${toggle ? "-2px" : "50%"}`,
                height: 16,
                width: 16,
                boxShadow: `${toggle ? theme.SettingsCardToggleSwitchButtonBoxShadow : theme.SettingsCardToggleSwitchButtonBoxShadowActive}`,
                backgroundColor: `${toggle ? theme.SettingsCardToggleSwitchButtonActive : theme.SettingsCardToggleSwitchButton}`,
                borderRadius: "50%",
                transition: "right 0.3s"
            }
        });

    function onSwitch(event) {
        if (event.type === "click" || event.key === 'Enter') {
            setToggle(!toggle);
            onClick(toggle);
        }
    }

    return (
        <div className={css(styles.toggle, extraStyle)} onClick={onSwitch} tabIndex={0}
             onKeyDown={onSwitch} role="switch" aria-checked={toggle} aria-label={accessibleName}>
            <div className={css(styles.button)}/>
        </div>
    );
};

export default ToggleSwitch;
