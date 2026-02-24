'use strict';
const players = []; // Array to store all player objects
const queuePlayers = [];
const PairHistory = [];
const courtPlayers = {
  1: [],
  2: [],
  3: [],
}; // Array to store players currently on the court

const COURT_FEE_PER_HOUR = 400;
const SHUTTLE_FEE = 90;

// Load from localStorage if available
const storedPlayers = localStorage.getItem('players');
const storedQueuePlayers = localStorage.getItem('queuePlayers');
const storedCourtPlayers = localStorage.getItem('courtPlayers');
const standbyList = document.getElementById('standby-list');

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
  console.log('Function: saveData()');
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('queuePlayers', JSON.stringify(queuePlayers));
  localStorage.setItem('courtPlayers', JSON.stringify(courtPlayers));
  localStorage.setItem('PairHistory', JSON.stringify(PairHistory));
}

function clearData() {
  console.log('Function: clearData()');
  localStorage.removeItem('players');
  localStorage.removeItem('queuePlayers');
  localStorage.removeItem('courtPlayers');
  localStorage.removeItem('PairHistory');
}

function updatePlayerCount() {
  console.log('Function: updatePlayerCount()');
  document.getElementById(
    'player-count'
  ).textContent = `${players.length} on standby`;
}

function addNameToHistory(name1, name2) {
  console.log(`Function: addNameToHistory(${name1}, ${name2})`);
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
  console.log(`Function: getPairHistory()`);
  return PairHistory;
}

function hasPairPlayedBefore(playerA, playerB, pairHistory) {
  console.log(`Function: hasPairPlayedBefore()`);
  return pairHistory.some(
    pair =>
      (pair[0] === playerA.name && pair[1] === playerB.name) ||
      (pair[0] === playerB.name && pair[1] === playerA.name)
  );
}

function isValidGroup(players, pairHistory) {
  console.log(`Function: isValidGroup()`);
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
  console.log(`Function: loadAllContents()`);
  // Standby List
  const standbyList = document.getElementById('standby-list');
  standbyList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-matches', player.matches);

    // Create a container for the right-side buttons
    const btnContainer = document.createElement('span');
    btnContainer.style.float = 'right';
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '8px';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit player';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.style.fontSize = '1.1em';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete player';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '1.1em';

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    li.appendChild(btnContainer);

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

      // if (idx === 1) {
      //   const vsDiv = document.createElement('div');
      //   vsDiv.textContent = 'vs.';
      //   //vsDiv.style.textAlign = 'center';
      //   vsDiv.style.fontWeight = 'bold';
      //   vsDiv.style.margin = '4px 0';
      //   ul.appendChild(vsDiv);
      // }
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

        // if (idx === 1) {
        //   const vsDiv = document.createElement('div');
        //   vsDiv.textContent = 'vs.';
        //   //vsDiv.style.textAlign = 'center';
        //   vsDiv.style.fontWeight = 'bold';
        //   vsDiv.style.margin = '4px 0';
        //   li.appendChild(vsDiv);
        // }
      });
    }
  });

  // Update player count
  updatePlayerCount();
}

//load all contents into new open/refresh browser window
window.addEventListener('DOMContentLoaded', function () {
  console.log(`Function: DOMContentLoaded`);
  loadAllContents();
});

