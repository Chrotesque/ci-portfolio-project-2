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

async function runGame(difficulty, settings) {
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