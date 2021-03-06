import React from 'react';
import ChoiceButton from './ChoiceButton'
import './styles.css'

const Choice = ({onChoice}) => {
    return (
        <>
        <div className='choice-container'>
            <div className="title">GoWithFriends</div>
            <ChoiceButton onChoice={onChoice} type='primary' choice='new' label='Start New'/> 
            <ChoiceButton onChoice={onChoice} type='secondary' choice='join' label='Join Game'/> 
        </div>
        </>
    );
}

export default Choice;
