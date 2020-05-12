import { database } from "./firebase_conn"

//Confirms whether gamecode entered is valid
export function confirmGameCode(gamecode) {
  return new Promise(function (resolve, reject) {
    try {
      const ref = database.ref(`games/${gamecode}/status`)
      ref.once("value").then(function (snapshot) {
        const value = snapshot.val() || "does not exist"
        console.log(value)
        if (value === "pending" || "adding") {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

//Creates initial game object and sets property in
//firebase to gamecode with value of game object.
export async function createNewGame(gamecode) {
  console.log("creating new game")
  const game = {
    status: "new",
    deck: {
      cards: "none",
      currentCardIndex: 0,
      deckNumber: 1
    },    
    players: "none", //Set to none to allow a listener to be attached immediately
    team1: {
      teamName: "Team 1",
      players: [],
      score: 0,
    },
    team2: {
      teamName: "Team 2",
      players: [],
      score: 0,
    },
    round: {
      number: 1,
      status: "pre"
    }
  }
  return await database
    .ref(`games/${gamecode}`)
    .set(game)
    .then(() => {
      return true
    })
    .catch((err) => {
      console.warn(err)
      return err
    })
}

//Confirms that a firebase path exists in the database.
export function confirmPathExists(pathToCheck) {
  console.log("checking: ", pathToCheck)
  const ref = database.ref(pathToCheck)
  return ref.once("value").then(function (snapshot) {
    return snapshot.exists()
  })
}

/*
Input:
   A gamecode
   The firebase path that requires a listener
   onChange: Function invoked when listener is set and each time a change at the path takes place.

Output:
  Initial attach: Returns a promise with current value at the path of the listner
  Each path update: Calls the onChange function passed. 
*/

export function attachListener(path, callback, listenerType) {
  console.log("about to attach a listener: ", listenerType)
    database.ref(path).on("value", function (snapshot) {
      const value = snapshot.val()
      console.log(value)
      callback(listenerType, value)     
    })
}

//Adds the player object to the provided FB path. No "then"
// because a listener callback function is triggered
export function addPlayerToPath(player, path) {
  console.log(path)
  return database
    .ref(path)
    .set(player)
    .catch((err) => {
      console.warn(err)
      return false
    })
}

export function updatePlayerInfo(gamecode, playerId, key, value) {
  const playerRef = `games/${gamecode}/players/${playerId}/`
  console.log(playerRef)
  database
    .ref(`games/${gamecode}/players/${playerId}/`)
    .update({ [key]: value })
}

export function updateGameStatus(gamecode, status) {
  const gameStatusRef = `games/${gamecode}/`
  console.log(gameStatusRef)
  database
    .ref(gameStatusRef)
    .update({ status: status })
    .then((res) => {
      console.log("then of updateGameStatus")
    })
    .catch((err) => {
      console.log("there was an error updating game status")
      console.log(err)
    })
}

export function retrieveGameInformation(gamecode) {
  console.log("gamecode", gamecode)
  //get the players
  return new Promise(function (resolve, reject) {
    database
      .ref(`games/${gamecode}/players`)
      .once("value")
      .then(function (snapshot) {
        console.log(snapshot.val())
        resolve(snapshot.val())
      })
      .catch(function (err) {
        console.log("there was an issue retreiving the players:", err)
        reject(err)
      })
  })
}

export function updateRoundStatus(gamecode, status){ 
    database.ref(`games/${gamecode}/round`)
    .update({ status: status })
    .then((response) => {
      console.log("then of updateRound")
    })
    .catch((err) => {
      console.log("there was an error updating round status")
      console.log(err)
    })

}
export function getDeck(deck) {
  return new Promise(function (resolve, reject) {
    import("./cards").then((obj) => {
      //shuffle Deck
      resolve(obj.default.deck1)
    })
  })
}
