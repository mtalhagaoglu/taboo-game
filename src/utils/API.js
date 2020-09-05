import firebase from './fbConfig'

//--------------------- GAME UPDATES ---------------------------//
export const createGame = (gamecode, gameDetails) => {
	console.log('creating game in firestore')
	const newGame = {
		gamecode,
		...gameDetails,
		createdAt: firebase.firestore.FieldValue.serverTimestamp(),
	}

	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.set(newGame)
		.then(() => {
			console.log('firestore created the game. Time to dispatch')
			return
		})
		.catch((error) => {
			throw error
		})
}

//Called when a player attempts to join an existing game. Verifies game exists and is in a valid status for a player to join
export const verifyGameExists = (gamecode) => {
	console.log('Verify: ' + gamecode)
	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.get()
		.then((game) => {
			if (!game.exists) throw new Error(`${gamecode} does not exist`)
			const gameInfo = game.data() //how data is accessed via firestore
			if (gameInfo.status !== 'new') throw new Error(`${gamecode} is ${gameInfo.status} and can't be joined!`)
			return
		})
		.catch((error) => {
			throw error
		})
}

export const dbUpdateGameStatus = (gamecode, status) => {
	console.log('updating game status')
	console.log(status)
	console.log(gamecode)
	// return new Promise((resolve, reject) => {
	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.update({
			status: status,
		})
		.then(() => {
			console.log('game updated to ', status)
			return
		})
		.catch((error) => {
			console.log('error updating game')
			return error
		})
	// })
}

//---------------------PLAYER & TEAM UPDATES --------------------------------
//Creates an anonymous user in firebase with a uid generated.
export const createPlayer = (playerName) => {
	console.log('creating player in firebase...')
	return firebase
		.auth()
		.signInAnonymously()
		.then((res) => {
			console.log('created a player in firebase')
			const user = firebase.auth().currentUser
			return user
				.updateProfile({
					displayName: playerName,
				})
				.then(() => {
					console.log('updated username in firebase')
					const player = {
						playerId: user.uid,
						name: user.displayName,
					}
					// resolve(player)
					return player
				})
				.catch((error) => {
					console.log('there was an error updating username in firebase ')
					console.log(error)
					throw error
				})
		})
		.catch((error) => {
			console.log('there was an error creating user')
			console.log(error)
			throw error
		})
}

export const addPlayer = (player, gamecode) => {
	console.log('action player in firestore to ', gamecode)

	console.log(player)
	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.update({
			players: firebase.firestore.FieldValue.arrayUnion(player),
		})
		.then(() => {
			console.log('player added to game')
			return player
		})
		.catch((error) => {
			throw error
		})
}

export const dbUpdateTeam = (gamecode, playerId, team) => {
	console.log('updating team in firestore')
	console.log(team)
	//probably don't need this promise, need to test.
	return new Promise((resolve, reject) => {
		const gamePath = firebase.firestore().collection('games').doc(gamecode)
		return firebase.firestore().runTransaction((transaction) => {
			//get the game document corresponding to gamecode
			return transaction
				.get(gamePath)
				.then((game) => {
					if (!game.exists) {
						reject('Document does not exist')
					}
					const players = game.data().players
					//find player object based on playerId and update team property
					console.log(players)
					const updatedPlayers = players.map((player) => {
						if (player.playerId !== playerId) return player
						const updatedPlayer = {
							...player,
							team: team,
						}
						return updatedPlayer
					})
					console.log(updatedPlayers)
					transaction.update(gamePath, { players: updatedPlayers })
				})
				.then(() => {
					console.log('transaction succesfully committed ')
					resolve()
				})
				.catch((error) => {
					console.log('transaction failed: ', error)
					reject()
				})
		})
	})
}

