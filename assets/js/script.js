// SCOPE FUNCTION START

//(function () {

// GLOBAL VARIABLES

let allButtons = [];
let gameButtons = [];
let playerInput = [];
let currentGame = {};
let settings = {
    "control": {
        "stopRequest": true,
        "locked": false,
        "svgCuts": false
    },
    "setting": {
        "difficulty": "normal",
        "sound": "off",
        "markings-toggle": "on",
        "markings-type": "num",
        "markings-order": "cw",
        "stats-display": "off"
    },
    "difficulty": {
        "easy": {
            "multiplier": 0,
            "buttons": "3",
            "speed": "slow",
            "strict": "off",
            "rampup": "off",
            "sequence": 2
        },
        "normal": {
            "multiplier": 0,
            "buttons": "4",
            "speed": "normal",
            "strict": "off",
            "rampup": "off",
            "sequence": 2
        },
        "hard": {
            "multiplier": 0,
            "buttons": "5",
            "speed": "normal",
            "strict": "on",
            "rampup": "on",
            "sequence": 2
        },
        "custom": {
            "multiplier": 0,
            "buttons": "6",
            "speed": "fast",
            "strict": "on",
            "rampup": "on",
            "sequence": 2
        }
    },
    "values": {
        "speed": {
            "slow": {
                "press": 700,
                "delay": 350
            },
            "normal": {
                "press": 500,
                "delay": 250
            },
            "fast": {
                "press": 300,
                "delay": 150
            }
        },
        "score": {
            "step": 10,
            "turn": 50,
            "round": 250
        },
        "sleep": {
            "computerTurnDelay": 2000,
            "newRoundDelay": 4000,
            "playerTurnLoop": 100,
            "playerButtonPress": 300
        },
        "rampup": {
            "roundIncrease": 10
        },
        "multiplier": {
            "buttons": {
                3: -15,
                4: 0,
                5: 15,
                6: 30
            },
            "speed": {
                "slow": -10,
                "normal": 0,
                "fast": 10
            },
            "strict": {
                "off": 0,
                "on": 20
            },
            "rampup": {
                "off": 0,
                "on": 15
            }
        }
    }
}
const audio = {
    one: new Audio("assets/audio/beep1.mp3"),
    two: new Audio("assets/audio/beep2.mp3"),
    three: new Audio("assets/audio/beep3.mp3"),
    four: new Audio("assets/audio/beep4.mp3"),
    five: new Audio("assets/audio/beep5.mp3"),
    six: new Audio("assets/audio/beep6.mp3")
};

// EVENT LISTENERS

