window.addEventListener("DOMContentLoaded", function () {
    const btnTema = document.getElementById("btn-tema");
    const iconTema = document.getElementById("icon-tema");

    function seteazaTema(isDark) {
        if (isDark) {
            document.body.classList.add("dark");
            if (btnTema) btnTema.checked = true;
            if (iconTema) {
                iconTema.classList.remove("fa-sun");
                iconTema.classList.add("fa-moon");
            }
            localStorage.setItem("tema", "dark");
        } else {
            document.body.classList.remove("dark");
            if (btnTema) btnTema.checked = false;
            if (iconTema) {
                iconTema.classList.remove("fa-moon");
                iconTema.classList.add("fa-sun");
            }
            localStorage.removeItem("tema");
        }
    }

    if (localStorage.getItem("tema") === "dark") {
        seteazaTema(true);
    } else {
        seteazaTema(false);
    }

    if (btnTema) {
        btnTema.addEventListener("change", function () {
            seteazaTema(this.checked);
        });
    }
});