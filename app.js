// ============================================
// SCREEN SWITCHER - shows one screen at a time
// ============================================
function showScreen(screenId) {
  // Hide all screens first
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });

  // Show only the requested screen
  document.getElementById(screenId).classList.add('active');
}


// ============================================
// LOGIN BUTTON
// ============================================
document.getElementById('btn-login').addEventListener('click', function() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  // Basic check - fields must not be empty
  if (email === '' || password === '') {
    document.getElementById('auth-error').textContent = 'Please fill in all fields.';
    return;
  }

  alert('✅ Login clicked!\nEmail: ' + email);
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

  alert('📝 Register clicked!\nEmail: ' + email);
});


// ============================================
// LOGOUT BUTTON
// ============================================
document.getElementById('btn-logout').addEventListener('click', function() {
  alert('🚪 Logged out!');
  showScreen('screen-login');
});


// ============================================
// CREATE ROOM BUTTON
// ============================================
document.getElementById('btn-create-room').addEventListener('click', function() {
  alert('➕ Create Room clicked!\nWe will generate a room code soon.');
});


// ============================================
// JOIN ROOM BUTTON
// ============================================
document.getElementById('btn-join-room').addEventListener('click', function() {
  var code = document.getElementById('join-code').value;

  if (code === '') {
    alert('⚠️ Please enter a room code first.');
    return;
  }

  alert('🔗 Join Room clicked!\nRoom Code: ' + code);
});