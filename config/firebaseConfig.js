import {initializeApp} from "firebase/app"
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyCoJ-Nhz79oGe6eknzQiwuFzmmZM7QVXAk",
    authDomain: "routine-keeper.firebaseapp.com",
    projectId: "routine-keeper",
    storageBucket: "routine-keeper.appspot.com",
    messagingSenderId: "442624228672",
    appId: "1:442624228672:web:305e42b0d5a313bf830ea5"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)

 