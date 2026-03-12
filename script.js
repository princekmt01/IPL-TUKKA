
// ==========================
// Firebase Initialization
// ==========================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "yourproject.firebaseapp.com",
    databaseURL: "https://yourproject-default-rtdb.firebaseio.com",
    projectId: "yourproject",
    storageBucket: "yourproject.appspot.com",
    messagingSenderId: "1234567890",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================
// Global References
// ==========================
const matchSelect = document.getElementById("matchSelect");
const playerSelect = document.getElementById("playerSelect");
const numberSelect = document.getElementById("numberSelect");
const teamPrediction = document.getElementById("teamPrediction");
const tukkaDisplay = document.getElementById("tukkaDisplay");
const pointsTable = document.getElementById("pointsTable");
const adminPanel = document.getElementById("adminPanel");
const adminPassword = document.getElementById("adminPassword");

// Fill number select 1-400
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
    if(adminPassword.value==="prince@ipltukka"){
        adminPanel.style.display="block";
    } else {
        alert("Incorrect Password!");
    }
}

// ==========================
// Players
// ==========================
function updatePlayers(){
    playerSelect.innerHTML = "";
    db.ref("players").on("value", snapshot => {
        let players = snapshot.val() || {};
        for(let p in players){
            let o = document.createElement("option");
            o.text = p;
            playerSelect.add(o);
        }
    });
}

function addPlayer(){
    if(newPlayer.value.trim()==="") return;
    db.ref("players/" + newPlayer.value).set(true);
    newPlayer.value = "";
}

function deletePlayer(){
    db.ref("players/" + deletePlayerName.value).remove();
    deletePlayerName.value = "";
}

updatePlayers();

// ==========================
// Matches
// ==========================
function updateMatches(){
    matchSelect.innerHTML = "";
    db.ref("matches").on("value", snapshot => {
        let matches = snapshot.val() || {};
        for(let key in matches){
            let m = matches[key];
            let o = document.createElement("option");
            o.value = key;
            o.text = "Match " + key + " " + m.t1 + " vs " + m.t2;
            matchSelect.add(o);
        }
        showTukkas(); // refresh predictions
    });
}

function addMatch(){
    if(matchNumber.value.trim()==="" || team1.value.trim()==="" || team2.value.trim()==="") return;
    let m = {
        t1: team1.value,
        t2: team2.value,
        deadline: deadline.value
    };
    db.ref("matches/" + matchNumber.value).set(m);
    matchNumber.value = team1.value = team2.value = "";
}

function deleteMatch(){
    db.ref("matches/" + deleteMatchNumber.value).remove();
    deleteMatchNumber.value = "";
}

updateMatches();

// ==========================
// Predictions
// ==========================
function submitPrediction(){
    let num = parseInt(numberSelect.value);
    let tukka = [num, num+1, num+2, num+3, num+4, num+5];
    if(playerSelect.value==="" || teamPrediction.value==="") return;

    let p = {
        team: teamPrediction.value,
        tukka: tukka
    };

    db.ref(`predictions/${matchSelect.value}/${playerSelect.value}`).set(p);
}

// Show predictions real-time
function showTukkas(){
    tukkaDisplay.innerHTML = "";
    let matchId = matchSelect.value;
    if(!matchId) return;

    db.ref(`predictions/${matchId}`).on("value", snapshot => {
        tukkaDisplay.innerHTML = "";
        let data = snapshot.val() || {};
        for(let player in data){
            let p = data[player];
            let line = document.createElement("p");
            line.innerHTML = p.team + " - " + player + "'s tukka - " + p.tukka.join(",");
            tukkaDisplay.append(line);
        }
    });
}

// ==========================
// Leaderboard
// ==========================
function updateLeaderboard(){
    pointsTable.innerHTML = "";
    db.ref("seasonPoints").on("value", snapshot => {
        let points = snapshot.val() || {};
        let arr = [];
        for(let player in points){
            let p = points[player];
            arr.push({name:player, total:(p.teamPoints||0)+(p.scorePoints||0), ...p});
        }
        arr.sort((a,b)=>b.total - a.total);
        arr.forEach((p,i)=>{
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${i+1}</td><td>${p.name}</td><td>${p.teamPoints||0}</td><td>${p.scorePoints||0}</td><td>${p.total}</td>`;
            pointsTable.append(tr);
        });
    });
}

updateLeaderboard();

// ==========================
// Admin: Enter Result
// ==========================
function enterResult(){
    let winning = winningTeam.value;
    let score = parseInt(winningScore.value);

    if(!winning || isNaN(score)){
        alert("Enter valid team and score");
        return;
    }

    let matchId = matchSelect.value;
    if(!matchId) return;

    db.ref(`predictions/${matchId}`).once("value", snapshot=>{
        let data = snapshot.val() || {};
        for(let player in data){
            let p = data[player];
            let teamPoints = p.team === winning ? 10 : 0;
            let scorePoints = p.tukka.includes(score) ? 10 : 0;

            db.ref(`seasonPoints/${player}`).once("value", snap=>{
                let existing = snap.val() || {};
                db.ref(`seasonPoints/${player}`).set({
                    teamPoints: (existing.teamPoints||0) + teamPoints,
                    scorePoints: (existing.scorePoints||0) + scorePoints
                });
            });
        }
    });

    winningTeam.value = winningScore.value = "";
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
// Event Listeners
// ==========================
matchSelect.addEventListener("change", showTukkas);