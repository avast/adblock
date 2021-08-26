import React, {useContext} from 'react';
import {css, StyleSheet} from "aphrodite";
import {GridStyle} from "../../utils/UtilsStyle";
import Ripples from "react-ripples";
import ThemeContext from "../../utils/ThemeContext";
import MessagesManager from "../../utils/MessagesManager";
import Image from "../../common_components/Image";

const AdBlockExpandableButton = (props) => {
    const {theme} = useContext(ThemeContext),
        styles = StyleSheet.create({
            container: {
                display: "grid",
                gridTemplateRows: "auto auto"
            },
            buttonWrapper: {
                ...GridStyle.setRow(1),
                display: "grid",
                gridTemplateRows: "auto auto",
                gridTemplateColumns: "auto 1fr auto"
            },
            button: {
                display: "grid",
                ...GridStyle.setRowCol(1, 2),
                gridTemplateRows: "8px auto 9px",
                gridTemplateColumns: "16px auto 16px",
                color: theme.PrimaryButtonText,
                backgroundColor: theme.PrimaryButtonBackground,
                minWidth: 186,
                border: 0,
                boxSizing: "content-box",
                fontSize: 13,
                borderRadius: 4,
                fontWeight: 500,
                textAlign: "center",
                ':hover': {
                    cursor: "pointer",
                    backgroundColor: theme.PrimaryButtonBackgroundHover
                },
                ':active': {
                    cursor: "pointer",
                    backgroundColor: theme.PrimaryButtonBackgroundActive
                }
            },
            textContainer: {
                ...GridStyle.setRowCol(2, 2),
                display: "grid",
                gridTemplateColumns: "auto max-content 8px 10px auto",
                zIndex: 1
            },
            text: {
                ...GridStyle.setCol(2)
            },
            iconContainer: {
                ...GridStyle.setCol(4),
                display: "grid",
                alignItems: "center"
            },
            icon: {
                height: 6,
                width: 10,
                margin: "0 auto"
            },
            expandable: {
                ...GridStyle.setRow(2),
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "7px 24px 8px 24px 7px",
                backgroundColor: theme.ExpandableBackground,
                color: theme.ExpandableTextColor,
                border: `1px solid ${theme.ExpandableBorderColor}`,
                boxShadow: "0 3px 8px 0 rgba(0, 0, 0, 0.18)",
                borderRadius: 4,
                textAlign: "center",
                fontSize: 13,
                fontHeight: "normal",
            },
            expandableCommon: {
                display: "grid",
                alignItems: "center",
                padding: "0 16px 0 16px",
                ':hover': {
                    cursor: "pointer",
                    backgroundColor: theme.ExpandableBackgroundHover,
                    color: theme.ExpandableTextColorHover,
                }
            },
            expandableFirst: GridStyle.setRow(2),
            expandableSecond: GridStyle.setRow(4)
        });

    function onKeyDown(event, actionFunction) {
        if (event.key === 'Enter') props.onClick(actionFunction);
    }

    function renderMainButton() {
        return (
            <div className={css(styles.buttonWrapper)}>
                <Ripples color={theme.backgroundColorActive}
                         tabIndex={0}
                         role="button"
                         aria-label={props.text}
                         className={css(styles.button)} during={350}
                         onKeyDown={(e) => onKeyDown(e, 0)}
                         onClick={() => props.onClick(0)}>
                    <div className={css(styles.textContainer)}>
                        <div className={css(styles.text)}>
                            {props.text}
                        </div>
                        <div className={css(styles.iconContainer)}>
                            <Image name={"expanded_icon.png"} extraStyle={styles.icon}/>
                        </div>
                    </div>
                </Ripples>
            </div>
        );
    }

    function renderExpandable() {
        return (<div className={css(styles.expandable)}>
            <div className={css(styles.expandableFirst, styles.expandableCommon)} onClick={() => props.onClick(1)}
                 role="button" aria-label={MessagesManager.get("pauseAdsOnSite")}
                 onKeyDown={(e) => onKeyDown(e, 1)} tabIndex={0}>
                {MessagesManager.get("pauseOnThisSite")}
            </div>
            <div className={css(styles.expandableSecond, styles.expandableCommon)} onClick={() => props.onClick(2)}
                 role="button" aria-label={MessagesManager.get("pauseAdsOnAllSites")}
                 onKeyDown={(e) => onKeyDown(e, 2)} tabIndex={0}>
                {MessagesManager.get("pauseOnAllSites")}
            </div>
        </div>);
    }

    return (
        <React.Fragment>
            <div className={css(styles.container, props.extraStyle)} ref={props.extRef} aria-expanded={props.expanded}>
                {renderMainButton()}
                {props.expanded && renderExpandable()}
            </div>
        </React.Fragment>
    );
};


export default AdBlockExpandableButton;
