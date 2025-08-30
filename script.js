'use strict';
const players = []; // Array to store all player objects
const queuePlayers = [];
const PairHistory = [];
const courtPlayers = {
  1: [],
  2: [],
  3: [],
}; // Array to store players currently on the court

// Load from localStorage if available
const storedPlayers = localStorage.getItem('players');
const storedQueuePlayers = localStorage.getItem('queuePlayers');
const storedCourtPlayers = localStorage.getItem('courtPlayers');

if (storedPlayers) {
  players.push(...JSON.parse(storedPlayers));
  console.log('Loaded players:', players);
}
if (storedQueuePlayers) {
  queuePlayers.push(...JSON.parse(storedQueuePlayers));
  console.log('Loaded queue players:', queuePlayers);
  // Update the queue display
}
if (storedCourtPlayers) {
  const loadedCourts = JSON.parse(storedCourtPlayers);
  Object.keys(courtPlayers).forEach(key => {
    courtPlayers[key] = loadedCourts[key] || [];

    console.log(`Loaded court ${key} players:`, courtPlayers[key]);
    // Update the court display for each court
  });
}

function saveData() {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('queuePlayers', JSON.stringify(queuePlayers));
  localStorage.setItem('courtPlayers', JSON.stringify(courtPlayers));
  localStorage.setItem('PairHistory', JSON.stringify(PairHistory));
}

function clearData() {
  localStorage.removeItem('players');
  localStorage.removeItem('queuePlayers');
  localStorage.removeItem('courtPlayers');
  localStorage.removeItem('PairHistory');
}

function updatePlayerCount() {
  document.getElementById(
    'player-count'
  ).textContent = `${players.length} on standby`;
}

function addNameToHistory(name1, name2) {
  // Create a new array containing the two names as a pair.
  const namePair = [name1, name2];

  // Add (push) the new pair into the main PairHistory array if the pair does not exist, regarding of the order.
  //for example, player1,player2 cannot exist if player2,player1 exists already.
  const reversePair = [name2, name1];
  if (
    !PairHistory.some(
      pair => JSON.stringify(pair) === JSON.stringify(namePair)
    ) &&
    !PairHistory.some(
      pair => JSON.stringify(pair) === JSON.stringify(reversePair)
    )
  ) {
    PairHistory.push(namePair);
  }
  saveData();
  console.log('Pair added to history:', namePair);
}

function getPairHistory() {
  return PairHistory;
}

function hasPairPlayedBefore(playerA, playerB, pairHistory) {
  return pairHistory.some(
    pair =>
      (pair[0] === playerA.name && pair[1] === playerB.name) ||
      (pair[0] === playerB.name && pair[1] === playerA.name)
  );
}

function isValidGroup(players, pairHistory) {
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      if (hasPairPlayedBefore(players[i], players[j], pairHistory)) {
        return false;
      }
    }
  }
  return true;
}

function loadAllContents() {
  // Standby List
  const standbyList = document.getElementById('standby-list');
  standbyList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-matches', player.matches);
    standbyList.appendChild(li);
  });

  // Queue List
  const queuePlayersDiv = document.getElementById('queue-players');
  queuePlayersDiv.innerHTML = '';
  if (queuePlayers.length > 0 && queuePlayers[0].length > 0) {
    const ul = document.createElement('ul');
    ul.className = 'queue-list';
    queuePlayers[0].forEach((p, idx) => {
      const li = document.createElement('li');
      li.textContent =
        p.name === 'No Player'
          ? 'No Player'
          : `${p.name} (Matches: ${p.matches})`;
      ul.appendChild(li);

      if (idx === 1) {
        const vsDiv = document.createElement('div');
        vsDiv.textContent = 'vs.';
        //vsDiv.style.textAlign = 'center';
        vsDiv.style.fontWeight = 'bold';
        vsDiv.style.margin = '4px 0';
        ul.appendChild(vsDiv);
      }
    });
    queuePlayersDiv.appendChild(ul);
  }

  // Court Lists (for each court)
  Object.keys(courtPlayers).forEach(courtNum => {
    const courtList = document.getElementById(`court-list-${courtNum}`);
    if (courtList) {
      courtList.innerHTML = '';
      courtPlayers[courtNum].forEach((player, idx) => {
        const li = document.createElement('li');
        li.textContent = `${player.name}`;
        li.setAttribute('data-name', player.name);
        li.setAttribute('data-matches', player.matches);
        courtList.appendChild(li);

        if (idx === 1) {
          const vsDiv = document.createElement('div');
          vsDiv.textContent = 'vs.';
          //vsDiv.style.textAlign = 'center';
          vsDiv.style.fontWeight = 'bold';
          vsDiv.style.margin = '4px 0';
          li.appendChild(vsDiv);
        }
      });
    }
  });

  // Update player count
  updatePlayerCount();
}

