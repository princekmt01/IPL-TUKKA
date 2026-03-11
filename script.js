let matches=loadData("matches")

let players=loadData("players")

let predictions=loadData("predictions")

let history=loadData("history")

let seasonPoints=loadData("seasonPoints") || {}

function showPage(id){

document.querySelectorAll(".page").forEach(p=>p.style.display="none")

document.getElementById(id).style.display="block"

}

showPage("matches")

for(let i=1;i<=400;i++){

let opt=document.createElement("option")

opt.text=i

numberSelect.add(opt)

}

function adminLogin(){

if(adminPassword.value==="prince@ipltukka"){

adminPanel.style.display="block"

}

}

function addPlayer(){

players.push(newPlayer.value)

saveData("players",players)

updatePlayers()

}

function deletePlayer(){

players=players.filter(p=>p!=deletePlayerName.value)

saveData("players",players)

updatePlayers()

}

function updatePlayers(){

playerSelect.innerHTML=""

players.forEach(p=>{

let o=document.createElement("option")

o.text=p

playerSelect.add(o)

})

}

updatePlayers()

function addMatch(){

let m={

num:matchNumber.value,

t1:team1.value,

t2:team2.value,

deadline:deadline.value

}

matches.push(m)

saveData("matches",matches)

updateMatches()

}

function deleteMatch(){

matches=matches.filter(m=>m.num!=deleteMatchNumber.value)

saveData("matches",matches)

updateMatches()

}

function updateMatches(){

matchSelect.innerHTML=""

matches.forEach(m=>{

let o=document.createElement("option")

o.value=m.num

o.text="Match "+m.num+" "+m.t1+" vs "+m.t2

matchSelect.add(o)

})

}

updateMatches()

function submitPrediction(){

let num=parseInt(numberSelect.value)

let tukka=[num,num+1,num+2,num+3,num+4,num+5]

let p={

player:playerSelect.value,
match:matchSelect.value,
team:teamPrediction.value,
tukka:tukka

}

predictions.push(p)

saveData("predictions",predictions)

showTukkas()

}

function showTukkas(){

tukkaDisplay.innerHTML=""

predictions.forEach(p=>{

if(p.match==matchSelect.value){

let line=document.createElement("p")

line.innerHTML=p.team+" - "+p.player+"'s tukka - "+p.tukka.join(",")

tukkaDisplay.append(line)

}

})

}

function clearData(){

localStorage.clear()

location.reload()

}
