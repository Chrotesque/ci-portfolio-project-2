// scope function start
//(function () {

// Global variables
let settings = {
    "control": {
        "stopRequest": true,
        "locked": true
    },
    "setting": {
        "difficulty": "normal",
        "sound": "off",
        "markings": "num",
        "order": "cw",
    },
    "difficulty": {
        "easy": {
            "multiplier": 0,
            "buttons": "3",
            "speed": "slow",
            "strict": "off",
            "markingsc": "on"
        },
        "normal": {
            "multiplier": 0,
            "buttons": "4",
            "speed": "normal",
            "strict": "off",
            "markingsc": "on"
        },
        "hard": {
            "multiplier": 0,
            "buttons": "5",
            "speed": "fast",
            "strict": "on",
            "markingsc": "on"
        },
        "custom": {
            "multiplier": 0,
            "buttons": "4",
            "speed": "normal",
            "strict": "off",
            "markingsc": "on"
        }
    },
    "values": {
        "speed": {
            "slow": {
                "press": 1300,
                "delay": 350
            },
            "normal": {
                "press": 800,
                "delay": 250
            },
            "fast": {
                "press": 300,
                "delay": 150
            }
        },
        "score": {
            "step": 10,
            "turn": 100,
            "round": 500
        },
        "sleep": {
            "computerTurnDelay": 2000,
            "playerTurnLoop": 100,
            "playerButtonPress": 300
        },
        "multiplier": {
            "buttons": {
                3: -15,
                4: 0,
                5: 15,
                6: 40
            },
            "speed": {
                "slow": -15,
                "normal": 0,
                "fast": 25
            },
            "strict": {
                "off": 0,
                "on": 30
            },
            "markingsc": {
                "off": 15,
                "on": 0
            }
        }
    }
}

let allButtons = [];
let gameButtons = [];

let playerInput = [];
let highscore = [];
let currentGame = {};

document.addEventListener("DOMContentLoaded", function () {

    allButtons = document.getElementsByTagName("button");
    allPaths = document.getElementsByTagName("path");
    initiateSettings();
    updateScoreMultiplierInternal();
    updateScoreMultiplierExternal();

    for (let button of allButtons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-cat") === "menu") {
                toggleMenu(this);
            } else if (this.getAttribute("data-cat") === "setting" || this.getAttribute("data-cat") === "custom") {
                changeSetting(this);
            } else if (this.getAttribute("data-cat") === "game-control") {
                controlGame(this);
            }
        });
    }

    for (let path of allPaths) {
        path.addEventListener("click", function () {
            if (!path.classList.contains("game-circle-outer") && !path.classList.contains("game-circle-bg")) {
                controlGame(this);
            }
        });
    }

})

// https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    let promise = new Promise(resolve => setTimeout(resolve, ms));
    if (settings.control.stopRequest === false) {
        return promise;
    }
}



/**
 * Showing | Hiding menus through adding &| removing css class 
 */
function toggleMenu(clicked) {

    let selection = clicked.getAttribute("data-value");
    let div = document.getElementById("menu-" + selection);
    if (div.className === "hide-element") {
        div.className = "show-element";
    } else {
        div.className = "hide-element";
    }

}

/**
 * Populates html with class based on global settings variable
 */
