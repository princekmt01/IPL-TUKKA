// ==========================
// Firebase Configuration
// ==========================
const firebaseConfig = {
    apiKey: "AIzaSyCSxv0be8qF1KaG4c7Fz9zyPKSmQaK3t04",
    authDomain: "ipl-tukka-2.firebaseapp.com",
    databaseURL: "https://ipl-tukka-2-default-rtdb.firebaseio.com",
    projectId: "ipl-tukka-2",
    storageBucket: "ipl-tukka-2.appspot.com",
    messagingSenderId: "157643345361",
    appId: "1:157643345361:web:fab5c045a29aa16fb3a4f0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================
// DOM References
// ==========================
const matchSelect = document.getElementById("matchSelect");
const playerSelect = document.getElementById("playerSelect");
const numberSelect = document.getElementById("numberSelect");
const teamPrediction = document.getElementById("teamPrediction");
const tukkaDisplay = document.getElementById("tukkaDisplay");
const pointsTable = document.getElementById("pointsTable");
const adminPanel = document.getElementById("adminPanel");
const adminPassword = document.getElementById("adminPassword");

// ==========================
// Fill numbers dropdown 1-400
// ==========================
for (let i = 1; i <= 400; i++) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.text = i;
    numberSelect.add(opt);
}

// ==========================
// Page Navigation
// ==========================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}
showPage("matches");

// ==========================
// Admin Login
// ==========================
function adminLogin() {
    if (adminPassword.value === "prince@ipltukka") {
        adminPanel.style.display = "block";
    } else alert("Incorrect Password!");
}

// ==========================
// Firebase Utilities
// ==========================
function saveData(path, data) {
    return db.ref(path).set(data);
}

function loadData(path, callback) {
    db.ref(path).once("value").then(snap => callback(snap.val() || {}));
}

function listenData(path, callback) {
    db.ref(path).on("value", snap => callback(snap.val() || {}));
}

function removeData(path) {
    return db.ref(path).remove();
}

// ==========================
// Players Functions
// ==========================
function updatePlayers() {
    playerSelect.innerHTML = "";
    listenData("players", players => {
        playerSelect.innerHTML = "";
        for (let p in players) {
            const o = document.createElement("option");
            o.value = p;
            o.text = p;
            playerSelect.add(o);
        }
    });
}

function addPlayer() {
    const name = document.getElementById("newPlayer").value.trim();
    if (!name) return;
    saveData(`players/${name}`, true);
    document.getElementById("newPlayer").value = "";
}

function deletePlayer() {
    const name = document.getElementById("deletePlayerName").value.trim();
    if (!name) return;
    removeData(`players/${name}`);
    document.getElementById("deletePlayerName").value = "";
}

updatePlayers();

// ==========================
// Matches Functions
// ==========================
function updateMatches() {
    matchSelect.innerHTML = "";
    listenData("matches", matches => {
        matchSelect.innerHTML = "";
        for (let key in matches) {
            const m = matches[key];
            const o = document.createElement("option");
            o.value = key;
            o.text = `Match ${key}: ${m.t1} vs ${m.t2}`;
            matchSelect.add(o);
        }
        updateTeamPredictionOptions();
        showTukkas();
    });
}

function addMatch() {
    const num = document.getElementById("matchNumber").value.trim();
    const t1 = document.getElementById("team1").value.trim();
    const t2 = document.getElementById("team2").value.trim();
    const deadline = document.getElementById("deadline").value;

    if (!num || !t1 || !t2) return;

    saveData(`matches/${num}`, { t1, t2, deadline });

    document.getElementById("matchNumber").value = "";
    document.getElementById("team1").value = "";
    document.getElementById("team2").value = "";
    document.getElementById("deadline").value = "";
}

function deleteMatch() {
    const num = document.getElementById("deleteMatchNumber").value.trim();
    if (!num) return;
    removeData(`matches/${num}`);
    document.getElementById("deleteMatchNumber").value = "";
}

updateMatches();

// ==========================
// Update Team Dropdown based on Match
// ==========================
function updateTeamPredictionOptions() {
    const selectedOption = matchSelect.options[matchSelect.selectedIndex];
    if (!selectedOption) return;

    const text = selectedOption.text;
    const teams = text.split(": ")[1]?.split(" vs ");
    teamPrediction.innerHTML = "";
    if (!teams) return;

    teams.forEach(team => {
        const o = document.createElement("option");
        o.value = team;
        o.text = team;
        teamPrediction.add(o);
    });
}

matchSelect.addEventListener("change", () => {
    updateTeamPredictionOptions();
    showTukkas();
});

// ==========================
// Predictions Functions
// ==========================
function submitPrediction() {
    const player = playerSelect.value;
    const matchId = matchSelect.value;
    const team = teamPrediction.value;
    const num = parseInt(numberSelect.value);

    if (!player || !team || !num || !matchId) return;

    const tukka = [num, num + 1, num + 2, num + 3, num + 4, num + 5];
    saveData(`predictions/${matchId}/${player}`, { team, tukka });
    showTukkas();
}

// Show predictions live
function showTukkas() {
    const matchId = matchSelect.value;
    if (!matchId) return;

    tukkaDisplay.innerHTML = "";
    listenData(`predictions/${matchId}`, data => {
        tukkaDisplay.innerHTML = "";
        for (let player in data) {
            const p = data[player];
            const line = document.createElement("p");
            line.innerHTML = `${p.team} - ${player}'s tukka: ${p.tukka.join(",")}`;
            tukkaDisplay.append(line);
        }
    });
}

// ==========================
// Leaderboard Functions
// ==========================
function updateLeaderboard() {
    pointsTable.innerHTML = "";

    listenData("seasonPoints", points => {
        const arr = [];
        for (let player in points) {
            const p = points[player];
            arr.push({
                name: player,
                teamPoints: p.teamPoints || 0,
                scorePoints: p.scorePoints || 0,
                total: (p.teamPoints || 0) + (p.scorePoints || 0)
            });
        }

        arr.sort((a, b) => b.total - a.total);

        arr.forEach((p, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${i + 1}</td>
                            <td>${p.name}</td>
                            <td>${p.teamPoints}</td>
                            <td>${p.scorePoints}</td>
                            <td>${p.total}</td>`;
            pointsTable.append(tr);
        });
    });
}

updateLeaderboard();

// ==========================
// Admin: Enter Result
// ==========================
function enterResult() {
    const winning = document.getElementById("winningTeam").value.trim();
    const score = parseInt(document.getElementById("winningScore").value);
    const matchId = matchSelect.value;

    if (!winning || isNaN(score) || !matchId) return alert("Enter valid data");

    loadData(`predictions/${matchId}`, data => {
        for (let player in data) {
            const p = data[player];
            const teamPoints = p.team === winning ? 10 : 0;
            const scorePoints = p.tukka.includes(score) ? 10 : 0;

            loadData(`seasonPoints/${player}`, existing => {
                saveData(`seasonPoints/${player}`, {
                    teamPoints: (existing.teamPoints || 0) + teamPoints,
                    scorePoints: (existing.scorePoints || 0) + scorePoints
                });
            });
        }
    });

    document.getElementById("winningTeam").value = "";
    document.getElementById("winningScore").value = "";
}

// ==========================
// Clear All Data
// ==========================
function clearData() {
    if (confirm("This will delete all data! Are you sure?")) {
        removeData("");
        location.reload();
    }
}