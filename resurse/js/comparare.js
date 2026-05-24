
window.addEventListener("DOMContentLoaded", function () {
    const TIMEOUT_ZILE = 24 * 60 * 60 * 1000; 
    
    let produseComparare = [];
    let dataComparare = localStorage.getItem("data_comparare");
    
    if (dataComparare) {
        if (Date.now() - parseInt(dataComparare) > TIMEOUT_ZILE) {
            localStorage.removeItem("produse_comparare");
            localStorage.removeItem("data_comparare");
        } else {
            try {
                produseComparare = JSON.parse(localStorage.getItem("produse_comparare")) || [];
            } catch (e) {
                produseComparare = [];
            }
        }
    }

    let container = document.createElement("div");
    container.id = "container-comparare";
    container.className = "card shadow-lg border-primary p-3";
    container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; min-width: 300px; display: none;";
    document.body.appendChild(container);

    function actualizeazaUI() {
        localStorage.setItem("produse_comparare", JSON.stringify(produseComparare));
        if (produseComparare.length > 0) {
            localStorage.setItem("data_comparare", Date.now());
        }

        let butoane = document.querySelectorAll(".btn-compara");
        butoane.forEach(btn => {
            let idProd = btn.getAttribute("data-id");
            let esteInLista = produseComparare.find(p => p.id === idProd);
            
            if (esteInLista) {
                btn.innerHTML = "<i class='bi bi-check-circle'></i> Adăugat";
                btn.disabled = true;
                btn.title = "Produsul se află deja în lista de comparare";
            } else if (produseComparare.length >= 2) {
                btn.innerHTML = "<i class='bi bi-arrow-left-right'></i> Compară";
                btn.disabled = true; 
                btn.title = "ștergeți un produs din lista de comparare"; 
            } else {
                btn.innerHTML = "<i class='bi bi-arrow-left-right'></i> Compară";
                btn.disabled = false;
                btn.title = "";
            }
        });

        if (produseComparare.length === 0) {
            container.style.display = "none";
            container.innerHTML = "";
        } else {
            container.style.display = "block";
            let html = "<h6 class='text-primary fw-bold mb-3 border-bottom pb-2'><i class='bi bi-list-columns-reverse me-2'></i>Produse de comparat:</h6><ul class='list-unstyled mb-3'>";
            
            produseComparare.forEach(prod => {
                html += `<li class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold fs-6 me-3">${prod.nume}</span>
                            <button class="btn btn-sm btn-danger btn-sterge-comp rounded-circle" data-id="${prod.id}" title="Șterge produs"><i class="bi bi-x"></i></button>
                         </li>`;
            });
            html += "</ul>";
            
            if (produseComparare.length === 2) {
                html += `<button id="btn-afiseaza-comp" class="btn btn-success w-100 fw-bold"><i class="bi bi-table me-2"></i>Afișează</button>`;
            }
            container.innerHTML = html;

            document.querySelectorAll(".btn-sterge-comp").forEach(btn => {
                btn.onclick = function() {
                    let idDeSters = this.getAttribute("data-id");
                    produseComparare = produseComparare.filter(p => p.id !== idDeSters);
                    if (produseComparare.length === 0) {
                        localStorage.removeItem("produse_comparare");
                        localStorage.removeItem("data_comparare");
                    }
                    actualizeazaUI(); 
                };
            });

            let btnAfiseaza = document.getElementById("btn-afiseaza-comp");
            if (btnAfiseaza) {
                btnAfiseaza.onclick = function() {
                    let p1 = produseComparare[0];
                    let p2 = produseComparare[1];
                    
                    let fereastraNoua = window.open("", "Comparare", "width=800,height=500");
                    fereastraNoua.document.write(`
                        <!DOCTYPE html>
                        <html lang="ro">
                        <head>
                            <title>Comparare Produse</title>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                            <style>
                                body { font-family: 'Nunito', sans-serif; background-color: #f8f9fa; padding: 30px; }
                                th { background-color: #3B51A5 !important; color: white !important; }
                                td:first-child { font-weight: bold; background-color: #e9ecef; }
                            </style>
                        </head>
                        <body>
                            <h2 class="text-center text-primary fw-bold mb-4">Comparație Specificații</h2>
                            <table class="table table-bordered table-hover text-center align-middle shadow-sm bg-white">
                                <tr>
                                    <th width="30%">Specificație</th>
                                    <th width="35%">${p1.nume}</th>
                                    <th width="35%">${p2.nume}</th>
                                </tr>
                                <tr><td>Preț</td><td>${p1.pret} RON</td><td>${p2.pret} RON</td></tr>
                                <tr><td>Vârstă recomandată</td><td>${p1.varsta}</td><td>${p2.varsta}</td></tr>
                                <tr><td>Culoare dominantă</td><td>${p1.culoare}</td><td>${p2.culoare}</td></tr>
                                <tr><td>Admite voucher?</td><td>${p1.voucher}</td><td>${p2.voucher}</td></tr>
                            </table>
                        </body>
                        </html>
                    `);
                    fereastraNoua.document.close();
                };
            }
        }
    }

    document.querySelectorAll(".btn-compara").forEach(btn => {
        btn.onclick = function() {
            if (produseComparare.length < 2) {
                let id = this.getAttribute("data-id");
                let nume = this.getAttribute("data-nume");
                let pret = this.getAttribute("data-pret");
                let varsta = this.getAttribute("data-varsta");
                let culoare = this.getAttribute("data-culoare");
                let voucher = this.getAttribute("data-voucher") === "true" ? "Da" : "Nu";
                
                produseComparare.push({ id, nume, pret, varsta, culoare, voucher });
                actualizeazaUI();
            }
        };
    });

    actualizeazaUI();
});