// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyBuCWmfyeRl0h6FEoS9_vlam5Hf0Zw3fW0',

  authDomain: 'aditya-singhal-website.firebaseapp.com',

  projectId: 'aditya-singhal-website',

  storageBucket: 'aditya-singhal-website.appspot.com',

  messagingSenderId: '476753482582',

  appId: '1:476753482582:web:9b25b2d3cd6ff3ba66bcf7',

  measurementId: 'G-CSRQLVW2TG',
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const analytics = getAnalytics(firebaseapp);

// Get Auth instance
const auth = getAuth(firebaseapp);

export { auth, firebaseapp };
