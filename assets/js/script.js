document.addEventListener("DOMContentLoaded", function () {

    let buttons = document.getElementsByTagName("button");
    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "help" || this.getAttribute("data-type") === "settings") {
                let menu = this.getAttribute("data-type");
                toggleMenu(menu);
            }
        })
    }

})

function toggleMenu(menu) {

    let div = document.getElementById("menu-" + menu);
    if (div.className === "hide-element") {
        div.className = "show-element";
    } else {
        div.className = "hide-element";
    }

}