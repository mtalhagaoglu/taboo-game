import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Cd2Uw8cJy7luKpVXZbmP2Oh2NcM6FbQ",
  authDomain: "taboo-game-8e775.firebaseapp.com",
  databaseURL: "https://taboo-game-8e775-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "taboo-game-8e775",
  storageBucket: "taboo-game-8e775.appspot.com",
  messagingSenderId: "211659342195",
  appId: "1:211659342195:web:1d7bf04cd848283ceb4506",
  measurementId: "G-FZ399CPWCN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

//Initialize firestore
firebase.firestore()

export default firebase