//load all contents into new open/refresh browser window
window.addEventListener('DOMContentLoaded', function () {
  loadAllContents();
});

document.getElementById('clear-btn').addEventListener('click', function () {
  if (!confirm(`Delete all data? This cannot be undone.`)) return;

  clearData();
  loadAllContents();

  console.log('Data cleared and contents reloaded.');

  location.reload();
});

// Add event listener to standby-list for clicks on any <li> (using event delegation)
document
  .getElementById('standby-list')
  .addEventListener('click', function (event) {
    if (event.target && event.target.nodeName === 'LI') {
      if (!confirm(`Add ${event.target.textContent} to Queue ?`)) return;

      const clickedText = event.target.textContent;
      const playerIndex = players.findIndex(
        p => `${p.name} (Matches: ${p.matches})` === clickedText
      );

      if (playerIndex === -1) return; // Player not found in standby

      // Look for 'No Player' in the first group of queuePlayers
      if (
        queuePlayers.length > 0 &&
        queuePlayers[0].some(p => p.name === 'No Player')
      ) {
        // Find the index of 'No Player'
        const noPlayerIdx = queuePlayers[0].findIndex(
          p => p.name === 'No Player'
        );
        if (noPlayerIdx !== -1) {
          // Replace 'No Player' with the selected player
          queuePlayers[0][noPlayerIdx] = players[playerIndex];
          // Remove the player from standby
          players.splice(playerIndex, 1);
          saveData();

          // Update the standby-list UI
          const standbyList = document.getElementById('standby-list');
          standbyList.innerHTML = '';
          players.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.name} (Matches: ${p.matches})`;
            li.setAttribute('data-name', p.name);
            li.setAttribute('data-matches', p.matches);
            standbyList.appendChild(li);
          });

          // Update the queue display as a list
          const queuePlayersDiv = document.getElementById('queue-players');
          queuePlayersDiv.innerHTML = '';
          if (queuePlayers.length > 0 && queuePlayers[0].length > 0) {
            const ul = document.createElement('ul');
            ul.className = 'queue-list';
            queuePlayers[0].forEach((p, idx) => {
              const li = document.createElement('li');
              li.textContent =
                p.name === 'No Player'
                  ? 'No Player'
                  : `${p.name} (Matches: ${p.matches})`;
              ul.appendChild(li);

              if (idx === 1) {
                const vsDiv = document.createElement('div');
                vsDiv.textContent = 'vs.';
                //vsDiv.style.textAlign = 'center';
                vsDiv.style.fontWeight = 'bold';
                vsDiv.style.margin = '4px 0';
                ul.appendChild(vsDiv);
              }
            });
            queuePlayersDiv.appendChild(ul);
          }
          updatePlayerCount();
        }
      }
      // else: do nothing if there is no 'No Player' slot
    }
  });

// Add event listeners to court-list-1, court-list-2, and court-list-3 for clicks on any <li>
['court-list-1', 'court-list-2', 'court-list-3'].forEach(listId => {
  document.getElementById(listId).addEventListener('click', function (event) {
    if (event.target && event.target.nodeName === 'LI') {
      const clickedLI = event.target;
      const listItems = Array.from(this.querySelectorAll('li'));
      const playerIndex = listItems.indexOf(clickedLI);
      const courtNum = listId.split('-')[2]; // "1", "2", or "3"
      let playerText = clickedLI.textContent;
      if (playerText.includes('vs.')) {
        playerText = playerText.replace('vs.', '').trim();
      }
      // Only allow swap if not clicking the "vs." divider
      if (playerText && playerText !== 'vs.') {
        showModal(courtNum, playerIndex);
      }
    }
  });
});

// Add event listener to queue-players for clicks on any <li> (using event delegation)
document
  .getElementById('queue-players')
  .addEventListener('click', function (event) {
    if (confirm(`Move ${event.target.textContent} to Stand By?`)) {
      // User clicked OK
      // Move the player from queuePlayers to players list here

      const clickedText = event.target.textContent;
      const playerIndex = queuePlayers[0].findIndex(
        p => `${p.name} (Matches: ${p.matches})` === clickedText
      );

      if (playerIndex !== -1) {
        // Remove the player from queuePlayers[0] using splice
        const [removedPlayer] = queuePlayers[0].splice(playerIndex, 1);

        // Add the removed player back to the standby list
        players.push(removedPlayer);

        // Insert a placeholder at the same position
        queuePlayers[0].splice(playerIndex, 0, {
          name: 'No Player',
          matches: '',
        });

        saveData();

        // Update the queue display
        const queuePlayersDiv = document.getElementById('queue-players');
        queuePlayersDiv.innerHTML = '';
        if (queuePlayers.length > 0 && queuePlayers[0].length > 0) {
          const ul = document.createElement('ul');
          ul.className = 'queue-list';
          queuePlayers[0].forEach((p, idx) => {
            const li = document.createElement('li');
            li.textContent =
              p.name === 'No Player'
                ? 'No Player'
                : `${p.name} (Matches: ${p.matches})`;
            ul.appendChild(li);

            // if (idx === 1) {
            //   const vsDiv = document.createElement('div');
            //   vsDiv.textContent = 'vs.';
            //   //vsDiv.style.textAlign = 'center';
            //   vsDiv.style.fontWeight = 'bold';
            //   vsDiv.style.margin = '4px 0';
            //   ul.appendChild(vsDiv);
            // }

            if (idx === 1) {
              const vsLi = document.createElement('li');
              vsLi.textContent = 'vs.';
              vsLi.className = 'vs-item'; // Give it a class for styling
              ul.appendChild(vsLi);
            }
          });
          queuePlayersDiv.appendChild(ul);
        } else {
          // Remove the empty group if no players left
          queuePlayers.shift();
        }

        // Update the standby-list UI
        const standbyList = document.getElementById('standby-list');
        standbyList.innerHTML = '';
        players.forEach(p => {
          const li = document.createElement('li');
          li.textContent = `${p.name} (Matches: ${p.matches})`;
          li.setAttribute('data-name', p.name);
          li.setAttribute('data-matches', p.matches);
          standbyList.appendChild(li);
        });

        updatePlayerCount();
      }
      console.log(playerIndex); // This is the index of the clicked player in queuePlayers[0]
    } else {
      // User clicked Cancel (X)
      // Do nothing

      console.log(`Cancelled moving ${event.target.textContent}.`);
    }
  });

// Event listener for "add-btn" to add a new player to "standby-list"
document.getElementById('add-btn').addEventListener('click', function () {
  // Get the player name from an input field (assumed to have id="player-name")
  //console.log('Add Player button clicked');
  const playerNameInput = document.getElementById('player-name');
  const playerName = playerNameInput.value.trim();

  //console.log(playerName);

  if (playerName === '') {
    alert('Please enter a player name.');
    return;
  }
  // Check if player already exists in players
  const existsInPlayers = players.some(p => p.name === playerName);

  // Check if player exists in any queuePlayers group
  const existsInQueue = queuePlayers.some(
    group => Array.isArray(group) && group.some(p => p.name === playerName)
  );

  // Check if player exists in any courtPlayers group
  const existsInCourt = Object.values(courtPlayers).some(courtArr =>
    courtArr.some(p => p.name === playerName)
  );

  if (existsInPlayers || existsInQueue || existsInCourt) {
    alert('Player already exists!');
    return;
  }
  // Create a player object
  const player = {
    name: playerName,
    matches: 0,
  };

  players.push(player);
  saveData(); // Save the updated players array to localStorage

  // Create new list item for the player
  const li = document.createElement('li');
  li.textContent = `${playerName} (Matches: ${player.matches})`;

  // Optionally, store data attributes for future use
  li.setAttribute('data-name', playerName);
  li.setAttribute('data-matches', 0);

  // Append to the standby list
  document.getElementById('standby-list').appendChild(li);

  // Clear the input field
  playerNameInput.value = '';

  updatePlayerCount();
});

document.querySelector('.next-btn').addEventListener('click', function () {
  // Do nothing if there are already players in the queue
  if (queuePlayers.length > 0) {
    console.log('There are players in the queue');
    return;
  }

  if (players.length < 4) {
    console.log('There are less than 4 players');
    return;
  }
  //Create a new array copying players to tempPlayers array so that we can shuffle players

  //jords test
  // This creates a new array 'tempPlayers' with the same elements as 'players'

  //next Shuffle the Temp Players
  const tempPlayers = [...players];
  tempPlayers.sort(() => Math.random() - 0.5);
  console.log('Shuffled players:', tempPlayers);

  const pairHistory = getPairHistory(); // Assume this function retrieves the pair history

  // // Select the next four players from the shuffled array but check first in pair history regardless of the order. For example, Player1,Player2 is the same as Player2,Player1.
  // const nextFour = tempPlayers.slice(0, 4);
  // //Prioritize players that has the lowest number of matches and haven't played together
  // const filteredNextFour = nextFour.filter(player => {
  //   const playerHistory = pairHistory[player.name] || [];
  //   return playerHistory.length === 0; // Only include players with no history
  // });
  // console.log('Filtered next four players:', filteredNextFour);

  // MatchFound = true;

  // Find a valid group of 4 players who have not played together before
  let nextFour = null;
  for (let i = 0; i < tempPlayers.length - 3; i++) {
    for (let j = i + 1; j < tempPlayers.length - 2; j++) {
      for (let k = j + 1; k < tempPlayers.length - 1; k++) {
        for (let l = k + 1; l < tempPlayers.length; l++) {
          const group = [
            tempPlayers[i],
            tempPlayers[j],
            tempPlayers[k],
            tempPlayers[l],
          ];
          if (isValidGroup(group, pairHistory)) {
            nextFour = group;
            break;
          }
        }
        if (nextFour) break;
      }
      if (nextFour) break;
    }
    if (nextFour) break;
  }

  if (!nextFour) {
    PairHistory.length = 0;
    document.querySelector('.next-btn').click();
  }

  //jords test

  //const nextFour = players.slice(0, 4);
  saveData(); // Save the current players array to localStorage
  const queuePlayersDiv = document.getElementById('queue-players');
  const standbyList = document.getElementById('standby-list');

  // Add each player to the queue display as a list
  queuePlayersDiv.innerHTML = ''; // Clear previous content
  const ul = document.createElement('ul');
  var idx = 0;
  ul.className = 'queue-list';
  nextFour.forEach((player, idx) => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    ul.appendChild(li);

    if (idx === 1) {
      const vsDiv = document.createElement('div');
      vsDiv.textContent = 'vs.';
      //vsDiv.style.textAlign = 'center';
      vsDiv.style.fontWeight = 'bold';
      vsDiv.style.margin = '4px 0';
      ul.appendChild(vsDiv);
    }
  });
  queuePlayersDiv.appendChild(ul);

  // // Remove the added players from the players array
  // players.splice(0, nextFour.length);

  //find the added players from the players array and remove them from the list
  nextFour.forEach(addedPlayer => {
    const index = players.findIndex(player => player.name === addedPlayer.name);
    if (index !== -1) {
      players.splice(index, 1);
    }
  });

  queuePlayers.push(nextFour);
  saveData(); // Save the updated players array to localStorage
  // Update the standby-list UI

  standbyList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-matches', player.matches);
    standbyList.appendChild(li);
  });

  updatePlayerCount();
});

//ADD COURT button handler for all courts
// Add this to your script.js to handle "ADD COURT" button clicks
// document.querySelectorAll('.add-court').forEach(btn => {
//   btn.addEventListener('click', function () {
//     const courtNum = this.getAttribute('data-court');
//     const courtDiv = this.closest('.court-section-add');
//     if (!courtDiv) return;

//     console.log(courtNum);

//     // Replace the button with PLAY and DONE buttons
//     courtDiv.innerHTML = `
//       <h2>Court ${courtNum}</h2>
//       <button class="play-btn" data-court="${courtNum}">PLAY!</button>
//       <button class="done-btn" data-court="${courtNum}">DONE!</button>
//       <style>
//         background-color: #0074d9;
//       </style>
//       <ul class="court-list" id="court-list-${courtNum}"></ul>
//     `;

//     // Optionally, re-attach event listeners for the new buttons if needed
//   });
// });

// PLAY button handler for all courts
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const courtNum = this.getAttribute('data-court');
    const courtList = document.getElementById(`court-list-${courtNum}`);
    console.log('Jords was here!', courtNum);
    if (courtPlayers[courtNum].length > 0) {
      return;
    }

    if (
      queuePlayers.length > 0 &&
      queuePlayers[0].some(p => p.name === 'No Player')
    )
      return;

    // Move up to 4 players from queuePlayers to this court
    if (queuePlayers.length > 0) {
      const playersToMove = queuePlayers.shift();
      if (Array.isArray(playersToMove)) {
        courtPlayers[courtNum].push(...playersToMove);
        saveData(); // Save the updated players array to localStorage
      }
    }

    // Clear the queue display in the UI
    document.getElementById('queue-players').innerHTML = '';

    // Update the court-list UI for this court
    courtList.innerHTML = '';
    var idx = 0;
    courtPlayers[courtNum].forEach((player, idx) => {
      const li = document.createElement('li');
      li.textContent = `${player.name}`;
      li.setAttribute('data-name', player.name);
      li.setAttribute('data-matches', player.matches);
      courtList.appendChild(li);

      if (idx === 1) {
        const vsDiv = document.createElement('div');
        vsDiv.textContent = 'vs.';
        //vsDiv.style.textAlign = 'center';
        vsDiv.style.fontWeight = 'bold';
        vsDiv.style.margin = '4px 0';
        li.appendChild(vsDiv);
      }
    });

    updatePlayerCount();
  });
});

