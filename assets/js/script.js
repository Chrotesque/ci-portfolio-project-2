// Global variables
let settings = {
    "locked": false,
    "easy": {
        "buttons": "2",
        "speed": "slow",
        "strict": "off",
        "markingsc": "on"
    },
    "normal": {
        "buttons": "4",
        "speed": "normal",
        "strict": "on",
        "markingsc": "on"
    },
    "sound": "off",
    "markings": "num",
    "order": "cw",
    "difficulty": "normal",
    "buttons": "4",
    "speed": "normal",
    "strict": "off",
    "markingsc": "off"
}

let gameButtons = [];
let playerInput = [];

document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.getElementsByTagName("button");
    setSettings(buttons);
    setButtons(buttons);

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-cat") === "menu") {
                toggleMenu(this);
            } else if (this.getAttribute("data-cat") === "setting") {
                changeSetting(buttons, this);
            } else if (this.getAttribute("data-cat") === "game-control") {
                controlGame(buttons, this);
            }
        })
    }

})

/**
 * Returns a random number between 1 and (max)
 */
function getRandom(max) {
    return Math.floor(Math.random() * max) + 1;
}

/**
 * Showing | Hiding menus through adding &| removing css class 
 */
function toggleMenu(clicked) {

    let selection = clicked.getAttribute("data-value");
    let div = document.getElementById("menu-" + selection);
    if (div.className === "hide-element") {
        clicked.className = "active";
        div.className = "show-element";
    } else {
        div.className = "hide-element";
        clicked.removeAttribute("class");
    }

}

/**
 * Populates html with class based on global settings variable
 */
function setSettings(buttons) {

    let keys = Object.keys(settings);
    let values = Object.values(settings);
    for (let button of buttons) {
        if (button.getAttribute("data-cat") === "setting") {
            for (let i = 3; i < keys.length; i++) {
                if (button.getAttribute("data-type") === keys[i]) {
                    if (button.getAttribute("data-value") === values[i]) {
                        button.classList.add("active");
                    }
                }
            }
        }
    }

}

/**
 * Saves all available game buttons in global array 
 */
function setButtons(buttons) {

    let i = 1;
    for (let button of buttons) {
        if (button.getAttribute("data-cat") === "game-control" && button.getAttribute("data-value") !== "status") {
            gameButtons[i] = button;
            i++;
        }
    }

}

/**
 * Change game setting for next game through adding &| removing css class as well as changing global settings variable
 */
function changeSetting(buttons, clicked) {

    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value")

    for (let button of buttons) {
        if (button.getAttribute("data-type") === type) {
            if (button.getAttribute("data-value") === value) {
                button.classList.add("active");
                settings[button.getAttribute("data-type")] = button.getAttribute("data-value");
            } else {
                button.classList.remove("active");
            }
        }
    }

}


function controlGame(buttons, button) {

    let curButton = button.innerHTML; // start, pause, etc.

    switch (curButton) {
        case "Start":
            runGame();
            break;
        case "Pause":
            pauseGame();
            break;
        case "Stop":
            stopGame();
            break;
    }

    if (curButton === "1" || curButton === "2" || curButton === "3" || curButton === "4") { // find a more elegant solution
        playerInput.push(curButton);
        playButton(curButton);
    }

}

async function playButton(button) {
    gameButtons[button].classList.add("active");
    await sleep(200);
    gameButtons[button].classList.remove("active");
}

// https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function runGame(round) {
    let roundLimit = 4; // to avoid an endless loop during testing
    let sequence = [];
    round = (typeof round === 'undefined') ? 0 : ++round;
    for (i = 0; i < 3; i++) {
        sequence[i] = getRandom(4);
        console.log(sequence[i]); // remove me
    }
    if (round < roundLimit) { // to avoid an endless loop during testing
        console.log(`round ${round+1}`); // remove me
        computerTurn(sequence, round, true);
    } else {
        console.log("end of game"); // remove me
    }
}

function failHandler() {
    console.log("game lost");
}

function winRound() {
    console.log("round won");
}

/**
 * Processes the computer turn and calls to playerTurn as well as winRound
 */
async function computerTurn(sequence, reset) {
    // reset happens at the start of each round, as per initiation through runGame()
    turn = (reset === true) ? 1 : ++turn;

    // if the previous turn was the last, this round is won
    if (turn > sequence.length) {
        winRound();
        // otherwise proceed to next turn
    } else {
        for (let i = 0; i < turn; i++) {
            gameButtons[sequence[i]].classList.add("active");
            await sleep(1250);
            gameButtons[sequence[i]].classList.remove("active");
            await sleep(500);
        }

        playerTurn(sequence, turn);

    }

}

/**
 * Processes the players turn and calls to validatePlayerInput as well as failHandler
 */
async function playerTurn(sequence, turn) {

    playerInput = [];
    valid = true; // to check if the player input was valid
    waiting = true; // to check when the last input was given, to stop the while loop
    validation = []; // results from the validatePlayerInput fn

    while (valid === true && waiting === true) {
        let currentSequence = sequence.slice(0, turn);
        validation = validatePlayerInput(currentSequence, turn);
        if (validation[0] === false) {
            valid = false;
        }
        if (validation[1] === false) {
            waiting = false;
        }
        await sleep(100);
    }

    if (valid === true && waiting === false) {
        computerTurn(sequence, turn);
    } else if (valid === false) {
        failHandler();
    }

}

/**
 * Validates player input compared to the sequence and returns input validity as well as
 * whether or not the input was the last in this turn 
 */
function validatePlayerInput(sequence, turn) {

    let length = playerInput.length;
    let result = [];

    // additional player input is still required
    if (length !== turn) {
        for (let i = 0; i < length; i++) {
            if (parseInt(sequence[i]) !== parseInt(playerInput[i])) {
                result = [false, false];
            } else {
                result = [true, true];
            }
        }
        // last player input
    } else {
        if (sequence[turn] !== playerInput[turn]) {
            result = [false, false];
        } else {
            result = [true, false];
        }
    }

    return result;

}