export const dbUpdateRoundStatus = (gamecode, status) => {
	console.log('updating game status')
	console.log(status)

	let currentTime
	let endTime = null

	//When round is starting, determine endTime for synchronized countdown timer
	if (status === 'in progress') {
		currentTime = new Date()
		endTime = currentTime.setTime(currentTime.getTime() + 60500)
	}

	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.update({
			'gameplay.status': status,
			'gameplay.roundEndTime': endTime,
		})
		.then(() => {
			console.log('game updated to ', status)
			return
		})
		.catch((error) => {
			console.log('error updating game')
			return error
		})
	// })
}

//----------------------------- CARD / DECK UPDATES ---------------------------
export const dbRequestGameDeck = () => {
	const gamedeck = []
	return firebase
		.firestore()
		.collection('cards')
		.get()
		.then((response) => {
			response.forEach((document) => {
				let card = {}
				card.word = document.id
				card.tabooList = document.data().tabooList
				gamedeck.push(card)
			})
			return gamedeck
		})
		.catch((error) => {
			console.log(error)
			return error
		})
}

export const dbSaveGameDeck = (gamecode, deck) => {
	console.log(deck)

	return firebase
		.firestore()
		.collection('games')
		.doc(gamecode)
		.update({
			'gameplay.deck': deck,
			'gameplay.cardIndex': 0,
		})
		.then(() => {
			console.log('saved shuffled array')
			return
		})
		.catch((error) => {
			console.log(error)
			return error
		})
}

export const dbUpdateCardStatus = (gamecode, status, currentIndex) => {
	console.log('updating card status in fb...')
	const gamePath = firebase.firestore().collection('games').doc(gamecode)
	return firebase.firestore().runTransaction((transaction) => {
		return transaction
			.get(gamePath)
			.then((game) => {
				if (!game.exists) {
					console.log('game does not exist')
					throw new Error("game doesn't exist...")
				}

				const { cardIndex, deck, round, half, status: roundStatus } = game.data().gameplay

				let updatedCard

				console.log(deck[currentIndex])
				//Card status changed based on giver/watcher updating within the round
				if (roundStatus === 'in progress') {
					//If the index provided no longer matches, giver and watcher may have selected a button at nearly the same time. This allows only one update to occur and discard
					console.log(cardIndex)
					console.log(currentIndex)
					if (cardIndex !== currentIndex) {
						console.log("card index was already changed. Don't proceed")
						throw new Error("card index was already changed. Don't proceed")
					}

					updatedCard = {
						...deck[currentIndex],
						status: status,
						//Will be used to filter cards that were played in the current round
						roundPlayed: `${round}-${half}`,
					}
				}
				//Card status changed by watcher updating card statuses as needed
				else if (roundStatus === 'postround') {
					updatedCard = {
						...deck[currentIndex],
						status: status,
					}
				}

				const cardPath = `gameplay.deck.${currentIndex}`
				transaction.update(gamePath, {
					//Only change the cardIndex for in round card changes. Stays the same for postround status changes
					'gameplay.cardIndex': roundStatus === 'in progress' ? currentIndex + 1 : currentIndex,
					[cardPath]: updatedCard,
				})
			})
			.then(() => {
				console.log('transaction successful')
				return
			})
			.catch((error) => {
				console.log(error)
			})
	})
}