document.getElementById('clear-btn').addEventListener('click', function () {
  console.log(`Function: clear-btn click event`);
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
    console.log(`Function: standby-list click event`);
    if (event.target && event.target.nodeName === 'LI') {
      const cleanText = getCleanPlayerText(event.target);
      if (!confirm(`Add ${cleanText} to Queue ?`)) return;

      const clickedText = cleanText;
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
          // const standbyList = document.getElementById('standby-list');
          // standbyList.innerHTML = '';
          // players.forEach(p => {
          //   const li = document.createElement('li');
          //   li.textContent = `${p.name} (Matches: ${p.matches})`;
          //   li.setAttribute('data-name', p.name);
          //   li.setAttribute('data-matches', p.matches);
          //   standbyList.appendChild(li);
          // });

          const standbyList = document.getElementById('standby-list');
          standbyList.innerHTML = '';
          players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name} (Matches: ${player.matches})`;
            li.setAttribute('data-name', player.name);
            li.setAttribute('data-matches', player.matches);

            // Create a container for the right-side buttons
            const btnContainer = document.createElement('span');
            btnContainer.style.float = 'right';
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '8px';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️';
            editBtn.title = 'Edit player';
            editBtn.style.background = 'none';
            editBtn.style.border = 'none';
            editBtn.style.cursor = 'pointer';
            editBtn.style.fontSize = '1.1em';

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete player';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '1.1em';

            btnContainer.appendChild(editBtn);
            btnContainer.appendChild(deleteBtn);

            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            li.appendChild(btnContainer);
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

              // if (idx === 1) {
              //   const vsDiv = document.createElement('div');
              //   vsDiv.textContent = 'vs.';
              //   //vsDiv.style.textAlign = 'center';
              //   vsDiv.style.fontWeight = 'bold';
              //   vsDiv.style.margin = '4px 0';
              //   ul.appendChild(vsDiv);
              // }
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

// Delegate edit-button clicks in standby-list (works for all places that create the ✏️ button)
document
  .getElementById('standby-list')
  .addEventListener('click', function (event) {
    const target = event.target;
    if (!target) return;

    // Match the edit button by title or by emoji text
    if (
      target.nodeName === 'BUTTON' &&
      (target.title === 'Edit player' ||
        (typeof target.textContent === 'string' &&
          target.textContent.includes('✏')))
    ) {
      event.stopPropagation();
      const li = target.closest('li');
      const name = li ? li.getAttribute('data-name') || li.textContent : '';
      console.log('Edit button clicked for', name);

      // If you already have the openEditModal(player) helper, optionally call it:
      if (typeof window.openEditModal === 'function' && name) {
        const playerObj = players.find(p => p.name === name);
        if (playerObj) {
          window.openEditModal(playerObj);
          // initial render after adding
          renderStandbyList();

          // Clear the input field
          //playerNameInput.value = '';

          updatePlayerCount();
          // ...existing code...
        }
      }
    }
  });

// Add event listener to queue-players for clicks on any <li> (using event delegation)
document
  .getElementById('queue-players')
  .addEventListener('click', function (event) {
    if (event.target.textContent === 'No Player') {
    }

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

            // if (idx === 1) {
            //   const vsLi = document.createElement('li');
            //   vsLi.textContent = 'vs.';
            //   vsLi.className = 'vs-item'; // Give it a class for styling
            //   ul.appendChild(vsLi);
            // }
          });
          queuePlayersDiv.appendChild(ul);
        } else {
          // Remove the empty group if no players left
          queuePlayers.shift();
        }

        // Update the standby-list UI
        // const standbyList = document.getElementById('standby-list');
        // standbyList.innerHTML = '';
        // players.forEach(p => {
        //   const li = document.createElement('li');
        //   li.textContent = `${p.name} (Matches: ${p.matches})`;
        //   li.setAttribute('data-name', p.name);
        //   li.setAttribute('data-matches', p.matches);
        //   standbyList.appendChild(li);
        // });

        const standbyList = document.getElementById('standby-list');
        standbyList.innerHTML = '';
        players.forEach(player => {
          const li = document.createElement('li');
          li.textContent = `${player.name} (Matches: ${player.matches})`;
          li.setAttribute('data-name', player.name);
          li.setAttribute('data-matches', player.matches);

          // Create a container for the right-side buttons
          const btnContainer = document.createElement('span');
          btnContainer.style.float = 'right';
          btnContainer.style.display = 'flex';
          btnContainer.style.gap = '8px';

          // Edit button
          const editBtn = document.createElement('button');
          editBtn.textContent = '✏️';
          editBtn.title = 'Edit player';
          editBtn.style.background = 'none';
          editBtn.style.border = 'none';
          editBtn.style.cursor = 'pointer';
          editBtn.style.fontSize = '1.1em';

          // Delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = '🗑️';
          deleteBtn.title = 'Delete player';
          deleteBtn.style.background = 'none';
          deleteBtn.style.border = 'none';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.fontSize = '1.1em';

          btnContainer.appendChild(editBtn);
          btnContainer.appendChild(deleteBtn);

          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';

          li.appendChild(btnContainer);
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

  // // Create new list item for the player
  // const li = document.createElement('li');
  // li.textContent = `${playerName} (Matches: ${player.matches})`;

  // // Optionally, store data attributes for future use
  // li.setAttribute('data-name', playerName);
  // li.setAttribute('data-matches', 0);

  // // Append to the standby list
  // document.getElementById('standby-list').appendChild(li);

  // Update the standby list with edit and delete buttons
  const standbyList = document.getElementById('standby-list');
  standbyList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-matches', player.matches);

    // Create a container for the right-side buttons
    const btnContainer = document.createElement('span');
    btnContainer.style.float = 'right';
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '8px';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit player';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.style.fontSize = '1.1em';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete player';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '1.1em';

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    li.appendChild(btnContainer);
    standbyList.appendChild(li);
  });
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
    if (pairHistory.length > 0) {
      // Try once after clearing history
      PairHistory.length = 0;
      saveData();
      // Try again, but do NOT recurse infinitely
      // Try to find a group again
      let found = false;
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
              if (isValidGroup(group, PairHistory)) {
                nextFour = group;
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (found) break;
        }
        if (found) break;
      }
      if (!found) {
        alert('Not enough players or unique pairs to form a new group.');
        return;
      }
    } else {
      alert('Not enough players or unique pairs to form a new group.');
      return;
    }
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

    // if (idx === 1) {
    //   const vsDiv = document.createElement('div');
    //   vsDiv.textContent = 'vs.';
    //   //vsDiv.style.textAlign = 'center';
    //   vsDiv.style.fontWeight = 'bold';
    //   vsDiv.style.margin = '4px 0';
    //   ul.appendChild(vsDiv);
    // }
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

  // standbyList.innerHTML = '';
  // players.forEach(player => {
  //   const li = document.createElement('li');
  //   li.textContent = `${player.name} (Matches: ${player.matches})`;
  //   li.setAttribute('data-name', player.name);
  //   li.setAttribute('data-matches', player.matches);
  //   standbyList.appendChild(li);
  // });

  standbyList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name} (Matches: ${player.matches})`;
    li.setAttribute('data-name', player.name);
    li.setAttribute('data-matches', player.matches);

    // Create a container for the right-side buttons
    const btnContainer = document.createElement('span');
    btnContainer.style.float = 'right';
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '8px';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit player';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.style.fontSize = '1.1em';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete player';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '1.1em';

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    li.appendChild(btnContainer);
    standbyList.appendChild(li);
  });

  updatePlayerCount();
});