function initiateSettings() {

    let newArray = Object.assign({}, settings.difficulty.custom, settings.setting);

    let keys = Object.keys(newArray);
    let values = Object.values(newArray);
    for (let button of allButtons) {
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

/*
function addGameButton() {
    let gameArea = document.getElementById("game-area");
    let newButton = document.createElement("button");
    let newIndex = gameButtons.length + 1;
    newButton.setAttribute("data-cat", "game-control");
    newButton.setAttribute("data-type", "input");
    newButton.setAttribute("data-value", newIndex);
    newButton.setAttribute("type", "button");
    newButton.innerHTML = newIndex;
    newButton.addEventListener("click", function () {
        controlGame(this);
    });
    gameArea.appendChild(newButton);
    gameButtons.push(newButton);
}

function removeGameButton() {
    let button = gameButtons.pop();
    button.remove();
}
*/

function numToString(input) {
    let result;
    input = parseInt(input);

    switch (input) {
        case 1:
            result = "one";
            break;
        case 2:
            result = "two";
            break;
        case 3:
            result = "three";
            break;
        case 4:
            result = "four";
            break;
        case 5:
            result = "five";
            break;
        case 6:
            result = "six";
            break;
    }

    return result;
}

function stringToNum(input) {
    let result;

    switch (input) {
        case "one":
            result = 1;
            break;
        case "two":
            result = 2;
            break;
        case "three":
            result = 3;
            break;
        case "four":
            result = 4;
            break;
        case "five":
            result = 5;
            break;
        case "six":
            result = 6;
            break;
    }

    return result;
}

/**
 * Updates the amount of game buttons being displayed through class add/rem
 */
function updateGameButtons() {

    let newButtonAmt = parseInt(settings.difficulty[settings.setting.difficulty].buttons);
    let identifier = numToString(newButtonAmt);
    let allButtonSets = document.getElementsByClassName("svg-btn");
    for (let button of allButtonSets) {
        // first: hide them all
        if (button.classList.contains("show-element")) {
            button.classList.add("hide-element");
            button.classList.remove("show-element");
        }
    }
    let newSetToShow = document.getElementById("btn-set-" + identifier);
    // second: show the correct one
    newSetToShow.classList.add("show-element");

}

/**
 * Saves all available game buttons in global array for convenient access
 */
function collectGameButtons2() {

    let i = 1;
    for (let button of allButtons) {
        if (button.getAttribute("data-cat") === "game-control" && button.getAttribute("data-type") === "input") {
            gameButtons[i] = button;
            i++;
        }
    }

}

function collectGameButtons() {

    gameButtons = [];
    let curBtnAmt = settings.difficulty[settings.setting.difficulty].buttons;
    let index = numToString(curBtnAmt);
    let parent = document.getElementById("btn-set-" + index);
    let paths = parent.getElementsByTagName("path");
    let i = 0;
    for (let child of paths) {
        gameButtons[i] = child;
        i++;
    }
    activateButtonSet();

}

function activateButtonSet() {
    for (let i = 0; i < gameButtons.length; i++) {
        gameButtons[i].classList.remove("inactive");
    }
}

function deactivateButtonSet() {
    for (let i = 0; i < gameButtons.length; i++) {
        gameButtons[i].classList.add("inactive");
    }
}

function setTurnStatus(update) {
    let status = document.getElementById("turn-status");
    status.textContent = update;
}

async function setGameStatus(update) {
    let status = document.getElementById("game-status");
    status.textContent = update;
}

function setScoreStatus(update) {
    let score = document.getElementById("score-status");
    score.innerHTML = update + " : ";
}

function addScore(update) {
    currentGame.score += update * currentGame.multiplier;
    document.getElementById("score-amount").innerHTML = currentGame.score;
}

function updateScoreMultiplierInternal() {
    let diff = Object.keys(settings.difficulty);
    let keys = Object.keys(settings.values.multiplier);
    for (let i = 0; i < diff.length; i++) {
        let multiplier = 0;
        for (let j = 0; j < keys.length; j++) {
            multiplier += settings.values.multiplier[keys[j]][settings.difficulty[diff[i]][keys[j]]];
            settings.difficulty[diff[i]].multiplier = 1 + (multiplier / 100);
        }
    }
}

function updateScoreMultiplierExternal() {
    let multiplier = Math.round(settings.difficulty.custom.multiplier * 100);
    document.getElementById("score-mp").innerHTML = multiplier + "%";
}

function handleHighscore() {
    highscore.push(currentGame.score);
    highscore.sort(function (a, b) {
        return b - a
    });
}


/**
 * Change game setting for next game through adding &| removing css class as well as changing global settings variable
 */
function changeSetting(clicked) {

    let cat = clicked.getAttribute("data-cat");
    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value");
    let customChanges = 0;
    for (let button of allButtons) {
        if (button.getAttribute("data-type") === type) {
            if (button.getAttribute("data-cat") === "custom") {
                ++customChanges;
            }
            button.classList.remove("active");
            if (cat === "setting") {
                settings[cat][type] = value;

            } else {
                settings.difficulty[cat][type] = value;

            }

        }
    }

    updateGameButtons();
    clicked.classList.add("active");

    // update the score multiplier only when changes were made to custom diff settings 
    if (customChanges > 0) {
        updateScoreMultiplierInternal();
        updateScoreMultiplierExternal();
        updateGameButtons();
    }

}

function toggleElement(element) {
    if (element.classList.contains("show-element")) {
        element.classList.remove("show-element");
        element.classList.add("hide-element");
    } else {
        element.classList.add("show-element");
        element.classList.remove("hide-element");
    }

}

function toggleMiddleDisplay() {
    let diffSelect = document.getElementById("difficulty-selection");
    let inGame = document.getElementById("in-game-info");
    toggleElement(diffSelect);
    toggleElement(inGame);
}

/**
 * Controls the game depending on what button has been pressed, start, stop, send 1, etc.

function controlGame2(button) {

    let curButton = button.innerHTML;
    switch (curButton) {
        case "Start":
            settings.control.stopRequest = false;
            setTurnStatus("Game in Progress");
            setScoreStatus("Score");
            updateGameButtons();
            runGame();
            break;
        case "Stop":
            settings.control.stopRequest = true;
            stopGame();
            break;
        default:
            --curButton;
            playerInput.push(curButton);
            playButton(curButton);
    }

} */

function controlGame(button) {

    let curButton = button.getAttribute("data-value");
    switch (curButton) {
        case "start":
            settings.control.stopRequest = false;
            runGame();
            break;
        case "stop":
            settings.control.stopRequest = true;
            stopGame();
            break;
        default:
            playerInput.push(stringToNum(curButton) - 1);
            playButton(curButton);
    }

}

/**
 * Lights up the button the player is activating through adding/removing a class
 */
async function playButton(input) {
    /*
    button = parseInt(button);
    gameButtons[button].classList.add("active");
    await sleep(settings.values.sleep.playerButtonPress);
    gameButtons[button].classList.remove("active");
    */
    let curButton;
    for (let button of gameButtons) {
        if (input === button.getAttribute("data-value")) {
            curButton = button;
        }
    }
    curButton.classList.add(input + "-pressed");
    await sleep(settings.values.sleep.playerButtonPress);
    curButton.classList.remove(input + "-pressed");
}

/**
 * Returns a random number between 1 and (max)
 */
function getRandom(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Creates the random sequence for the game using the getRandom fn
 */

function createSequence(length, buttonAmt) {
    let sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(getRandom(buttonAmt));
    }
    return sequence;
}

/**
 * Game initiation fn that takes snapshot of settings so that changes to settings
 * don't affect a running game through the use of the currentGame object, then
 * starts the game with the first computerTurn
 */
function runGame() {

    // for ease of use during creation of a snapshot of the settings
    let diffSettings = settings.difficulty[settings.setting.difficulty];
    let speedSettings = settings.values.speed;

    // snapshot of settings to the currentGame var
    currentGame.score = 0;
    currentGame.multiplier = diffSettings.multiplier;
    currentGame.round = 1;
    currentGame.turn = 1;
    currentGame.sequence = createSequence(10, diffSettings.buttons);
    currentGame.buttons = diffSettings.buttons;
    currentGame.speed = speedSettings[diffSettings.speed];
    currentGame.strict = diffSettings.strict;
    currentGame.markingsc = diffSettings.markingsc;

    // start of the game
    addScore(0);
    setScoreStatus("Score");
    let statusBtn = document.getElementById("btn-status");
    statusBtn.innerHTML = '<i class="fas fa-stop-circle" aria-hidden="true"></i>';
    statusBtn.setAttribute("data-value", "stop");
    setGameStatus("");
    collectGameButtons();
    toggleMiddleDisplay();
    computerTurn();

}

function gameOver() {
    toggleMiddleDisplay();
    handleHighscore();
    deactivateButtonSet();
    setTurnStatus("");
    setGameStatus("Game Over!");
    setScoreStatus("Last Score");
    let statusBtn = document.getElementById("btn-status");
    statusBtn.setAttribute("data-value", "start");
    statusBtn.innerHTML = '<i class="fas fa-play-circle" aria-hidden="true"></i>';
}

function stopGame() {
    toggleMiddleDisplay();
    //handleHighscore();
    deactivateButtonSet();
    setTurnStatus("");
    setGameStatus("Game Stopped!");
    setScoreStatus("Last Score");
    let statusBtn = document.getElementById("btn-status");
    statusBtn.setAttribute("data-value", "start");
    statusBtn.innerHTML = '<i class="fas fa-play-circle" aria-hidden="true"></i>';
}

function winRound() {
    addScore(settings.values.score.round);
    setGameStatus("You won!");
    setScoreStatus("Last Score");
}

function updateGameStats() {
    let speed = document.getElementById("stat-speed");
    let round = document.getElementById("stat-round");
    let turn = document.getElementById("stat-turn");
    let sequenceLength = document.getElementById("stat-sequence-length");
    let scoreMult = document.getElementById("stat-score-mp");
    speed.innerHTML = currentGame.speed;
    round.innerHTML = currentGame.round;
    turn.innerHTML = currentGame.turn;
    if (currentGame.sequence.length === 10) {
        sequenceLength.innerHTML = "";
    } else {
        sequenceLength.innerHTML = ` + ${currentGame.sequence.length-10}`;
    }

    scoreMult.innerHTML = currentGame.multiplier * 100 + "%";
}

/**
 * Processes the computer turn and calls to playerTurn as well as winRound
 */
async function computerTurn() {

    // if the previous turn was the last, this round is won
    if (currentGame.turn > currentGame.sequence.length) {
        winRound();
        // otherwise proceed to next turn
    } else {
        updateGameStats();
        setTurnStatus("Computer Turn");

        await sleep(settings.values.sleep.computerTurnDelay);
        for (let i = 0; i < currentGame.turn; i++) {
            //(settings.control.stopRequest === false) ? setTurnStatus("Computer Turn in progress"): stopGame();
            let index = numToString(currentGame.sequence[i] + 1);
            let curButton;
            for (let button of gameButtons) {
                if (button.classList.contains(index)) {
                    curButton = button;
                }
            }
            console.log(currentGame.sequence);
            (settings.control.stopRequest === false) ? curButton.classList.add(index + "-pressed"): stopGame();
            //(settings.control.stopRequest === false) ? gameButtons[currentGame.sequence[i]].classList.add(index + "-pressed"): stopGame();
            await sleep(currentGame.speed.press);
            //gameButtons[currentGame.sequence[i]].classList.remove(index + "-pressed");
            curButton.classList.remove(index + "-pressed");
            await sleep(currentGame.speed.delay);
        }

        (settings.control.stopRequest === false) ? playerTurn(currentGame.sequence, currentGame.turn): stopGame();

    }

}

/**
 * Processes the players turn and validated playerInput through validatePlayerInput fn, also
 * calls gameOver in case of mistakes, otherwise hands over to computerTurn
 */
async function playerTurn(sequence, turn) {

    playerInput = [];
    let currentSequence = currentGame.sequence.slice(0, currentGame.turn);
    let validity = true;
    let counter = currentSequence.length;
    setTurnStatus("Your Turn");

    while (validity === true && counter > 0) {
        if (settings.control.stopRequest === false) {
            if (playerInput.length > 0) {
                let playerInputToCheck = parseInt(playerInput.shift());
                let currentSequenceToCheck = parseInt(currentSequence.shift());
                if (validatePlayerInput(playerInputToCheck, currentSequenceToCheck)) {
                    addScore(settings.values.score.step);
                    --counter;
                } else {
                    validity = false;
                }
            }
        } else {
            break;
        }
        await sleep(settings.values.sleep.playerTurnLoop); // browser tab freezes without sleep
    }

    if (validity === true && counter <= 0) {
        ++currentGame.turn;
        addScore(settings.values.score.turn);
        computerTurn();
    } else if (validity === false) {
        gameOver();
    } else {
        stopGame();
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
//})();