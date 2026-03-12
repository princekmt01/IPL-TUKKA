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
// Fill number dropdown 1-400
// ==========================
for(let i=1;i<=400;i++){
    let opt = document.createElement("option");
    opt.text = i;
    numberSelect.add(opt);
}

// ==========================
// Page Navigation
// ==========================
function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    document.getElementById(id).style.display="block";
}
showPage("matches");

// ==========================
// Admin Login
// ==========================
function adminLogin(){
    if(adminPassword.value === "prince@ipltukka"){
        adminPanel.style.display = "block";
    } else alert("Incorrect Password!");
}

// ==========================
// Players Functions
// ==========================
function updatePlayers(){
    playerSelect.innerHTML = "";
    db.ref("players").on("value", snapshot => {
        const players = snapshot.val() || {};
        for(let p in players){
            let o = document.createElement("option");
            o.value = p;
            o.text = p;
            playerSelect.add(o);
        }
    });
}

function addPlayer(){
    const name = document.getElementById("newPlayer").value.trim();
    if(!name) return;
    db.ref("players/" + name).set(true);
    document.getElementById("newPlayer").value = "";
}

function deletePlayer(){
    const name = document.getElementById("deletePlayerName").value.trim();
    if(!name) return;
    db.ref("players/" + name).remove();
    document.getElementById("deletePlayerName").value = "";
}

updatePlayers();
// ==========================
// Matches Functions
// ==========================
function updateMatches(){
    matchSelect.innerHTML = "";
    db.ref("matches").on("value", snapshot => {
        const matches = snapshot.val() || {};
        for(let key in matches){
            const m = matches[key];
            const o = document.createElement("option");
            o.value = key;
            o.text = `Match ${key} ${m.t1} vs ${m.t2}`;
            matchSelect.add(o);
        }
        showTukkas(); // refresh predictions when matches update
    });
}

function addMatch(){
    const num = document.getElementById("matchNumber").value.trim();
    const t1 = document.getElementById("team1").value.trim();
    const t2 = document.getElementById("team2").value.trim();
    const deadline = document.getElementById("deadline").value;

    if(!num || !t1 || !t2) return;

    db.ref("matches/" + num).set({ t1, t2, deadline });

    document.getElementById("matchNumber").value = "";
    document.getElementById("team1").value = "";
    document.getElementById("team2").value = "";
    document.getElementById("deadline").value = "";
}

function deleteMatch(){
    const num = document.getElementById("deleteMatchNumber").value.trim();
    if(!num) return;
    db.ref("matches/" + num).remove();
    document.getElementById("deleteMatchNumber").value = "";
}

updateMatches();

// ==========================
// Predictions Functions
// ==========================
function submitPrediction(){
    const player = playerSelect.value;
    const matchId = matchSelect.value;
    const team = teamPrediction.value;
    const num = parseInt(numberSelect.value);

    if(!player || !team || !num || !matchId) return;

    const tukka = [num, num+1, num+2, num+3, num+4, num+5];
    db.ref(`predictions/${matchId}/${player}`).set({ team, tukka });
    showTukkas();
}

// Show predictions real-time
function showTukkas(){
    const matchId = matchSelect.value;
    if(!matchId) return;

    tukkaDisplay.innerHTML = "";

    db.ref(`predictions/${matchId}`).on("value", snapshot => {
        const data = snapshot.val() || {};
        tukkaDisplay.innerHTML = "";
        for(let player in data){
            const p = data[player];
            const line = document.createElement("p");
            line.innerHTML = `${p.team} - ${player}'s tukka - ${p.tukka.join(",")}`;
            tukkaDisplay.append(line);
        }
    });
}

// ==========================
// Event Listener
// ==========================
matchSelect.addEventListener("change", showTukkas);
// ==========================
// Leaderboard Functions
// ==========================
function updateLeaderboard(){
    pointsTable.innerHTML = "";

    db.ref("seasonPoints").on("value", snapshot => {
        const points = snapshot.val() || {};
        const arr = [];

        for(let player in points){
            const p = points[player];
            arr.push({
                name: player,
                total: (p.teamPoints||0) + (p.scorePoints||0),
                teamPoints: p.teamPoints||0,
                scorePoints: p.scorePoints||0
            });
        }

        arr.sort((a,b)=>b.total - a.total);

        arr.forEach((p,i)=>{
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${i+1}</td>
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
function enterResult(){
    const winning = document.getElementById("winningTeam").value.trim();
    const score = parseInt(document.getElementById("winningScore").value);
    const matchId = matchSelect.value;

    if(!winning || isNaN(score) || !matchId) return alert("Enter valid data");

    db.ref(`predictions/${matchId}`).once("value", snapshot => {
        const data = snapshot.val() || {};
        for(let player in data){
            const p = data[player];
            const teamPoints = p.team === winning ? 10 : 0;
            const scorePoints = p.tukka.includes(score) ? 10 : 0;

            db.ref(`seasonPoints/${player}`).once("value", snap => {
                const existing = snap.val() || {};
                db.ref(`seasonPoints/${player}`).set({
                    teamPoints: (existing.teamPoints||0) + teamPoints,
                    scorePoints: (existing.scorePoints||0) + scorePoints
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
function clearData(){
    if(confirm("This will delete all data! Are you sure?")){
        db.ref().remove();
        location.reload();
    }
}

// ==========================
// Firebase Utilities (Optional)
// ==========================
function saveData(path, data){ db.ref(path).set(data); }
function loadData(path, callback){ db.ref(path).once("value", snap=>callback(snap.val()||{})); }
function listenData(path, callback){ db.ref(path).on("value", snap=>callback(snap.val()||{})); }
function removeData(path){ db.ref(path).remove(); }