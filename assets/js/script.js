document.addEventListener("DOMContentLoaded", function () {

    let buttons = document.getElementsByTagName("button");

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


/**
 * Showing | Hiding menus through adding &| removing css class 
 * @param {object} button menu-button clicked
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
 * Change game setting for next game through adding &| removing css class
 * @param {object} buttons all (DOM wide)
 * @param {object} clicked setting-button clicked
 */
function changeSetting(buttons, clicked) {

    let type = clicked.getAttribute("data-type");
    let value = clicked.getAttribute("data-value")

    for (let button of buttons) {
        if (button.getAttribute("data-type") === type) {
            if (button.getAttribute("data-value") === value) {
                button.className = "active";
            } else {
                button.classList.remove("active");
            }
        }
    }

}

/**
 * Sets and gets game settings for global use
 * @param {string} request "get" or "set"
 * @returns 
 */
function gameSettings(request) {
    let settings = {};

    // code

    return settings;
}


function controlGame(button) {

    let buttonSetting = document.getElementsByTagName("input");
    for (let element of buttonSetting) {
        if (element.checked && element.getAttribute("data-type") === "speed") {
            console.log(element.getAttribute("data-value"));
            break;
        }
    }

    let status;
    let gameButton;
    let type = button.getAttribute("data-value");
    switch (type) {
        case "status":
            console.log("status");
            status = document.getElementById("btn-status").innerHTML; // Start / Pause / Stop
            break;
        case "1":
            console.log(1);
            break;
        default:
            console.log("default");
    }

}