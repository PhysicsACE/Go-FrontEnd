import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'

import Wait from '../functional/Wait'
import Status from '../functional/Status'
import { Go } from '../functional/board';
import '../functional/styles.css'

import io from 'socket.io-client'
import qs from 'qs'
const ENDPOINT = "http://localhost:4000"

const newBoard = () => {
  const board = []
  for (let i = 0; i < 13; i++) {
      board[i] = []
      for (let j = 0; j < 13; j++) {
        board[i][j] = null
      }
  }

  return board
}

class Board extends Component {
  constructor(props){
    super(props)
    this.state = {
      game: newBoard(),
      piece: 'black',
      turn: true,
      end: false,
      room: '',
      statusMessage: '',
      opponentPlayer: [],
      //State to check when a new user join
      waiting: false,
      joinError: false,
      moveError: false
    }
    this.socketID = null
  }

  componentDidMount() {
    //Getting the room and the username information from the url
    //Then emit to back end to process
    this.socket = io(ENDPOINT)
    const {room, name} = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
     })
    this.setState({room})
    this.socket.emit('newRoomJoin', {room, name})

    //New user join, logic decide on backend whether to display 
    //the actual game or the wait screen or redirect back to the main page
    this.socket.on('waiting', ()=> this.setState({waiting:true, currentPlayerScore:0, opponentPlayer:[]}))
    this.socket.on('starting', ({gameState, players, turn})=> {
      this.setState({waiting:false})
      this.gameStart(players, turn)
    })
    this.socket.on('joinError', () => this.setState({joinError: true}))

    //Listening to the assignment of piece store the piece along with the in state
    //socket id in local socketID variable
    this.socket.on('pieceAssignment', ({piece, id}) => {
      this.setState({piece: piece})
      this.socketID = id 
    })

    //Game play logic events
    this.socket.on('update', ({gameState, turn}) => this.handleUpdate(gameState, turn))
    this.socket.on('winner', ({gameState,id}) => this.handleWin(id, gameState))
    this.socket.on('draw', ({gameState}) => this.handleDraw(gameState))

    this.socket.on('restart', ({gameState, turn}) => this.handleRestart(gameState, turn))
  }

  //Setting the states to start a game when new user join
  gameStart(players, turn){
    const opponent = players.filter(([id, name]) => id!==this.socketID)[0][1]
    this.setState({opponentPlayer: [opponent, 0], end:false})
    this.setTurn(turn)
    this.setMessage()
  }

  //When some one make a move, emit the event to the back end for handling
  handleClick = (index) => {
    console.log(this.state.game)
    const {game, turn, room} = this.state
    if (!game[index[0]][index[1]] && turn){
      this.socket.emit('move', {room, index})
    }
  }

  //Setting the states each move when the game haven't ended (no wins or draw)
  handleUpdate(gameState, turn){
    console.log(gameState, turn)
    this.setBoard(gameState)
    this.setTurn(turn)
    this.setMessage()
  }

  //Setting the states when some one wins
  handleWin(id, gameState) {
    this.setBoard(gameState)
    if (this.socketID === id){
      const playerScore = this.state.currentPlayerScore + 1
      this.setState({currentPlayerScore:playerScore, statusMessage:'You Win'})
    }else{
      const opponentScore = this.state.opponentPlayer[1] + 1
      const opponent = this.state.opponentPlayer
      opponent[1] = opponentScore
      this.setState({opponentPlayer:opponent, statusMessage:`${this.state.opponentPlayer[0]} Wins`})
    }
    this.setState({end:true})
  }

  //Setting the states when there is a draw at the end
  handleDraw(gameState){
    this.setBoard(gameState)
    this.setState({end:true, statusMessage:'Draw'})
  }

  playAgainRequest = () => {
    this.socket.emit('playAgainRequest', this.state.room)
  }

  //Handle the restart event from the back end
  handleRestart(gameState, turn){
    this.setBoard(gameState)
    this.setTurn(turn)
    this.setMessage()
    this.setState({end: false})
  }

  //Some utilities methods to set the states of the board

  setMessage(){
    const message = this.state.turn?'Your Turn':`${this.state.opponentPlayer[0]}'s Turn`
    this.setState({statusMessage:message})
  }

  setTurn(turn){
    if (this.state.piece === turn){
      this.setState({turn:true})
    }else{
      this.setState({turn:false})
    }
  } 

  setBoard(gameState){
    this.setState({game:gameState})
  }

  render(){
    if (this.state.joinError){
      return(
        <Redirect to={`/`} />
      )
    }else{
      return(
        <>
          <Wait display={this.state.waiting} room={this.state.room} />
          <div className="container">
            <Status message={this.state.statusMessage} />
            <Go board={this.state.game} play={this.handleClick} />
          </div>
        </>
      )
    }
  }
}


export default Board