// document.querySelector('.play-btn').addEventListener('click', function () {
//   //moves the queuePlayers to the courtPlayers array

//   const courtList = document.getElementById('court-list');

//   // Move all players from queuePlayers to courtPlayers
//   while (queuePlayers.length > 0) {
//     const playersToMove = queuePlayers.shift(); // Remove the first group (array of up to 4 players)
//     if (Array.isArray(playersToMove)) {
//       courtPlayers.push(...playersToMove); // Add all players in the group to courtPlayers
//     }
//   }

//   console.log('Court Players:', courtPlayers);

//   // Optionally, clear the queue display in the UI
//   document.getElementById('queue-players').innerHTML = '';

//   // Update the court-list UI
//   courtList.innerHTML = '';
//   courtPlayers.forEach(player => {
//     const li = document.createElement('li');
//     li.textContent = `${player.name}`;
//     li.setAttribute('data-name', player.name);
//     li.setAttribute('data-matches', player.matches);
//     courtList.appendChild(li);
//   });

//   updatePlayerCount();
// });

// document.querySelector('.done-btn').addEventListener('click', function () {
//   //once players are done, add them back to the standby list and add 1 to their matches.

//   // Move all players from courtPlayers back to players, incrementing matches
//   while (courtPlayers.length > 0) {
//     const player = courtPlayers.shift();
//     player.matches += 1;
//     players.push(player);
//   }

