const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2308-acc-pt-web-a';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(APIURL);
        if(!response.ok) {
            throw new Error('Failed to fetch players');
        }
        const players = await response.json();
        console.log(players);
        return players;
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const reponse = await fetch(`${APIURL}/${playerId}`);
        if(!reponse.ok) {
            throw new Error('Failed to fetch player');
        }
        const player = await response.json();
        return player;
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async(playerObj) => {
    console.log('Sending data: ', playerObj);
    try {
        const response = await fetch(APIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerObj),
        });
        if (!response.ok) {
            throw new Error('Failed to add new player');
        }
        const newPlayer = await response.json();
        console.log(newPlayer);
        return newPlayer;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/${playerId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete player');
        }
        const removedPlayer = await response.json();
        // Refresh the page after adding a new player
        location.reload();
        return removedPlayer;
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (response) => {
    try {
        let playerContainerHTML = '';
        // Check if response has a 'data' property with a 'players' array
        if (response && response.success && response.data && Array.isArray(response.data.players)) {
            const playerList = response.data.players;
            
            playerList.forEach((player) => {
                const playerEl = `
                    <div class="player-card">
                        <h2>${player.name}</h2>
                        <p>Status: ${player.status}</p>
                        <p>Breed: ${player.breed}</p>
                        <p>Player ID: ${player.id}</p>
                        <p>Team ID: ${player.teamId}</p>
                        <p>Cohort ID: ${player.cohortId}</p>
                        <p>Updated at: ${player.updatedAt}</p>
                        <img src="${player.imageUrl}"></img>
                        <button class="delete-btn" onclick="removePlayer(${player.id})">Delete</button>
                    </div>
                `;
                playerContainerHTML += playerEl;
            });
        } else {
            console.error('Invalid response format:', response);

            // Optionally, handle the case where the response format is not as expected
            // You can provide a fallback or display an error message, depending on your requirements
            playerContainerHTML = '<p>Oops, something went wrong. Unable to fetch player data.</p>';
        }
        playerContainer.innerHTML = playerContainerHTML;
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};


/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        // Create HTML for the new player form
        const formHTML = `
            <form id="add-player-form">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>

                <label for="status">Status:</label>
                <input type="text" id="status" name="status" required>

                <label for="breed">Breed:</label>
                <input type="text" id="breed" name="breed" required>

                <button type="submit">Add Player</button>
            </form>
        `;

        // Add HTML to the form container in the DOM
        newPlayerFormContainer.innerHTML = formHTML;

        // Add event listener for form submission
        const addPlayerForm = document.getElementById('add-player-form');
        addPlayerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const playerName = document.getElementById('name').value;
            const playerStatus = document.getElementById('status').value;
            const playerBreed = document.getElementById('breed').value;
            
            // Call the addNewPlayer function to add the new player
            const newPlayer = await addNewPlayer({ name: playerName, position: playerStatus, breed: playerBreed });
            
            // Refresh the page after adding a new player
            location.reload();

            // Fetch all players and render them after adding a new player
            const updatedPlayers = await fetchAllPlayers();
            renderAllPlayers(updatedPlayers);
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();