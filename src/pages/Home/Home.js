import React from "react"
import { Redirect } from "react-router-dom"
import "./Home.scss"
import Wrapper from "../../components/Wrapper"
import Header from "../../components/Header"
import TabooCard from "../../components/TabooCard"

import Modal from "../../components/Modal"
import JoinForm from "../../components/JoinForm"
import { createNewCode } from "../../utils/helpers"
import { createNewGame } from "../../utils/API"

export default function Home() {
  return (
    /*Components:
      Wrapper
      Header w/ and w/o subheading
      Taboo cards with type property: null, home, middle, or bottom
    */

    <Wrapper>
      <Header homepage={true} />
      
        <TabooCard
          type="home"
          tabooWord="Menu"
          list={[
            "Create New Game",
            "Join Game",
            "How to Play",
            "Sumbit a Card",
          ]}
        />
        <TabooCard
          type="middle"
          tabooWord="Taboo"
          list={["Taboo!", "Taboo!", "Taboo!", "Taboo!"]}
        />
        <TabooCard
          tabooWord="Menu"
          type="bottom"
          list={["Taboo!", "Taboo!", "Taboo!", "Taboo!"]}
        />
        <div className="footer-line"></div>
    </Wrapper>
  )
}

export class Home2 extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showGameCodeForm: false,
      gamecode: null,
      playerId: null,
      redirect: false,
      validGame: false,
    }

    this.style = {
      width: "400px",
      height: "200px",
      fontSize: "50px",
    }
    this.toggleGameCodeForm = this.toggleGameCodeForm.bind(this)
    this.createGame = this.createGame.bind(this)
    this.createPlayerCode = this.createPlayerCode.bind(this)
    this.validGameCode = this.validGameCode.bind(this)
  }

  //Controls whether game code input displays in middle of Homepage
  toggleGameCodeForm() {
    this.setState((state) => {
      return {
        ...state,
        showGameCodeForm: !state.showGameCodeForm,
      }
    })
  }

  /*Called when "Create Game" selected
    Generates a game code.
    Users code to create a game object in firebase
    Passes gamecode to function to create player id
  */
  createGame(e) {
    e.target.disabled = true
    createNewCode().then((gamecode) => {
      createNewGame(gamecode)
        .then((res) => this.createPlayerCode(gamecode))
        .catch((err) => {
          console.log(
            "There was an error creating a new game with gamecode: ",
            gamecode
          )
        })
    })
  }

  /*Generates a player id
  sets state and redirects to Game "Waiting room"
  */
  createPlayerCode(gamecode) {
    createNewCode().then((playerId) => {
      console.log(playerId)
      this.setState({
        gamecode,
        redirect: true,
        playerId,
        showGameCodeForm: false,
      })
    })
  }

  validGameCode(gamecode) {
    this.createPlayerCode(gamecode)
  }

  render() {
    const { redirect, gamecode, playerId } = this.state
    if (gamecode && redirect) {
      return (
        <Redirect
          push //Keeps home location on the history stack
          to={{
            pathname: `new/${gamecode}/${playerId}`,
          }}
        />
      )
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: "20px",
        }}
      >
        <button onClick={(e) => this.createGame(e)} style={this.style}>
          Create New Game
        </button>

        <button
          onClick={() => {
            this.toggleGameCodeForm()
          }}
          style={this.style}
        >
          Join Game
        </button>
        {this.state.showGameCodeForm ? (
          <Modal
            display={this.state.showGameCodeForm}
            toggleDisplay={this.toggleGameCodeForm}
            header="Join a Game of Taboo"
            buttonText=""
          >
            {<JoinForm validGameCode={this.createPlayerCode} />}
          </Modal>
        ) : null}
      </div>
    )
  }
}
