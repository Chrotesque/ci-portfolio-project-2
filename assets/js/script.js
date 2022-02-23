// scope function start
(function() {

// Global variables
let settings = {
    "control": {
        "stopRequest": false,
        "locked": true
    },
    "setting": {
        "difficulty": "normal",
        "sound": "off",
        "markings": "num",
        "order": "cw",
    },
    "normal": {
        "buttons": "4",
        "speed": "normal",
        "strict": "off",
        "markingsc": "on"
    },
    "hard": {
        "buttons": "6",
        "speed": "fast",
        "strict": "on",
        "markingsc": "on"
    },
    "custom":{
        "buttons": "4",
        "speed": "normal",
        "strict": "off",
        "markingsc": "off"
    }
}

let gameButtons = [];
let playerInput = [];

document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.getElementsByTagName("button");
    setSettings(buttons);
    collectGameButtons(buttons);

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-cat") === "menu") {
                toggleMenu(this);
            } else if (this.getAttribute("data-cat") === "setting") {
                changeSetting(buttons, this);
            } else if (this.getAttribute("data-cat") === "game-control") {
                controlGame(this);
            }
        })
    }

})

// https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

    let newArray = Object.assign(settings.custom, settings.setting);

    let keys = Object.keys(newArray);
    let values = Object.values(newArray);
    for (let button of buttons) {
        if (button.getAttribute("data-cat") === "setting" || button.getAttribute("data-cat") === "custom") {
            for (let i = 0; i < keys.length; i++) {
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
function collectGameButtons(buttons) {

    let i = 1;
    for (let button of buttons) {
        if (button.getAttribute("data-cat") === "game-control" && button.getAttribute("data-value") !== "status") {
            gameButtons[i] = button;
            i++;
        }
    }

}

function resolveSpeed(request) {
    let speed = {
        "slow":{
            "press":1750,
            "release":400
        },
        "normal":{
            "press":1250,
            "release":250
        },
        "fast":{
            "press":800,
            "release":150
        }
    }

    return speed[request];
}

function setStatus(update) {
    let status = document.getElementById("status-display");
    status.textContent = update;
}

function setScoreStatus(update) {
    let score = document.getElementById("score-display");
    score.innerHTML = update;
}

function addScore(update) {
    let element = parseInt(document.getElementById("score-amount").innerHTML);
    element += update;
    document.getElementById("score-amount").innerHTML = element;
}

function resetScore() {
    document.getElementById("score-amount").innerHTML = 0;
}

/**
 * Change game setting for next game through adding &| removing css class as well as changing global settings variable
 */
function changeSetting(buttons, clicked) {

    let cat = clicked.getAttribute("data-cat");
    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value")

    for (let button of buttons) {
        if (button.getAttribute("data-type") === type) {
            if (button.getAttribute("data-value") === value) {
                button.classList.add("active");
                settings[cat][type] = value;
            } else {
                button.classList.remove("active");
            }
        }
    }

}


/**
 * Controls the game depending on what button has been pressed, start, stop, send 1, etc.
 */
function controlGame(button) {

    let curButton = button.innerHTML;
    switch (curButton) {
        case "Start":
            resetScore();
            setStatus("Game in Progress");
            setScoreStatus("Score");
            runGame();
            break;
        case "Stop":
            stopGame();
            break;
            default:
                playerInput.push(curButton);
                playButton(curButton);
    }

}

/**
 * Lights up the button the player is activating through adding/removing a class
 */
async function playButton(button) {
    button = parseInt(button);
    gameButtons[button].classList.add("active");
    await sleep(200);
    gameButtons[button].classList.remove("active");
}

function stopGame() {

}

/*
has to be adapted to take a snap shot of settings, then start the game 
to then also use them to increase difficulty incrementally
 */
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
        computerTurn(sequence, true);
    } else {
        console.log("end of game"); // remove me
    }
}

function failHandler() {
    setStatus("You lost!");
    setScoreStatus("Your Final Score");
    console.log("game lost");
}

function winRound() {
    addScore(500);
    setStatus("You won!");
    setScoreStatus("Your Final Score");
    console.log("round won");
}

/**
 * Processes the computer turn and calls to playerTurn as well as winRound
 */
async function computerTurn(sequence, reset) {
    let speed = resolveSpeed("fast");
    // reset happens at the start of each round, as per initiation through runGame()
    turn = (reset === true) ? 1 : ++turn;

    // if the previous turn was the last, this round is won
    if (turn > sequence.length) {
        winRound();
        // otherwise proceed to next turn
    } else {
        setStatus("Prepare for Computer Turn");
        await sleep(2000);
        for (let i = 0; i < turn; i++) {
            setStatus("Computer Turn in progress");
            gameButtons[sequence[i]].classList.add("active");
            await sleep(speed.press);
            gameButtons[sequence[i]].classList.remove("active");
            await sleep(speed.release);
        }

        playerTurn(sequence, turn);

    }

}

/**
 * Processes the players turn and validated playerInput through validatePlayerInput fn, also
 * calls failHandler in case of mistakes, otherwise hands over to computerTurn
 */
async function playerTurn(sequence, turn) {

    playerInput = [];
    let currentSequence = sequence.slice(0,turn);
    let validity = true;
    let counter = currentSequence.length;
    setStatus("Your Turn");

    while (validity === true && counter > 0) {
        if (playerInput.length > 0) {
            let playerInputToCheck = parseInt(playerInput.shift());
            let currentSequenceToCheck = parseInt(currentSequence.shift());
            if (validatePlayerInput(playerInputToCheck,currentSequenceToCheck)) {
                addScore(10);
                --counter;
            } else {
                validity = false;
            }
        }
        await sleep(100); // browser tab freezes without sleep
    }

    if (validity === true && counter <= 0) {
        computerTurn(sequence, turn);
        addScore(100);
    } else if (validity === false) {
        failHandler();
    } else {
        alert(`Unknown error! Please report this to the developer.`);
        throw `Unknown error! Please report this to the developer.`;
    }

}

/**
 * Validates player input compared to the computer sequence and returns bool
 */
function validatePlayerInput(num1, num2) {

    if (num1 === num2) {
        return true;
    } else {
        return false;
    }

}

// scope function end
})();