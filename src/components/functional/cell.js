import React from 'react';
import './styles.css'

export const Cell = (value) => {

    return (
        <td>
            <div className="cell" onClick={() => {value.play([value.hIdx, value.cIdx])}}>
                <div className={value.value + '-circle'}></div>
            </div>
        </td>
    )
}