
// ==========================
// Firebase Storage Utilities
// ==========================

// Save data to a path in Firebase Realtime Database
function saveData(path, data) {
    firebase.database().ref(path).set(data);
}

// Load data once from a path
function loadData(path, callback) {
    firebase.database().ref(path).once('value', snapshot => {
        callback(snapshot.val() || []);
    });
}

// Listen for real-time updates on a path
function listenData(path, callback) {
    firebase.database().ref(path).on('value', snapshot => {
        callback(snapshot.val() || []);
    });
}

// Remove data at a path
function removeData(path) {
    firebase.database().ref(path).remove();
}