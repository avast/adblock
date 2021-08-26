const GridStyle = {
        setRow: (start, end = start) => {
            return {
                gridRow: `${start} / ${end}`
            }
        },
        setCol: (start, end = start) => {
            return {
                gridColumn: `${start} / ${end}`
            }
        },
        setRowCol(row, col) {
            return {
                ...this.setCol(col),
                ...this.setRow(row)
            };
        },
        define(rows = "auto", cols = "auto") {
            return {
                display: "grid",
                gridTemplateRows: rows,
                gridTemplateColumns: cols
            }
        },
        defineAndSet(rows = "auto", cols = "auto", row, col) {
            return {
                ...this.define(rows, cols),
                ...this.setRowCol(row, col)
            }
        }
    },
    ImgStyle = {
        setNonDraggable: () => {
            return {
                "-webkit-user-drag": "none",
                userSelect: "none"
            }
        }
    };

export {GridStyle, ImgStyle};
