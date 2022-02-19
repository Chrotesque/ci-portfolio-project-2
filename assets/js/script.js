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

document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.getElementsByTagName("button");
    setSettings(buttons);

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
 * Returns a random number between 1 and 4
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
    let difficulty = gameSettings(buttons, "difficulty");

    switch (curStatus) {
        case "Start":
            if (difficulty === "custom") {
                let settings = gameSettings(buttons, true);
                runGame(difficulty, settings);
            } else {
                runGame(difficulty);
            }
            break;
        case "Pause":
            pauseGame();
            break;
        case "Stop":
            stopGame();
            break;
    }

}

function runGame(difficulty, settings) {
    console.log("running game");
    console.log(`difficulty: ${difficulty}`);
    if (settings !== undefined) {
        console.log("settings: ");
        console.log(settings);
    }

    if (difficulty == "normal") {
        executeGame(getRandom(parseInt(settings.buttons)));
    }

}

function executeGame(push) {
    let sequence = [];
    sequence.push(push);
    console.log(sequence);
}