document.addEventListener("DOMContentLoaded", function () {

    allButtons = document.getElementsByTagName("button");
    allPaths = document.getElementsByTagName("path");
    initiateSettings();
    updateScoreMultiplierInternal();
    updateScoreMultiplierExternal();
    setMenuData();

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

// GAME LOGIC

/**
 * Controls the game depending on what button has been pressed, start, stop, etc.
 */
function controlGame(button) {

    let curButton = button.getAttribute("data-value");
    switch (curButton) {
        case "start":
            settings.control.stopRequest = false;
            runGame();
            break;
        case "stop":
            stopGame();
            break;
        default:
            playerInput.push(stringToNum(curButton) - 1);
            playButton(curButton);
    }
}

/**
 * Game initiation fn that takes snapshot of settings so that changes to settings
 * don't affect a running game through the use of the currentGame object, then
 * starts the game with the first computerTurn
 */
function runGame() {

    settings.control.stopRequest = false;

    // for ease of use during creation of a snapshot of the settings
    let diffSettings = settings.difficulty[settings.setting.difficulty];
    let speedSettings = settings.values.speed;
    let speedPress = speedSettings[diffSettings.speed].press;
    let speedDelay = speedSettings[diffSettings.speed].delay;
    let btnNum = numToString(diffSettings.buttons);

    // snapshot of settings to the currentGame var
    setScore(0);
    currentGame.multiplier = diffSettings.multiplier;
    currentGame.round = 1;
    currentGame.turn = 1;
    currentGame.buttons = diffSettings.buttons;
    currentGame.speed = [speedPress, speedDelay];
    currentGame.strict = diffSettings.strict;
    currentGame.rampup = diffSettings.rampup;
    currentGame.sequenceLength = diffSettings.sequence;
    currentGame.sequence = createSequence(currentGame.sequenceLength, diffSettings.buttons);
    if (settings.setting['markings-toggle'] === "on") {
        toggleMarkings(btnNum);
    }

    // start of the game

    let statusBtn = document.getElementById("btn-status");
    let svgNoCut = document.getElementById("game-circle-outer-nocut");
    let svgCut = document.getElementById("game-circle-outer-cut");
    let svgScore = document.getElementById("game-circle-text-score");
    statusBtn.innerHTML = '<i class="fas fa-stop-circle" aria-hidden="true"></i>';
    statusBtn.setAttribute("data-value", "stop");
    setGameStatus("");
    collectGameButtons();
    if (settings.control.svgCuts === false) {
        toggleElement(svgNoCut);
        toggleElement(svgCut);
        toggleElement(svgScore);
        settings.control.svgCuts = true;
    }
    toggleDifficultySelection();
    computerTurn();
}

/**
 * Processes the computer turn and calls to playerTurn
 */
async function computerTurn() {

    // if the previous turn was the last, this round is won
    if (currentGame.turn > currentGame.sequence.length) {
        newRound();
        // otherwise proceed to next turn
    } else {
        //updateGameStats();
        if (settings.control.stopRequest === false) {
            setTurnStatus("Computer Turn");
        }

        await sleep(settings.values.sleep.computerTurnDelay);
        for (let i = 0; i < currentGame.turn; i++) {
            let index = numToString(currentGame.sequence[i] + 1);
            let curButton;
            for (let button of gameButtons) {
                if (button.classList.contains(index)) {
                    curButton = button;
                }
            }
            if (settings.control.stopRequest === false) {
                curButton.classList.add(index + "-pressed");
                if (settings.setting.sound === "on") {
                    audio[curButton.getAttribute("data-value")].play();
                }
            } else {
                stopGame();
            }
            await sleep(currentGame.speed[0]);
            curButton.classList.remove(index + "-pressed");
            await sleep(currentGame.speed[1]);
        }
        (settings.control.stopRequest === false) ? playerTurn(currentGame.sequence, currentGame.turn): stopGame();
    }
}

/**
 * Processes the players turn and validated playerInput through validatePlayerInput fn, also
 * calls gameOver in case of mistakes, otherwise hands over to computerTurn
 */
async function playerTurn() {

    playerInput = [];
    let currentSequence = currentGame.sequence.slice(0, currentGame.turn);
    let validity = true;
    let counter = currentSequence.length;
    let turnScore = 0;
    if (settings.control.stopRequest === false) {
        setTurnStatus("Your Turn");
    }

    while (validity === true && counter > 0) {
        if (settings.control.stopRequest === false) {
            if (playerInput.length > 0) {
                let playerInputToCheck = parseInt(playerInput.shift());
                let currentSequenceToCheck = parseInt(currentSequence.shift());
                if (validatePlayerInput(playerInputToCheck, currentSequenceToCheck)) {
                    turnScore += settings.values.score.step;
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
        turnScore += settings.values.score.turn
        addScore(turnScore);
        computerTurn();
    } else if (validity === false) {
        failCheck();
    } else {
        stopGame();
    }
}

// GAME STATUS

/**
 * Ends the game after making a mistake
 */
function gameOver() {
    let statusBtn = document.getElementById("btn-status");
    let btnNum = numToString(settings.difficulty[settings.setting.difficulty].buttons);
    currentGame = {};
    toggleDifficultySelection();
    deactivateButtonSet();
    setTurnStatus("");
    setGameStatus("Game Over!");
    if (settings.setting['markings-toggle'] === "on") {
        toggleMarkings(btnNum);
    }
    statusBtn.setAttribute("data-value", "start");
    statusBtn.innerHTML = '<i class="fas fa-play-circle" aria-hidden="true"></i>';
}

/**
 * Ends the game after stop has been pressed
 */
function stopGame() {
    if (settings.control.stopRequest === false) {
        let statusBtn = document.getElementById("btn-status");
        let btnNum = numToString(settings.difficulty[settings.setting.difficulty].buttons);
        currentGame = {};
        settings.control.stopRequest = true;
        toggleDifficultySelection();
        deactivateButtonSet();
        setTurnStatus("");
        if (settings.setting['markings-toggle'] === "on") {
            toggleMarkings(btnNum);
        }
        setGameStatus("Game Stopped!");
        statusBtn.setAttribute("data-value", "start");
        statusBtn.innerHTML = '<i class="fas fa-play-circle" aria-hidden="true"></i>';
    }
}

/**
 * Initiates a new round after the last one was won
 */
async function newRound() {
    currentGame.round++;
    currentGame.turn = 1;

    let rampup = rampUpDifficulty(currentGame.sequenceLength, currentGame.speed[0], currentGame.speed[1]);
    currentGame.sequenceLength = rampup.sequenceLength;
    currentGame.speed[0] = rampup.speed;
    currentGame.speed[1] = rampup.delay;

    currentGame.sequence = createSequence(currentGame.sequenceLength, currentGame.buttons);
    //TBD: increasing difficulty, speed, etc.
    setTurnStatus("");
    setGameStatus(`Round ${currentGame.round-1} won!`);
    await sleep(settings.values.sleep.newRoundDelay);
    setGameStatus("");
    computerTurn();
}

/**
 * Increases difficulty when option ramp up is active
 */
function rampUpDifficulty(length, speed, delay) {
    let result = {};
    if (currentGame.rampup === "on") {
        result = {
            "sequenceLength": length + 1,
            "speed": speed - (speed / settings.values.rampup.roundIncrease),
            "delay": delay - (delay / settings.values.rampup.roundIncrease)
        };
    } else {
        result = {
            "sequenceLength": length,
            "speed": speed,
            "delay": delay
        };
    }
    return result;
}

function failCheck() {
    let strict = currentGame.strict;
    if (strict === "on") {
        gameOver();
    } else {
        repeatSequence();
    }
}

async function repeatSequence() {
    setTurnStatus("");
    setGameStatus(`Wrong! Let's repeat.`);
    await sleep(settings.values.sleep.computerTurnDelay);
    setGameStatus("");
    computerTurn();
}

// SINGLE USE HTML POPULATION

/**
 * Reads globVar and sets settings accordingly through adding html class
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

/**
 * Reads globVar and populates HTML with various numbers and multiplier percentages
 */
function setMenuData() {
    let button = document.getElementById("points-button");
    let turn = document.getElementById("points-turn");
    let round = document.getElementById("points-round");
    let buttonMult = document.getElementById("multiplier-buttons");
    let speedMult = document.getElementById("multiplier-speed");
    let strictMult = document.getElementById("multiplier-strict");
    let rampupMult = document.getElementById("multiplier-rampup");
    button.innerHTML = settings.values.score.step;
    turn.innerHTML = settings.values.score.turn;
    round.innerHTML = settings.values.score.round;
    buttonMult.innerHTML = prepareMultiplierData(Object.values(settings.values.multiplier.buttons));
    speedMult.innerHTML = prepareMultiplierData(Object.values(settings.values.multiplier.speed));
    strictMult.innerHTML = prepareMultiplierData(Object.values(settings.values.multiplier.strict));
    rampupMult.innerHTML = prepareMultiplierData(Object.values(settings.values.multiplier.rampup));
}

// SETTINGS

/**
 * Change game setting for next game through adding &| removing css class as well as changing global 
 * settings variable
 */
function changeSetting2(clicked) {

    let cat = clicked.getAttribute("data-cat");
    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value");
    let customChanges = 0;
    for (let button of allButtons) {
        if (button.getAttribute("data-type") === type) {
            if (button.getAttribute("data-type") === "stats-display") {
                toggleAdvancedInfo();
            }
            if (button.getAttribute("data-type") === "markings-toggle") {
                //if (typeof currentGame.round === 'number') {
                let btnNum = numToString(settings.difficulty[settings.setting.difficulty].buttons);
                toggleMarkings(btnNum);
                //}
            }
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

    // update the score multiplier & difficulty only when changes were made to custom diff settings
    if (customChanges > 0) {
        updateScoreMultiplierInternal();
        updateScoreMultiplierExternal();
        if (settings.setting.difficulty !== "custom") {
            settings.setting.difficulty = "custom";
            for (let button of allButtons) {
                if (button.getAttribute("data-type") === "difficulty") {
                    if (button.getAttribute("data-value") === "custom") {
                        button.classList.add("active");
                    } else {
                        if (button.classList.contains("active")) {
                            button.classList.remove("active");
                        }
                    }
                }
            }
        }
    }

    updateGameButtons();
    clicked.classList.add("active");
}

function changeSetting(clicked) {
    console.log(clicked);
    let cat = clicked.getAttribute("data-cat");
    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value");

    // change values in globVar
    if (cat === "setting") {
        settings[cat][type] = value;
    } else {
        settings.difficulty[cat][type] = value;
    }

    for (let button of allButtons) {
        if (button.getAttribute("data-cat") === cat) {
            if (button.getAttribute("data-type") === type) {
                if (button.classList.contains("active")) {
                    if (cat === "custom") {
                        // update multiplier values only if changes occured
                        settings.setting.difficulty = "custom";
                        for (let button of allButtons) {
                            // update difficulty buttons
                            if (button.getAttribute("data-type") === "difficulty") {
                                if (button.getAttribute("data-value") === "custom") {
                                    button.classList.add("active");
                                } else {
                                    if (button.classList.contains("active")) {
                                        button.classList.remove("active");
                                    }
                                }
                            }
                        }
                        updateGameButtons();
                        // update score multipliers
                        updateScoreMultiplierInternal();
                        updateScoreMultiplierExternal();
                    }
                    // remove active from currently active element
                    button.classList.remove("active");
                }
            }
        }
    }

    // add active to clicked element and update gameButtons
    clicked.classList.add("active");
    updateGameButtons();
    switch (clicked.getAttribute("data-type")) {
        case "sound":
            settings.setting.sound = value;
            break;
        case "stats-display":
            settings.setting["stats-display"] = value;
            toggleAdvancedInfo();
            break;
        case "markings-toggle":
            if (currentGame.buttons !== undefined) {
                toggleMarkings(numToString(currentGame.buttons));
            }
            break;
        case "markings-type":
            changeMarkingsType();
            break;
        case "markings-order":
            changeMarkingsOrder();
            break;
    }
}

// SCORE

/**
 * Add to the current score amount 
 */
function addScore(update) {
    currentGame.score += update * currentGame.multiplier;
    document.getElementById("score-amount").innerHTML = Math.round(currentGame.score);
}

/**
 * Sets the score to a certain amount 
 */
function setScore(update) {
    currentGame.score = update;
    document.getElementById("score-amount").innerHTML = Math.round(currentGame.score);
}

/**
 * Updates the multiplier values for the difficulties in the settings globVar
 */
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

/**
 * Updates the multiplier display in help and settings menu
 */
function updateScoreMultiplierExternal() {
    let easy = `${Math.round(settings.difficulty.easy.multiplier * 100)}%`;
    let normal = `${Math.round(settings.difficulty.normal.multiplier * 100)}%`;
    let hard = `${Math.round(settings.difficulty.hard.multiplier * 100)}%`;
    let custom = `${Math.round(settings.difficulty.custom.multiplier * 100)}%`;
    document.getElementById("multiplier-easy").innerHTML = easy;
    document.getElementById("multiplier-normal").innerHTML = normal;
    document.getElementById("multiplier-hard").innerHTML = hard;
    document.getElementById("multiplier-custom").innerHTML = custom;
    document.getElementById("score-mp").innerHTML = custom;
}

// STATUS CHANGES

/**
 * Changes the turn status display, ie: Your Turn, Computer Turn, etc.
 */
function setTurnStatus(update) {
    let status = document.getElementById("turn-status");
    status.textContent = update;
}

/**
 * Changes the game status display, ie: Game Over, Game Stopped, etc.
 */
async function setGameStatus(update) {
    let status = document.getElementById("game-status");
    status.textContent = update;
}

// TOGGLERS

/**
 * Toggles a hidden element to either hidden / shown
 */
function toggleElement(element) {
    // element is hidden, remove to show
    if (element.classList.contains("hide-element")) {
        element.classList.remove("hide-element");
        // element is visible, add hide
    } else {
        element.classList.add("hide-element");
    }
}

/**
 * Specifically toggles the difficulty selection UI
 */
function toggleDifficultySelection() {
    let diffSelect = document.getElementById("difficulty-selection");
    toggleElement(diffSelect);
}

/**
 * Toggles Markings
 */
function toggleMarkings(number) {
    let parent = document.getElementById("btn-set-" + number);
    toggleElement(parent.childNodes[1]);
}

/**
 * Toggles a menu visible / invisible
 */
function toggleMenu(clicked) {

    let selection = clicked.getAttribute("data-value");
    let div = document.getElementById("menu-" + selection);
    toggleElement(div);

}

/**
 * Toggles advanced game info through settings menu, ie: multiplier percentages & 
 * in-game stats during a game
 */
function toggleAdvancedInfo() {
    let setting = settings.setting["stats-display"];
    if (setting === "off") {
        document.getElementById("multiplier-buttons").classList.add("hide-element");
        document.getElementById("multiplier-speed").classList.add("hide-element");
        document.getElementById("multiplier-strict").classList.add("hide-element");
        document.getElementById("multiplier-rampup").classList.add("hide-element");
    } else {
        document.getElementById("multiplier-buttons").classList.remove("hide-element");
        document.getElementById("multiplier-speed").classList.remove("hide-element");
        document.getElementById("multiplier-strict").classList.remove("hide-element");
        document.getElementById("multiplier-rampup").classList.remove("hide-element");
    }
}

/**
 * Toggles the amount of game buttons being displayed through class add/rem
 */
function updateGameButtons() {

    let newButtonAmt = parseInt(settings.difficulty[settings.setting.difficulty].buttons);
    let identifier = numToString(newButtonAmt);
    let allButtonSets = document.getElementsByClassName("svg-btn");
    for (let button of allButtonSets) {
        // firstly hide them all
        if (!button.classList.contains("hide-element")) {
            toggleElement(button);
        }
    }
    let newSetToShow = document.getElementById("btn-set-" + identifier);
    // secondly show the correct one
    toggleElement(newSetToShow);

}

function changeMarkingsType() {

}

/**
 * Reverses the order of button markings
 */
function changeMarkingsOrder() {
    // repeat this for all btn sets
    for (let i = 3; i < 7; i++) {
        let number = numToString(i);
        let btnSet = document.getElementById("btn-set-" + number);
        let markings = [];
        let buttons = [];
        let parent = btnSet.childNodes[1].querySelectorAll('p');
        for (let j = 0; j < parent.length; j++) {
            markings.push(parent[j].innerHTML);
            buttons.push(parent[j]);
        }
        // reverse array
        markings.reverse();
        // making sure that the 1 stays at the same spot on the screen, yet the rest reversed
        let last = markings.pop();
        markings.unshift(last);
        for (let k = 0; k < buttons.length; k++) {
            buttons[k].innerHTML = markings[k];
        }
    }
}

// GAME BUTTONS

/**
 * Saves all available game buttons in global array for convenient access
 */
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

/**
 * Removes inactive class from all game buttons, ie: upon start of a game
 */
function activateButtonSet() {
    for (let i = 0; i < gameButtons.length; i++) {
        gameButtons[i].classList.remove("inactive");
    }
}

/**
 * Adds inactivate class to all game buttons, ie: upon game stop
 */
function deactivateButtonSet() {
    for (let i = 0; i < gameButtons.length; i++) {
        gameButtons[i].classList.add("inactive");
    }
}

/**
 * Lights up the button the player is activating through adding/removing a class
 */
async function playButton(input) {
    let curButton;
    for (let button of gameButtons) {
        if (input === button.getAttribute("data-value")) {
            curButton = button;
        }
    }
    if (settings.setting.sound === "on") {
        audio[curButton.getAttribute("data-value")].play();
    }
    curButton.classList.add(input + "-pressed");
    await sleep(settings.values.sleep.playerButtonPress);
    curButton.classList.remove(input + "-pressed");
}

// HELPER FUNCTIONS

/**
 * Converts an integer into a string and returns it
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

/**
 * Converts string into an integer and returns it
 */
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
 * Validates player input compared to the computer sequence and returns bool
 */
function validatePlayerInput(num1, num2) {

    if (num1 === num2) {
        return true;
    } else {
        return false;
    }
}

/**
 * Returns a random number between 1 and (max)
 */
function getRandom(max) {
    return Math.floor(Math.random() * max);

}

/**
 * Returns a random number between (min) and (max)
 */
function getRandomRange(min, max) {
    let stop = false;
    let result;
    while (stop === false) {
        let random = getRandom(max);
        if (random >= min) {
            result = random;
            stop = true;
        }
    }
    return result;
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
 * Sleep function
 */
// CREDIT: https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    let promise = new Promise(resolve => setTimeout(resolve, ms));
    if (settings.control.stopRequest === false) {
        return promise;
    }
}

/**
 * Takes settings globVar data and prepares it for display
 */
function prepareMultiplierData(input) {
    let result = " (";
    for (let i = 0; i < input.length; i++) {
        // all entries apart from the last
        if (i < input.length - 1) {
            if (input[i] <= 0) {
                result += `${input[i]}`;
                result += ", ";
            } else {
                result += `+${input[i]}`;
                result += ", ";
            }
        } else {
            result += `+${input[i]}`;
            result += ` %)`;
        }
    }
    return result;
}

// SCOPE FUNCTION END

//})();