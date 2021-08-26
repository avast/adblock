import React from 'react';
import {StyleSheet as Aphrodite} from "aphrodite";

const {StyleSheet, css} = Aphrodite.extend([{
    selectorHandler: (selector, baseSelector, generateSubtreeStyles) => {
        return selector[0] === '>' ? generateSubtreeStyles(`${baseSelector} ${selector.slice(1)}`) : null;
    }
}]);

const TextDiv = ({text, extraStyle, onClick, title, accessibleName}) => {
    const styles = StyleSheet.create({
        container: {
            whiteSpace: "pre-line"
        }
    });

    function onUserInteraction(event) {
        if ((event.type === "click" || event.key === 'Enter') && onClick) onClick();
    }

    return (
        <div dangerouslySetInnerHTML={{__html: text}}
             title={title}
             className={css(styles.container, extraStyle)}
             tabIndex={onClick ? 0 : -1}
             role={onClick ? "button" : ""}
             aria-label={accessibleName || ""}
             onKeyDown={onUserInteraction}
             onClick={onUserInteraction}/>
    );
};

export default TextDiv;