// PLAY button handler for all courts
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    console.log('PLAY button clicked');
    const courtNum = this.getAttribute('data-court');
    const courtList = document.getElementById(`court-list-${courtNum}`);
    //console.log('Jords was here!', courtNum);
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

      // if (idx === 1) {
      //   const vsDiv = document.createElement('div');
      //   vsDiv.textContent = 'vs.';
      //   //vsDiv.style.textAlign = 'center';
      //   vsDiv.style.fontWeight = 'bold';
      //   vsDiv.style.margin = '4px 0';
      //   li.appendChild(vsDiv);
      // }
    });

    updatePlayerCount();
  });
});

// DONE button handler for all courts
document.querySelectorAll('.done-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    console.log('DONE button clicked');
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
    // const standbyList = document.getElementById('standby-list');
    // standbyList.innerHTML = '';
    // players.forEach(player => {
    //   const li = document.createElement('li');
    //   li.textContent = `${player.name} (Matches: ${player.matches})`;
    //   li.setAttribute('data-name', player.name);
    //   li.setAttribute('data-matches', player.matches);
    //   standbyList.appendChild(li);
    // });

    const standbyList = document.getElementById('standby-list');
    standbyList.innerHTML = '';
    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = `${player.name} (Matches: ${player.matches})`;
      li.setAttribute('data-name', player.name);
      li.setAttribute('data-matches', player.matches);

      // Create a container for the right-side buttons
      const btnContainer = document.createElement('span');
      btnContainer.style.float = 'right';
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '8px';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.title = 'Edit player';
      editBtn.style.background = 'none';
      editBtn.style.border = 'none';
      editBtn.style.cursor = 'pointer';
      editBtn.style.fontSize = '1.1em';

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Delete player';
      deleteBtn.style.background = 'none';
      deleteBtn.style.border = 'none';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = '1.1em';

      btnContainer.appendChild(editBtn);
      btnContainer.appendChild(deleteBtn);

      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';

      li.appendChild(btnContainer);
      standbyList.appendChild(li);
    });

    // Clear the court-list UI for this court
    courtList.innerHTML = '';

    updatePlayerCount();
  });
});
function showModal(courtNum, courtPlayerIdx) {
  console.log(`Function: showModal(${courtNum}, ${courtPlayerIdx})`);
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
    console.log(`Function: submitChoice click event`);
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

document
  .getElementById('standby-list')
  .addEventListener('click', function (event) {
    const target = event.target;
    if (!target) return;

    // Match the delete button by title or by emoji text
    if (
      target.nodeName === 'BUTTON' &&
      (target.title === 'Delete player' ||
        (typeof target.textContent === 'string' &&
          target.textContent.includes('🗑️')))
    ) {
      event.stopPropagation();
      const li = target.closest('li');
      const name = li ? li.getAttribute('data-name') || li.textContent : '';

      if (confirm(`Are you sure you want to delete ${name}?`)) {
        // Find and remove player from players array
        const playerIndex = players.findIndex(p => p.name === name);
        if (playerIndex !== -1) {
          players.splice(playerIndex, 1);
          saveData(); // Save the updated players array

          // Update the UI
          li.remove(); // Remove the li element
          updatePlayerCount(); // Update the player count display
        }
      }
    }
  });

// Create (or reuse) a simple modal for editing player name
function openEditModal(player) {
  console.log(`Function: openEditModal(${player.name})`);
  let overlay = document.getElementById('edit-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'edit-modal-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
    });

    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    Object.assign(modal.style, {
      background: '#fff',
      padding: '18px',
      borderRadius: '8px',
      minWidth: '320px',
      boxSizing: 'border-box',
    });

    const title = document.createElement('h3');
    title.textContent = 'Edit player';
    title.style.margin = '0 0 10px 0';
    modal.appendChild(title);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'edit-player-input';
    Object.assign(input.style, {
      width: '100%',
      padding: '8px 10px',
      fontSize: '1rem',
      boxSizing: 'border-box',
    });
    modal.appendChild(input);

    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '12px',
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => (overlay.style.display = 'none'));

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.fontWeight = '700';
    saveBtn.addEventListener('click', () => {
      const newName = input.value.trim();
      if (newName === '') {
        alert('Please enter a player name.');
        return;
      }

      // prevent duplicate across players, queuePlayers, courtPlayers
      const existsInPlayers = players.some(
        pl => pl.name === newName && pl !== player
      );
      const existsInQueue = queuePlayers.some(
        group => Array.isArray(group) && group.some(pl => pl.name === newName)
      );
      const existsInCourt = Object.values(courtPlayers).some(arr =>
        arr.some(pl => pl.name === newName)
      );

      if (existsInPlayers || existsInQueue || existsInCourt) {
        alert('Player already exists!');
        return;
      }

      // Update the name
      player.name = newName;
      saveData();
      renderStandbyList();
      overlay.style.display = 'none';
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);

    // close if clicking the overlay background
    overlay.addEventListener('click', ev => {
      if (ev.target === overlay) overlay.style.display = 'none';
    });

    document.body.appendChild(overlay);
  }

  // populate and show
  const inputEl = document.getElementById('edit-player-input');
  inputEl.value = player.name;
  overlay.style.display = 'flex';
  inputEl.focus();
  inputEl.select();
}