//   // Update the standby-list UI
//   const standbyList = document.getElementById('standby-list');
//   standbyList.innerHTML = '';
//   players.forEach(player => {
//     const li = document.createElement('li');
//     li.textContent = `${player.name} (Matches: ${player.matches})`;
//     li.setAttribute('data-name', player.name);
//     li.setAttribute('data-matches', player.matches);
//     standbyList.appendChild(li);
//   });

//   // Clear the court-list UI
//   document.getElementById('court-list').innerHTML = '';

//   updatePlayerCount();
// });

// DONE button handler for all courts
document.querySelectorAll('.done-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const courtNum = this.getAttribute('data-court');
    const courtList = document.getElementById(`court-list-${courtNum}`);

    //Add Pairing to History for next Queuing purposes.
    addNameToHistory(
      courtPlayers[courtNum][0].name,
      courtPlayers[courtNum][1].name
    );

    addNameToHistory(
      courtPlayers[courtNum][2].name,
      courtPlayers[courtNum][3].name
    );

    // Move all players from this court back to standby, incrementing matches
    while (courtPlayers[courtNum].length > 0) {
      const player = courtPlayers[courtNum].shift();
      player.matches += 1;
      players.push(player);
      saveData(); // Save the updated players array to localStorage
    }

    // Update the standby-list UI
    const standbyList = document.getElementById('standby-list');
    standbyList.innerHTML = '';
    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = `${player.name} (Matches: ${player.matches})`;
      li.setAttribute('data-name', player.name);
      li.setAttribute('data-matches', player.matches);
      standbyList.appendChild(li);
    });

    // Clear the court-list UI for this court
    courtList.innerHTML = '';

    updatePlayerCount();
  });
});
function showModal(courtNum, courtPlayerIdx) {
  const modal = document.getElementById('customModal');
  modal.style.display = 'flex';

  // Get the container where you want to display the player names
  const modalContent = document.getElementById('modalPlayerList');
  modalContent.innerHTML = ''; // Clear previous content

  // Create a list of player names as radio buttons
  const ul = document.createElement('ul');
  players.forEach((player, idx) => {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'choice';
    radio.value = idx; // Use index for easy lookup
    if (idx === 0) radio.checked = true;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(' ' + player.name));
    li.appendChild(label);
    ul.appendChild(li);
  });
  modalContent.appendChild(ul);

  // Add Cancel button
  let cancelBtn = document.getElementById('cancelChoice');
  if (!cancelBtn) {
    cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelChoice';
    cancelBtn.textContent = 'Cancel';
    modalContent.appendChild(cancelBtn);
  }
  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  document.getElementById('submitChoice').onclick = () => {
    const selected = document.querySelector('input[name="choice"]:checked');
    if (selected) {
      const standbyIdx = parseInt(selected.value, 10);
      // Swap the players
      const standbyPlayer = players[standbyIdx];
      const courtPlayer = courtPlayers[courtNum][courtPlayerIdx];

      // Swap in arrays
      courtPlayers[courtNum][courtPlayerIdx] = standbyPlayer;
      players[standbyIdx] = courtPlayer;

      saveData();
      loadAllContents();
      modal.style.display = 'none';
    } else {
      alert('Please select an option.');
    }
  };
}
