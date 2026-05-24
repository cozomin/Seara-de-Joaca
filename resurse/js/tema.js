window.addEventListener("DOMContentLoaded", function () {
    const switchTema = document.getElementById("schimba_tema");

    function aplicaTema(tema) {
        document.body.setAttribute("data-bs-theme", tema);
        
        if (switchTema) {
            switchTema.checked = (tema === "dark");
        }
    }

    const temaSalvata = localStorage.getItem("tema") || "light";
    aplicaTema(temaSalvata);

    if (switchTema) {
        switchTema.addEventListener("change", function () {
            const nouaTema = this.checked ? "dark" : "light";
            
            aplicaTema(nouaTema);
            localStorage.setItem("tema", nouaTema);
        });
    }
});