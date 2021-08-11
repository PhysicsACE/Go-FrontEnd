import React from 'react';
import {Row} from './row';
import './styles.css'

export const Go = (board) => {
    return (
        <div className="board">
            <table>
                {board.board.map((row, i) => <Row key={i} row={row} play={board.play} rIdx={i}/>)}
            </table>
        </div>
    )
}