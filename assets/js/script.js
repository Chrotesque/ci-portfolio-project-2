document.addEventListener("DOMContentLoaded", function () {

    let buttonsAll = document.getElementsByTagName("button");
    for (let button of buttonsAll) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "menu") {
                toggleMenu(this, this.getAttribute("data-value"));
            } else if (this.getAttribute("data-type") === "difficulty") {
                changeDifficulty(buttonsAll, this.getAttribute("data-value"));
            } else if (this.getAttribute("data-type") === "game-control") {
                controlGame(this);
            }
        })
    }
})


/**
 * Showing | Hiding menus through adding &| removing css class
 * @param {object} button 
 * @param {string} selection 
 */
function toggleMenu(button, selection) {

    let div = document.getElementById("menu-" + selection);
    if (div.className === "hide-element") {
        button.className = "selected";
        div.className = "show-element";
    } else {
        div.className = "hide-element";
        button.removeAttribute("class");
    }

}

/**
 * Change game difficulty for next game through adding &| removing css class
 * @param {object} buttons 
 * @param {string} selection 
 */
function changeDifficulty(buttons, selection) {

    console.log(typeof (selection));
    for (let button of buttons) {
        if (button.getAttribute("data-type") === "difficulty" && button.getAttribute("data-value") === selection) {
            button.className = "selected";
        } else {
            button.removeAttribute("class");
        }
    }

}