function renderStandbyList() {
  console.log(`Function: renderStandbyList()`);
  standbyList.innerHTML = '';
  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} (Matches: ${p.matches})`;
    li.setAttribute('data-name', p.name);
    li.setAttribute('data-matches', p.matches);

    const btnContainer = document.createElement('span');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '8px';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit player';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.cursor = 'pointer';
    editBtn.style.fontSize = '1.1em';

    // Delete button (placeholder for future)
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete player';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '1.1em';

    // Edit button opens modal to rename selected player
    editBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      openEditModal(p);
    });

    // (Optional) deleteBtn listener can be added later
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';

    li.appendChild(btnContainer);
    standbyList.appendChild(li);
  });
}

// Add this helper function at the top level
function getCleanPlayerText(element) {
  console.log(`Function: getCleanPlayerText()`);
  // Get the first text node's content (player name and matches)
  const textContent =
    Array.from(element.childNodes).find(
      node => node.nodeType === Node.TEXT_NODE
    )?.textContent || '';
  return textContent.trim();
}

// Add these constants at the top with your other constants

// Add the END GAME handler
document.querySelector('.end-game-btn').addEventListener('click', function () {
  showCostModal();
});

function showCostModal() {
  // Calculate total players
  const totalPlayers = [...players];
  queuePlayers.forEach(group => totalPlayers.push(...group));
  Object.values(courtPlayers).forEach(court => totalPlayers.push(...court));

  const uniquePlayers = new Set(totalPlayers.map(p => p.name)).size;

  if (uniquePlayers === 0) {
    alert('No players to calculate costs for!');
    return;
  }

  let overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '9999';

  let modal = document.createElement('div');
  modal.className = 'cost-modal';
  modal.style.width = '230px'; // Set modal width
  modal.style.minWidth = '230px'; // Set minimum width
  modal.style.maxWidth = '90%'; // Responsive max width
  modal.style.margin = '0 20px'; // Add some margin
  modal.style.background = '#fff';
  modal.style.padding = '24px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
  modal.innerHTML = `
    <h2>Game Summary</h2>
    <div class="input-group">
      <label>Price per Shuttlecock:</label>
      <input type="number" id="priceShuttle" min="1" step="5" value="${SHUTTLE_FEE}" style="
      width: 100%;
        padding: 8px 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;">
    </div>
    <div class="input-group">
      <label>Price per Hour (Court):</label>
      <input type="number" id="priceHour" min="1" step="10" value="${COURT_FEE_PER_HOUR}" style="
      width: 100%;
        padding: 8px 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;">
    </div>
    <div class="input-group">
      <label>Number of Shuttlecocks Used:</label>
      <input type="number" id="shuttleCount" min="1" step="1" value="1" style="
      width: 100%;
        padding: 8px 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;">
    </div>
    <div class="input-group">
      <label>Hours Played:</label>
      <input type="number" id="hoursPlayed" min="1" step="0.5" value="1" style="
        width: 100%;
        padding: 8px 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;">
    </div>
    <div id="costSummary" style="display:none">
      <h3>Cost Summary</h3>
      <p id="costDetails"></p>
    </div>
    <div class="buttons">
      <button id="cancelCost">Cancel</button>
      <button id="calculateCost">Calculate</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Handle clicks
  document.getElementById('cancelCost').onclick = () => {
    document.body.removeChild(overlay);
  };

  document.getElementById('calculateCost').onclick = () => {
    const priceShuttle = parseFloat(document.getElementById('priceShuttle').value) || 0;
    const priceHour = parseFloat(document.getElementById('priceHour').value) || 0;
    const shuttles =
      parseInt(document.getElementById('shuttleCount').value) || 0;
    const hours = parseFloat(document.getElementById('hoursPlayed').value) || 0;

    if (shuttles < 0 || hours <= 0 || priceShuttle < 0 || priceHour < 0) {
      alert('Please enter valid numbers.');
      return;
    }

    const courtCost = priceHour * hours;
    const shuttleCost = priceShuttle * shuttles;
    const totalCost = courtCost + shuttleCost;
    const costPerPerson = Math.ceil(totalCost / uniquePlayers);

    const costSummary = document.getElementById('costSummary');
    const costDetails = document.getElementById('costDetails');
    costDetails.innerHTML = `
      Court Fee (${hours}h × ₱${priceHour}): ₱${courtCost}<br>
      Shuttlecocks (${shuttles} × ₱${priceShuttle}): ₱${shuttleCost}<br>
      Total Cost: ₱${totalCost}<br>
      <strong>Cost per Person: ₱${costPerPerson}</strong> (${uniquePlayers} players)
    `;
    costSummary.style.display = 'block';

    // Change button to "End Game"
    const calcButton = document.getElementById('calculateCost');
    calcButton.textContent = 'End Game';
    calcButton.onclick = () => {
      if (confirm('This will end the game and clear all players. Continue?')) {
        clearData();
        location.reload();
      }
    };
  };

  // Only allow numbers in inputs
  const inputs = modal.querySelectorAll('input');
  inputs.forEach(input => {
    input.onkeypress = e => {
      if (e.key === '.' && input.value.includes('.')) return false;
      return e.key === '.' || !isNaN(Number(e.key));
    };
  });
}