export const dbUpdateGameScore = (gamecode) => {
	console.log('Updating score in firestore...')

	const gamePath = firebase.firestore().collection('games').doc(`${gamecode}`)
	return firebase.firestore().runTransaction((transaction) => {
		return transaction.get(gamePath).then((game) => {
			if (!game.exists) {
				console.log('game does not exist')
				throw new Error("game doesn't exist...")
			}

			console.log(game.data())

			const data = game.data()
			const { skipPenalty } = data
			const { deck, round, half } = data.gameplay
			const skipScore = skipPenalty === 'full' ? 1 : skipPenalty === 'half' ? 0.5 : 0
			const deckArr = Object.values(deck)
			const givingTeam = half === 'top' ? 'team 1' : 'team2'
			console.log(deckArr)
			//giving score: number of cards player this round, this half, and with status of correct get 1 point
			const roundScore = deckArr.reduce(
				(score, card) => {
					console.log(score)
					if (card.roundPlayed === `${round}-${half}` && card.status !== 'discard') {
						if (card.status === 'correct') {
							return {
								...score,
								giving: score.giving + 1,
							}
						} else if (card.status === 'skipped') {
							return {
								...score,
								watching: score.watching + 1 * skipScore,
							}
						}
					}
					return score
				},
				{ giving: 0, watching: 0 }
			)

			//watching score: number of cards skipped * skippingPenalty
			console.log(roundScore)
			const givingTeamIncrement = firebase.firestore.FieldValue.increment(roundScore.giving)
			const watchingTeamIncrement = firebase.firestore.FieldValue.increment(roundScore.watching)

			transaction.update(gamePath, {
				'gameplay.score.team1': givingTeam === 'team 1' ? givingTeamIncrement : watchingTeamIncrement,
				'gameplay.score.team2': givingTeam === 'team 2' ? givingTeamIncrement : watchingTeamIncrement,
			})
		})
	})
}

export const dbUpdateRoundHalf = (gamecode) => {
	//transaction: read current round, half. write: team rotations/turn
	console.log('updating round half in firestore...')

	const gamePath = firebase.firestore().collection('games').doc(`${gamecode}`)
	return firebase.firestore().runTransaction((transaction) => {
		return transaction.get(gamePath).then((game) => {
			if (!game.exists) {
				console.log('game does not exist...')
				throw new Error("game doesn't exist...")
			}

			const data = game.data()
			const { round, half, team1Turn, team2Turn, team1Rotations, team2Rotations } = data.gameplay
			const { players } = data
			console.log(round, half, team1Turn, team2Turn, team1Rotations, team2Rotations)
			const team1Count = players.filter((player) => player.team === 'team 1').length
			const team2Count = players.filter((player) => player.team === 'team 2').length
			let newHalf, newTeam1Turn, newTeam2Turn, newTeam1Rotations, newTeam2Rotations

			//top: Team 1 player has completed turn as giver. Time to increment turns/rotaions for Team 2
			if (half === 'top') {
				newHalf = 'bottom'
				newTeam1Turn = team1Turn //stays the same until time for team 1 player again
				newTeam1Rotations = team1Rotations
				
				//For first round, team2Turn is 0 by default (first player) and doesn't need to be incremented
				//If this is the first round set at 0 for first player, or increment it so next player can go
				newTeam2Turn = round === 1 ? 0 : team2Turn + 1
				newTeam2Rotations = team2Rotations
				//Each player on team 2 has had a turn. Start turn over back at first player, increment rotations to show all team members have completed a turn
				if (newTeam2Turn >= team2Count) {
					newTeam2Turn = 0
					newTeam2Rotations = team2Rotations + 1
				}
				//half === bottom: Team 2 has completed turn as giver. Time to increment turns/rotaions for Team 1
			} else {
				newHalf = 'top'
				newTeam2Turn = team2Turn //stays the same until time for team 2 player as giver again
				newTeam2Rotations = team2Rotations
				newTeam1Turn = team1Turn + 1
				newTeam1Rotations = team1Rotations
				//Each player on team 1 has had a turn. Start turn over back at first player, increment rotations to show all team members have completed a turn
				if (newTeam1Turn >= team1Count) {
					newTeam1Turn = 0
					newTeam1Rotations = team1Rotations + 1
				}
			}

			console.log(newHalf)
			console.log(newTeam1Rotations)
			console.log(newTeam1Turn)
			console.log(newTeam2Rotations)
			console.log(newTeam2Turn)

			transaction.update(gamePath, {
				'gameplay.half': newHalf,
				'gameplay.team1Rotations': newTeam1Rotations,
				'gameplay.team1Turn': newTeam1Turn,
				'gameplay.team2Rotations': newTeam2Rotations,
				'gameplay.team2Turn': newTeam2Turn,
			})
		})
	})
}
