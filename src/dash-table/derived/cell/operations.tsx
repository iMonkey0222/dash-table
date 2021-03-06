import * as R from 'ramda';
import React from 'react';

import { memoizeOneFactory } from 'core/memoizer';

import {
    Data,
    Datum,
    SetProps,
    RowSelection,
    ActiveCell,
    Indices
} from 'dash-table/components/Table/props';

function deleteRow(idx: number, activeCell: ActiveCell, data: Data, selectedRows: number[]) {
    const newProps: any = {
        data: R.remove(idx, 1, data)
    };
    if (R.is(Array, activeCell) && activeCell[0] === idx) {
        newProps.active_cell = [];
    }

    if (R.is(Array, selectedRows) && R.contains(idx, selectedRows)) {
        newProps.selected_rows = R.without([idx], selectedRows);
    }
    return newProps;
}

function rowSelectCell(idx: number, rowSelectable: RowSelection, selectedRows: number[], setProps: SetProps) {
    return (<td
        key='select'
        className='dash-select-cell'
        style={{ width: `30px`, maxWidth: `30px`, minWidth: `30px` }}
    >
        <input
            type={rowSelectable === 'single' ? 'radio' : 'checkbox'}
            name='row-select'
            checked={R.contains(idx, selectedRows)}
            onChange={() => setProps({
                selected_rows:
                    rowSelectable === 'single' ?
                        [idx] :
                        R.ifElse(
                            R.contains(idx),
                            R.without([idx]),
                            R.append(idx)
                        )(selectedRows)
            })}
        />
    </td>);
}

function rowDeleteCell(setProps: SetProps, deleteFn: () => any) {
    return (<td
        key='delete'
        className='dash-delete-cell'
        onClick={() => setProps(deleteFn())}
        style={{ width: `30px`, maxWidth: `30px`, minWidth: `30px` }}
    >
        {'×'}
    </td>);
}

const getter = (
    activeCell: ActiveCell,
    data: Data,
    viewportData: Data,
    viewportIndices: Indices,
    rowSelectable: RowSelection,
    rowDeletable: boolean,
    selectedRows: number[],
    setProps: SetProps
): JSX.Element[][] => R.addIndex<Datum, JSX.Element[]>(R.map)(
    (_, rowIndex) => [
        ...(rowDeletable ? [rowDeleteCell(setProps, deleteRow.bind(undefined, viewportIndices[rowIndex], activeCell, data, selectedRows))] : []),
        ...(rowSelectable ? [rowSelectCell(viewportIndices[rowIndex], rowSelectable, selectedRows, setProps)] : [])
    ],
    viewportData
);

export default memoizeOneFactory(getter);
