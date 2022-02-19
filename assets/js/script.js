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

    let i = 0;
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

    let curStatus = button.innerHTML; // start, pause, etc.

    switch (curStatus) {
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

}

// https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGame2(difficulty, settings) {
    let sequence = [];
    for (let i = 0; i < 10; i++) {
        sequence[i] = getRandom(4);
        gameButtons[sequence[i] - 1].classList.add("active");
        console.log(sequence[i]);
        await sleep(1150);
        gameButtons[sequence[i] - 1].classList.remove("active");
        await sleep(350);
    }
    console.log("full: " + sequence);
}










function runGame(round) {
    let roundLimit = 4; // to avoid an endless loop during testing
    let sequence = [];
    round = (typeof round === 'undefined') ? 0 : ++round;
    for (i = 0; i < 10; i++) {
        sequence[i] = getRandom(4);
        console.log(sequence[i]);
    }
    if (round < roundLimit) { // to avoid an endless loop during testing
        console.log(`round ${round+1}`);
        computerTurn(sequence, round, true);
    } else {
        console.log("end of game");
    }
}

function computerTurn(sequence, round, reset) {
    if (reset === true) {
        step = 1;
    } else {
        ++step;
    }
    //step = (typeof step === 'undefined' || typeof step === NaN) ? 1 : ++step;
    console.log(`sequence ${sequence}`);
    for (let i = 0; i < step; i++) {
        console.log(`computerTurn - step ${step} (${sequence[step-1]})`);
    }
    playerTurn(sequence, round, step)
}

async function playerTurn(sequence, round, step) {
    if (step === 0) {
        ++step;
    }
    let curSeq = sequence.slice(0, step);
    console.log(`playerTurn - step ${step} of sequence ${sequence} | current: ${curSeq}`);
    await sleep(2500);
    if (curSeq.length === sequence.length) {
        runGame(round);
    } else {
        computerTurn(sequence, round);
    }
}