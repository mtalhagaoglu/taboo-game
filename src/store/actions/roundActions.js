import { dbUpdateRoundStatus, dbUpdateCardStatus, dbUpdateGameScore, dbUpdateRoundHalf } from 'utils/API'
import { errorActionCreator } from './errorActions'

const requestRoundStatus = () => {
	return {
		type: 'REQUEST_ROUND_STATUS_UPDATE',
	}
}

const roundStatusSuccess = (status) => {
	return {
		type: 'ROUND_STATUS_UPDATE_SUCCESS',
		payload: status,
	}
}

const requestUpdateCardStatus = () => {
	return {
		type: 'REQUEST_UPDATE_CARD_STATUS',
	}
}

const updateCardStatusSuccess = () => {
	return {
		type: 'UPDATE_CARD_STATUS_SUCCESS',
	}
}

const requestUpdateScore = () => {
	console.log('dispatching score update')
	return {
		type: 'REQUEST_UPDATE_SCORE',
	}
}

const updateScoreSuccess = () => {
	console.log('dispatching score update success')
	return {
		type: 'REQUEST_UPDATE_SCORE',
	}
}

const requestUpdateRoundHalf = () => {
	console.log('dispatching round half request')
	return {
		type: 'REQUEST_UPDATE_ROUND_HALF',
	}
}

const updateRoundHalfSuccess = () => {
	console.log('dispatching round half success')
	return {
		type: 'UPDATE_ROUND_HALF_SUCCESS',
	}
}

export const updateRoundStatus = (gamecode, newRoundStatus, currentIndex) => {
	return async (dispatch) => {
		dispatch(requestRoundStatus())
		console.log(gamecode)
		console.log(newRoundStatus)

		//If round has ended, change the status of the last card displayed so it does not display next round
		if (newRoundStatus === 'postround') {
			console.log('round is ending, but need to update card# ', currentIndex)
			await dbUpdateCardStatus(gamecode, 'discard', currentIndex)
		}
		dbUpdateRoundStatus(gamecode, newRoundStatus)
			.then(() => {
				console.log('dispatching success')
				dispatch(roundStatusSuccess(newRoundStatus))
				return
				// })
			})
			.catch((error) => {
				dispatch(errorActionCreator('ROUND_STATUS_UPDATE_FAILURE', error))
				return
			})
	}
}

export const changeCardStatus = (gamecode, status, currentIndex) => {
	return (dispatch) => {
		//dispatch changing card in progress
		//set the status of the current card in firebase, and update the index
		//dispatch changing card complete
		dispatch(requestUpdateCardStatus())
		dbUpdateCardStatus(gamecode, status, currentIndex)
			.then(() => {
				dispatch(updateCardStatusSuccess())
			})
			.catch((error) => {
				dispatch(errorActionCreator('UPDATE_CARD_STATUS_FAILURE', error))
			})
	}
}

export const updateRoundScore = (gamecode) => {
	return (dispatch) => {

		return new Promise((resolve) => {
			dispatch(requestUpdateScore())
			dbUpdateGameScore(gamecode)
				.then(() => {
					console.log('score updated')
				})
				.then(() => {
					dispatch(updateScoreSuccess())
					resolve(true)
				})
				.catch((error) => {
					dispatch(errorActionCreator('UPDATE_SCORE_FAILURE', error))
				})
		})
	}
}

export const completeRound = (gamecode) => {
	return (dispatch) => {
		dispatch(requestUpdateRoundHalf())
		dbUpdateRoundHalf(gamecode).then(() => {
			console.log('team half updated')
			dbUpdateRoundStatus(gamecode, 'preround')
				.then(() => {
					
					dispatch(updateRoundHalfSuccess())
				})
				.catch((error) => {
					dispatch(errorActionCreator('UPDATE_ROUND_HALF_FAILURE', error))
				})
		})
	}
}
