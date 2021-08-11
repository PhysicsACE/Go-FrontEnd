import React from 'react';
import {Cell} from './cell';

export const Row = (row) => {
    return (
        <tr>
            {row.row.map((cell, i) => <Cell key={i} value={cell} cIdx={i} play={row.play} hIdx={row.rIdx} />)}
        </tr>
    )
}