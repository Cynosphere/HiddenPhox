module.exports = class {
    constructor(titles) {
        this._rows = [titles];
        this._widths = [];
        for (let i = 0; i < this._rows.length; i++) {
            for (let _i = 0; _i < this._rows[i].length; _i++) {
                this._widths.push(this._rows[i][_i].length + 2);
            }
        }
    }

    _updateWidth(row) {
        for (let index in row) {
            let entry = row[index];
            let width = entry.length + 2;
            if (width > this._widths[index]) {
                this._widths[index] = width;
            }
        }
    }

    addRow(row) {
        this._rows.push(row);
        this._updateWidth(row);
    }

    render() {
        function drawRow(ctx, row, index) {
            let columns = [];

            for (let i = 0; i < row.length; i++) {
                columns.push(row[i].toString().padEnd(ctx._widths[i]));
            }

            return columns;
        }

        let toDraw = [];
        let queue = this._rows.splice(1);
        for (let row in queue) {
            let _row = drawRow(this, queue[row]);
            toDraw.push(_row.join("|"));
        }

        this._updateWidth(this._rows[0]);

        let trows = [];
        for (let index in this._rows[0]) {
            let field = this._rows[0][index];
            let out = field;
            let width = this._widths[index];
            out = out.padEnd(width);
            trows.push(out);
        }

        let title_row = trows.join("|");

        let seperator_row = "";
        for (let index in this._widths) {
            seperator_row += "-".repeat(this._widths[index]);
            if (index != this._widths.length - 1) {
                seperator_row += "+";
            }
        }

        let drawn = [title_row, seperator_row];
        for (let index in toDraw) {
            drawn.push(toDraw[index]);
        }

        return drawn.join("\n");
    }
};
