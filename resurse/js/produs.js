window.onload = function() {

    let inpDescriereObj = document.getElementById("inp-descriere");
    inpDescriereObj.addEventListener("input", function() {
        if(this.value.trim() !== "") {
            this.classList.remove("is-invalid");
        }
    });

    function valideazaInputuri() {
        let inpNume = document.getElementById("inp-nume").value.trim();
        let inpDescriere = document.getElementById("inp-descriere").value.trim();
        let isValid = true;
        
        if(inpNume.match(/[0-9]/)) {
            alert("Atenție: Numele nu poate conține cifre!");
            document.getElementById("inp-nume").classList.add("is-invalid"); // Poți folosi și aici Bootstrap
            isValid = false;
        } else {
            document.getElementById("inp-nume").classList.remove("is-invalid");
        }

        if(inpDescriere === "") {
            document.getElementById("inp-descriere").classList.add("is-invalid");
            isValid = false; 
        }

        return isValid;
    }

    document.getElementById("inp-pret").onchange = function() {
        let val = this.value;
        document.getElementById("infoRange").innerHTML = `(${val})`;
    }

    document.getElementById("filtrare").onclick = function() {
        if (!valideazaInputuri()) return;

        let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        let descriere = document.getElementById("inp-descriere").value.trim().toLowerCase();
        let pretMax = parseFloat(document.getElementById("inp-pret").value);
        let varsta = document.getElementById("inp-varsta").value.trim().toLowerCase();
        let culoare = document.querySelector('input[name="gr_rad"]:checked').value;
        let discount = document.getElementById("inp-voucher").checked;
        let categorie = document.getElementById("inp-categorie").value;
        
        let selLuni = document.getElementById("inp-luni").options;
        let luniSelectate = [];
        for (let opt of selLuni) {
            if (opt.selected) luniSelectate.push(opt.value);
        }

        let produse = document.getElementsByClassName("produs");
        for (let prod of produse) {
            let display = true;
            let valNume = prod.querySelector(".val-nume").innerHTML.trim().toLowerCase();
            if (inpNume && !valNume.includes(inpNume)) display = false;

            let valDescriere = prod.querySelector(".val-descriere").innerHTML.trim().toLowerCase();
            if (descriere && !valDescriere.includes(descriere)) display = false;

            let valPret = parseFloat(prod.querySelector(".val-pret").innerHTML.trim());
            if (valPret > pretMax) display = false;

            let valVarsta = prod.querySelector(".val-varsta").innerHTML.trim().toLowerCase();
            if (varsta && !valVarsta.includes(varsta)) display = false;

            let valCuloare = prod.querySelector(".val-culoare").innerHTML.trim();
            if (culoare !== "toate" && valCuloare !== culoare) display = false;

            let valCategorie = prod.querySelector(".val-categorie").innerHTML.trim();
            if (categorie !== "toate" && valCategorie !== categorie) display = false;

            let admiteVoucher = prod.querySelector(".val-voucher").innerHTML.trim() === "true";
            if (discount && !admiteVoucher) display = false;

            let dataText = prod.querySelector(".val-data").innerHTML.trim();
            let lunaProdus = dataText.split('-')[1]; 
            if (!luniSelectate.includes(lunaProdus)) display = false;

            prod.style.display = display ? "block" : "none";
        }
    }

    document.getElementById("resetare").onclick = function() {
        if (confirm("Ești sigur că vrei să resetezi toate filtrele și sortarea?")) {
            window.location.href = window.location.pathname; 
        }
    }

    function sortare(semn) {
        if (!valideazaInputuri()) return; 

        let produse = Array.from(document.getElementsByClassName("produs"));
        let grid = document.querySelector(".grid-produse");

        produse.sort(function(a, b) {
            let pretA = parseFloat(a.querySelector(".val-pret").innerHTML.trim());
            let pretB = parseFloat(b.querySelector(".val-pret").innerHTML.trim());

            if (pretA === pretB) {
                let compA = a.querySelector(".val-componente").innerHTML.split(',').length;
                let compB = b.querySelector(".val-componente").innerHTML.split(',').length;
                return semn * (compA - compB);
            }
            return semn * (pretA - pretB);
        });

        for (let prod of produse) grid.appendChild(prod); 
    }

    document.getElementById("sortAsc").onclick = function() { sortare(1); }
    document.getElementById("sortDesc").onclick = function() { sortare(-1); }

    document.getElementById("calculeazaPret").onclick = function() {
        if (!valideazaInputuri()) return; 
        
        let produse = document.getElementsByClassName("produs");
        let suma = 0;
        for (let prod of produse) {
            if (prod.style.display !== "none") {
                suma += parseFloat(prod.querySelector(".val-pret").innerHTML.trim());
            }
        }

        let calculDiv = document.createElement("div");
        calculDiv.innerHTML = `<b>Suma produselor afișate:</b> ${suma.toFixed(2)} RON`;
        calculDiv.style.cssText = "position:fixed; bottom:20px; right:20px; padding:20px; background:darkslateblue; color:white; border-radius:8px; z-index:1000;";
        document.body.appendChild(calculDiv);
        setTimeout(() => calculDiv.remove(), 2000);
    }
}