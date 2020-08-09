import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import { compose } from 'redux'
import { TabooCardTop } from 'components/shared/TabooCard'
import PlayerListCard from 'components/PlayerListCard'
import { Instructions } from './style'
import { verifyGameExists } from 'utils/API'

class Waiting extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			loading: true,
			gameVerified: false,
			playerVerified: false,
			error: null,
		}
	}
	//Used to verify when props received from firebase and firestore are available
	componentDidUpdate(prevProps) {
		//While game is loading, check if game data from firestore and auth data from firebase have been received
		//before verifying  gamecode and player
		if (this.state.loading && this.props.gameDataReceived && this.props.auth.isLoaded) {
			// const { gamecode } = this.props.match.params
			// const game = this.props.game?.[gamecode] //object with game data
			// const playerId = this.props.auth?.uid
			// console.log(game)
			// console.log(playerId)
			this.verifyGameInfo()
		}
	}

	//verify that game exists
	//verify that current user is a player in game
	//toggle loading/verified so UI can render
	verifyGameInfo = () => {
		console.log('verifying game and player info')
		const { gamecode } = this.props.match.params

		const game = this.props.game[gamecode]
		//Checks if falsy. Add additional edge cases in case empty object is returned
		if (!game || game.status !== 'new') {
			console.log(game)
			this.setState({
				loading: false, //gameVerified false by default
			})
		} else {
			//game info is valid, need to verify current user is a player in the game
			const playerId = this.props.auth.uid
			const players = game.players
			console.log(playerId)
			console.log(players)
			//Verify current user has valid uid and is in players array in firestore
			let playerVerified
			const includedUserArr = players.filter((player) => player.playerId === playerId)
			playerVerified = playerId && includedUserArr.length > 0 ? true : false
			this.setState({
				loading: false,
				gameVerified: true,
				playerVerified,
			})
		}
	}

	render() {
		if (this.state.loading) {
			//Update with actual loading component
			return <p>Loading Firestore/Firebase</p>
		} else if (!this.state.gameVerified) {
			//Style and add button to go back home
			return <p>Game doesn't exist, or is already in progress</p>
		} else if (!this.state.playerVerified) {
			//Style and add button to go to Join route so user can join properly
			return <p>Player didn't join properly</p>
		} else {
			const {gamecode} = this.props.match.params
			const players = this.props.game[gamecode].players
			const playerId = this.props.auth.uid
			const currentPlayer = players.find(player => player.playerId === playerId)
			const buttonInfo = [
				{
					text: 'Team 1',
					onClick: () => {
						console.log('Join Team 1')
					},
				},
				{
					text: 'Team 2',
					onClick: () => {
						console.log('Join Team 2')
					},
				},
				{
					text: 'Play!',
					onClick: () => {
						console.log('Start Game')
					},
					hidden: currentPlayer.host ? false: true, //only host player can see play button
					disabled: false,
				},
			]
			return (
				<React.Fragment>
					<Instructions>
						Share the game code below with friends! Once all players have joined and picked a team, select
						PLAY to start!
					</Instructions>
					<TabooCardTop margin={true} tabooWord={gamecode} />
					<PlayerListCard players={players} currentPlayer={currentPlayer} buttonInfo={buttonInfo} />
				</React.Fragment>
			)
		}
	}
}

const mapStateToProps = (state, prevProps) => {
	console.log(state)
	const { games } = state.firestore.data
	// console.log(gamecode)
	return {
		gamecode: state.game.gamecode, //tbd if adding this
		game: games, //from firestore
		gameDataReceived: state.firestore.status.requested[`games/${prevProps.match.params.gamecode}`],
		auth: state.firebase.auth,
	}
}

export default compose(
	connect(mapStateToProps),
	firestoreConnect((props) => [{ collection: 'games', doc: props.match.params.gamecode }])
)(Waiting)
