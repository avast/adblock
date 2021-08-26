import {css, StyleSheet} from "aphrodite";
import React, {useContext, useEffect, useState} from 'react';
import Image from "../../common_components/Image";
import useComponentVisible from "../custom_hooks/useComponentVisible";
import {GridStyle} from "../../utils/UtilsStyle";
import MessagesManager from "../../utils/MessagesManager";
import ThemeContext from "../../utils/ThemeContext";
import {useDispatch} from "react-redux";
import * as Actions from "../../creators/options.creator";
import TextDiv from "../../common_components/TextDiv";

const WhitelistActions = ({domain, extraStyle, dialog}) => {
    const {ref, isComponentVisible, setIsComponentVisible} = useComponentVisible(true),
        [expand, setExpand] = useState(false),
        {theme} = useContext(ThemeContext),
        dispatch = useDispatch(),
        expandableCommon = {
            display: "grid",
            alignItems: "center",
            paddingLeft: 20,
            paddingRight: 20,
            ':hover': {
                cursor: "pointer",
                backgroundColor: theme.ExpandableBackgroundHover,
                color: theme.ExpandableTextColorHover,
            }
        },
        styles = StyleSheet.create({
            image: {
                ...extraStyle._definition,
                margin: "0 auto",
                width: 36,
                height: 36,
                cursor: "pointer"
            },
            expandContainer: {
                ...GridStyle.define("7px 24px 8px 24px 7px", "1fr"),
                height: "max-content",
                backgroundColor: theme.ExpandableBackground,
                color: theme.ExpandableTextColor,
                border: `1px solid ${theme.ExpandableBorderColor}`,
                fontSize: 13,
                zIndex: 1,
                boxShadow: "0 3px 8px 0 rgba(0, 0, 0, 0.18)",
                borderRadius: 4,
                textAlign: "left",
                fontHeight: "normal"
            },
            expandableFirst: {...expandableCommon, ...GridStyle.setRow(2)},
            expandableSecond: {...expandableCommon, ...GridStyle.setRow(4)},
        });

    useEffect(() => {
        if (!isComponentVisible) setExpand(false);
        if (!expand) setIsComponentVisible(true);
    }, [isComponentVisible, expand]);

    function remove() {
        dispatch(Actions.removeSiteToWhitelistFromUrlRequest({url: domain}));
        setExpand(false);
    }

    function edit() {
        setExpand(false);
        dialog.current.show(domain);
    }

    function renderIcon() {
        return (
            <Image extraStyle={styles.image} name={"whitelist_action.png"} onClick={() => setExpand(true)}
                   alt={MessagesManager.get("modifyWhitelistedSite")}/>
        );
    }

    function renderExpand() {
        return (
            <div className={css(styles.expandContainer, extraStyle)} ref={ref}>
                <TextDiv onClick={remove} text={MessagesManager.get("remove")} extraStyle={styles.expandableFirst}
                         accessibleName={MessagesManager.get("removeFromWhitelist")}/>
                <TextDiv onClick={edit} text={MessagesManager.get("edit")} extraStyle={styles.expandableSecond}
                         accessibleName={MessagesManager.get("editFromWhitelist")}/>
            </div>
        );
    }

    return expand ? renderExpand() : renderIcon();
};

export default WhitelistActions;
