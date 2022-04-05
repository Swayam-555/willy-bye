import firebase from 'firebase';
require("@firebase/firestore");


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBAS1qiXFdkouY5AvhqHr81K_wt4_2Tgyo",
    authDomain: "e-lib-e58ec.firebaseapp.com",
    projectId: "e-lib-e58ec",
    storageBucket: "e-lib-e58ec.appspot.com",
    messagingSenderId: "195274640992",
    appId: "1:195274640992:web:92395ea408e0c0f874fd05",
    measurementId: "G-RSSHR44W5S"
};
if (!firebase.apps.length)
    firebase.initializeApp(firebaseConfig);

export default firebase.firestore();