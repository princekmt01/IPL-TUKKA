// ==========================
// Firebase Storage Utilities
// ==========================

// Save data to a specific path in Firebase Realtime Database
function saveData(path, data) {
    return firebase.database().ref(path).set(data)
        .then(() => console.log(`Data saved at path: ${path}`))
        .catch(err => console.error("Error saving data:", err));
}

// Load data once from a path
function loadData(path, callback) {
    return firebase.database().ref(path).once('value')
        .then(snapshot => callback(snapshot.val() || {}))
        .catch(err => console.error("Error loading data:", err));
}

// Listen for real-time updates at a path
function listenData(path, callback) {
    return firebase.database().ref(path).on('value', snapshot => {
        callback(snapshot.val() || {});
    }, err => console.error("Error listening to data:", err));
}

// Remove data at a specific path
function removeData(path) {
    return firebase.database().ref(path).remove()
        .then(() => console.log(`Data removed at path: ${path}`))
        .catch(err => console.error("Error removing data:", err));
}

// Increment a numeric field atomically
function incrementField(path, field, amount) {
    const ref = firebase.database().ref(path + "/" + field);
    ref.transaction(current => (current || 0) + amount);
}

// Update a single field without overwriting the entire node
function updateField(path, field, value) {
    let updateObj = {};
    updateObj[field] = value;
    firebase.database().ref(path).update(updateObj)
        .then(() => console.log(`Field ${field} updated at path: ${path}`))
        .catch(err => console.error("Error updating field:", err));
}

// Listen for child added events
function onChildAdded(path, callback) {
    firebase.database().ref(path).on('child_added', snapshot => {
        callback(snapshot.key, snapshot.val());
    });
}

// Listen for child changed events
function onChildChanged(path, callback) {
    firebase.database().ref(path).on('child_changed', snapshot => {
        callback(snapshot.key, snapshot.val());
    });
}

// Listen for child removed events
function onChildRemoved(path, callback) {
    firebase.database().ref(path).on('child_removed', snapshot => {
        callback(snapshot.key);
    });
}