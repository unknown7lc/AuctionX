// ============================================
// FIREBASE SETUP
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAABN4U5N4mxXwkiIBLRsprpv563mR_wd8",
  authDomain: "ipl-auction-game-eae92.firebaseapp.com",
  projectId: "ipl-auction-game-eae92",
  storageBucket: "ipl-auction-game-eae92.firebasestorage.app",
  messagingSenderId: "525729954460",
  appId: "1:525729954460:web:0fbb3ff950a0deddc20b59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ============================================
// SCREEN SWITCHER
// ============================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}


// ============================================
// AUTH STATE LISTENER
// Automatically shows correct screen based on login status
// ============================================
onAuthStateChanged(auth, function(user) {
  if (user) {
    // User is logged in
    document.querySelector('#lobby-user strong').textContent = user.email;
    showScreen('screen-lobby');
  } else {
    // User is logged out
    showScreen('screen-login');
  }
});


// ============================================
// REGISTER BUTTON
// ============================================
document.getElementById('btn-register').addEventListener('click', function() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  if (email === '' || password === '') {
    document.getElementById('auth-error').textContent = 'Please fill in all fields.';
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(function(userCredential) {
      console.log('Registered:', userCredential.user.email);
      // onAuthStateChanged will handle screen switch
    })
    .catch(function(error) {
      document.getElementById('auth-error').textContent = error.message;
    });
});


// ============================================
// LOGIN BUTTON
// ============================================
document.getElementById('btn-login').addEventListener('click', function() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  if (email === '' || password === '') {
    document.getElementById('auth-error').textContent = 'Please fill in all fields.';
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(function(userCredential) {
      console.log('Logged in:', userCredential.user.email);
      // onAuthStateChanged will handle screen switch
    })
    .catch(function(error) {
      document.getElementById('auth-error').textContent = error.message;
    });
});


// ============================================
// LOGOUT BUTTON
// ============================================
document.getElementById('btn-logout').addEventListener('click', function() {
  signOut(auth)
    .then(function() {
      console.log('Logged out');
      // onAuthStateChanged will handle screen switch
    })
    .catch(function(error) {
      console.error('Logout error:', error);
    });
});


// ============================================
// CREATE ROOM BUTTON
// ============================================
document.getElementById('btn-create-room').addEventListener('click', function() {
  alert('➕ Create Room — coming in next step!');
});


// ============================================
// HELPER - Generate random 6 digit room code
// ============================================
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}


// ============================================
// CREATE ROOM BUTTON
// ============================================
document.getElementById('btn-create-room').addEventListener('click', async function() {
  var user = auth.currentUser;
  if (!user) return;

  var roomCode = generateRoomCode();

  try {
    // Save room to Firestore
    await setDoc(doc(db, 'rooms', roomCode), {
      code: roomCode,
      host: user.email,
      hostId: user.uid,
      status: 'waiting',
      createdAt: new Date(),
      players: {
        [user.uid]: {
          email: user.email,
          joinedAt: new Date()
        }
      }
    });

    // Show the room screen
    document.getElementById('room-code-display').textContent = roomCode;
    showScreen('screen-room');

    // Start listening for players
    listenToRoom(roomCode);

  } catch (error) {
    alert('Error creating room: ' + error.message);
  }
});


// ============================================
// JOIN ROOM BUTTON
// ============================================
document.getElementById('btn-join-room').addEventListener('click', async function() {
  var user = auth.currentUser;
  if (!user) return;

  var code = document.getElementById('join-code').value.toUpperCase().trim();

  if (code === '') {
    alert('⚠️ Please enter a room code.');
    return;
  }

  try {
    var roomRef = doc(db, 'rooms', code);
    var roomSnap = await getDoc(roomRef);

    // Check if room exists
    if (!roomSnap.exists()) {
      alert('❌ Room not found! Check the code and try again.');
      return;
    }

    // Check if room is still open
    if (roomSnap.data().status !== 'waiting') {
      alert('⚠️ This room has already started!');
      return;
    }

    // Add player to room
    await updateDoc(roomRef, {
      ['players.' + user.uid]: {
        email: user.email,
        joinedAt: new Date()
      }
    });

    // Show room screen
    document.getElementById('room-code-display').textContent = code;
    showScreen('screen-room');

    // Start listening for players
    listenToRoom(code);

  } catch (error) {
    alert('Error joining room: ' + error.message);
  }
});


// ============================================
// LISTEN TO ROOM - Real time players list
// ============================================
function listenToRoom(roomCode) {
  var roomRef = doc(db, 'rooms', roomCode);

  onSnapshot(roomRef, function(snapshot) {
    if (!snapshot.exists()) return;

    var data = snapshot.data();
    var players = data.players || {};
    var playerList = document.getElementById('player-list');

    // Clear current list
    playerList.innerHTML = '<h3>👥 Players in Room:</h3>';

    // Add each player
    Object.values(players).forEach(function(player) {
      var div = document.createElement('div');
      div.className = 'player-item';
      div.textContent = '🏏 ' + player.email;
      playerList.appendChild(div);
    });

    // Show start button only for host
    var currentUser = auth.currentUser;
    if (currentUser && data.hostId === currentUser.uid) {
      document.getElementById('btn-start-auction').style.display = 'block';
    } else {
      document.getElementById('btn-start-auction').style.display = 'none';
    }
  });
}


// ============================================
// START AUCTION BUTTON
// ============================================
document.getElementById('btn-start-auction').addEventListener('click', function() {
  alert('🏏 Auction Starting — coming in next step!');
});
