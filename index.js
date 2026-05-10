const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp= require("sharp");

const ejs=require('ejs');
const pg = require("pg");


//Livereload 

const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// const app = express();


//E4.2.1 Obiect express server creat
app = express();
app.set("view engine", "ejs")

app.use(connectLivereload());

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);
//E4.3 cwd afiseaza directorul de unde este rulata comanda node
//__dirname este directorul unde este fisierul index.js

client=new pg.Client({
    database:"cti",
    user:"postgres",
    password:"SQLpa55",
    host:"localhost",
    port:5432
})

client.connect()

app.use(async function(req, res, next) {
    try {
        let rez = await client.query("select unnest(enum_range(null::tip_categorie))");
        res.locals.optiuni = rez.rows; // Devine automat disponibil in orice fisier .ejs ca locals.optiuni
    } catch(err) {
        console.error("Eroare preluare enum categorii", err);
        res.locals.optiuni = [];
    }
    next();
});

// client.query("select * from unnest(enum_range(null::tip_categorie))", function(err, rez){
//     if (err){
//         console.log("Eroare", err)
//         afisareEroare(rez, 2)
//     }
//     else{
//         console.log(rez)
//     }
// })


let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});
    }
}

//E4.6 folderul de resurse este definit ca unul static
app.use("/resurse",express.static(path.join(__dirname, "resurse")));
app.use("/dist",express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"))
});

//E4.8
//E4.8
app.get(["/", "/index", "/home"], async function(req, res) {
    let imaginiValide = obGlobal.obImagini.imagini.filter(img => img.nume && img.nume.length < 12);
    let nr_optiuni = [4, 9, 16];
    
    let optiuniValabile = nr_optiuni.filter(nr => nr <= imaginiValide.length);
    if(optiuniValabile.length === 0) optiuniValabile.push(4); 
    
    let N_galerie = optiuniValabile[Math.floor(Math.random() * optiuniValabile.length)];
    let n = Math.sqrt(N_galerie);

    const shuffle = arr => {
        let clona = [...arr];
        for (let i = clona.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clona[i], clona[j]] = [clona[j], clona[i]];
        }
        return clona;
    };

    let imaginiAmestecate = shuffle(imaginiValide);
    let imaginiGalerieAnimata = imaginiAmestecate.slice(0, N_galerie);

    while(imaginiGalerieAnimata.length < N_galerie) {
        imaginiGalerieAnimata.push(imaginiValide[Math.floor(Math.random() * imaginiValide.length)]);
    }


    //galerie statica
    let imaginiStatice = getImaginiFiltrate();
   
    let caleGalerie = obGlobal.obImagini.cale_galerie;
    let caleAbs = path.join(__dirname, caleGalerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");

   let toateImaginileDePePagina = new Set([...imaginiStatice, ...imaginiGalerieAnimata]);

    for (let imag of toateImaginileDePePagina) {
        let arr = imag.cale_relativa.split(".");
        let numeFis = arr[0];
        let caleFisAbs = path.join(caleAbs, imag.cale_relativa);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");

        if (!fs.existsSync(caleFisMediuAbs) && fs.existsSync(caleFisAbs)) {
            await sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        }
        if (!fs.existsSync(caleFisMicAbs) && fs.existsSync(caleFisAbs)) {
            await sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        }
    }

    res.render("pagini/index", {
        ip: req.ip,
        imagini: imaginiStatice,
        imaginiGalerieAnimata: imaginiGalerieAnimata,
        N_galerie: N_galerie,
        n: n 
    });
});

//     let N_galerie = parseInt(req.query.n) || 9;
//     let n = Math.sqrt(N_galerie);
//     if (![2, 3, 4].includes(n)) n = 3;

//     // Preluăm secvența de deplasare (ordinea din grid)
//     let secventa = sequences[n] || sequences[3];
    
//     // Convertim secvența JavaScript într-o sintaxă pe care SASS o recunoaște ca listă de liste: ((0,0), (0,1), ...)
//     let sassList = "(" + secventa.map(pos => `(${pos[0]}, ${pos[1]})`).join(", ") + ")";

//     let caleScss = path.join(obGlobal.folderScss, "galerie_animata.scss");
//     let continutScss = "";
    
//     try {
//         continutScss = fs.readFileSync(caleScss, "utf8");
//     } catch(e) {
//         return res.status(404).send("Fișierul SASS lipsește.");
//     }

//     // Randăm EJS-ul direct în codul SASS
//     let scssRandat = ejs.render(continutScss, { n: n, sassList: sassList });

//     try {
//         let rezCompilare = sass.compileString(scssRandat, {
//             loadPaths: [obGlobal.folderScss]
//         });
//         res.setHeader("Content-Type", "text/css");
//         res.send(rezCompilare.css);
//     } catch (err) {
//         console.error("Eroare la compilarea SASS galerie: ", err);
//         res.status(500).send("");
//     }
// });

//E4.9
app.get("/despre", function(req, res){
    res.render("pagini/despre");
});

app.get("/galerie", function(req, res){
    let imaginiStatice = getImaginiFiltrate();
    
    res.render("pagini/galerie", {
        imagini: imaginiStatice
    });
})


app.get("/produse", function(req, res){
    let clauzaWhere=""
    if (req.query.tip)
        clauzaWhere=` where categorie_mare='${req.query.tip}'`
    client.query(`select * from produse ${clauzaWhere}`, function(err, rez){
        if (err){
            console.log("Eroare", err)
            afisareEroare(res,2)
        }
        else{
            client.query("select * from unnest(enum_range(null::tip_categorie))", function(err, rezOptiuni){
                if (err){
                    afisareEroare(res,2)
                }
                else{
                    res.render("pagini/produse",{
                        produse:rez.rows,
                        optiuni:rezOptiuni.rows
                    })
                }
            })
            
        }
    })
});


app.get("/produs/:id", function(req, res){
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
    if (err){
        console.log("Eroare", err)
        afisareEroare(res,2)
    }
    else{
        if (rez.rowCount==0){
            afisareEroare(res,404,"Produs inexistent")
        }
        else{
            
            res.render("pagini/produs",{
                prod:rez.rows[0],
            })
        }
        
    }
})
});

//E4.B
function verificaEroriJson() {
    const caleJson = path.join(__dirname, "resurse/json/erori.json");

    // Verificam daca fisierul exista. Daca nu, opreste aplicatia
    if (!fs.existsSync(caleJson)) {
        console.error(`Eroare critica: Fisierul erori.json nu exista la calea: ${caleJson}. Aplicatia se va inchide.`);
        process.exit(1);
    }   

    // Citeste fisierul ca string
    const continutString = fs.readFileSync(caleJson, "utf-8");

    // Cauta proprietati duplicate la nivel de string 
    // Extrage fiecare bloc de tip obiect {...} pentru a-l analiza independent
    const blocuriObiecte = continutString.match(/\{[^{}]*\}/g) || [];
    for (let bloc of blocuriObiecte) {
        // Cauta toate cheile de tipul "cheie":
        const chei = [...bloc.matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]);
        const cheiUnice = new Set(chei);

        if (chei.length !== cheiUnice.size) {
            // Gaseste fix cheia care se repeta pentru un mesaj
            const duplicate = chei.filter((item, index) => chei.indexOf(item) !== index);
            console.error(`Eroare JSON: Proprietate duplicata gasita -> [${duplicate.join(', ')}]. Corectati textul fisierului erori.json.`);
        }
    }

    let erori;
    try {
        erori = JSON.parse(continutString);
    } catch (e) {
        console.error("Eroare JSON: Fisierul erori.json nu este un JSON valid sintactic. Analiza structurii se opreste aici.");
        return;
    }

    // Verifica existenta proprietatilor fundamentale
    if (!erori.info_erori || !erori.cale_baza || !erori.eroare_default) {
        console.error("Eroare JSON: Lipsesc una sau mai multe proprietati principale: 'info_erori', 'cale_baza', sau 'eroare_default'.");
    } else {

        // Verifica daca folderul setat in cale_baza chiar exista
        const caleBazaAbsoluta = path.join(__dirname, erori.cale_baza);
        if (!fs.existsSync(caleBazaAbsoluta)) {
            console.error(`Eroare FOLDER: Folderul specificat in 'cale_baza' (${erori.cale_baza}) nu exista in proiect.`);
        }

        // Verifica detaliile pentru eroare_default
        if (!erori.eroare_default.titlu || !erori.eroare_default.text || !erori.eroare_default.imagine) {
            console.error("Eroare JSON: Obiectului 'eroare_default' ii lipseste proprietatea 'titlu', 'text' sau 'imagine'.");
        } else {
            // Verificam daca imaginea default exista efectiv in folder
            const caleImagineDefault = path.join(caleBazaAbsoluta, erori.eroare_default.imagine);
            if (!fs.existsSync(caleImagineDefault)) {
                console.error(`Eroare IMAGINE: Imaginea default (${erori.eroare_default.imagine}) nu a fost gasita la calea specificata.`);
            }
        }

        const identificatoriVazuti = new Set();

        for (let eroare of erori.info_erori) {
            // Identificatori duplicati
            if (identificatoriVazuti.has(eroare.identificator)) {
                // Extrage toate proprietatile ignorand identificatorul pentru afisare
                const { identificator, ...proprietatiFaraId } = eroare;
                console.error(`Eroare JSON: Identificator duplicat detectat (${eroare.identificator}). Celelalte date ale erorii clonate sunt:`, proprietatiFaraId);
            } else {
                identificatoriVazuti.add(eroare.identificator);
            }

            // Verifica daca fisierul imaginii exista pentru fiecare eroare din vector
            if (eroare.imagine) {
                const caleImagineEroare = path.join(caleBazaAbsoluta, eroare.imagine);
                if (!fs.existsSync(caleImagineEroare)) {
                    console.error(`Eroare IMAGINE: Fisierul imagine (${eroare.imagine}) asociat erorii cu identificatorul ${eroare.identificator} lipseste din fisierele proiectului.`);
                }
            }
        }
    }
}

verificaEroriJson();

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()


function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    let eroare= obGlobal.obErori.info_erori.find((elem) =>
        elem.identificator == identificator
    )
    //daca sunt setate titlu, text, imagine, le folosim, 
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault= obGlobal.obErori.eroare_default;
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}

// app.get("/galerie-animata.css", function(req, res) {
//     compileazaScss("galerie_animata.scss", "galerie_animata.css", {
//         culoare: "darkslateblue"
//     });

//     res.setHeader("Content-Type", "text/css");
//     res.sendFile(path.join(obGlobal.folderCss, "galerie_animata.css"));
// });

// Filtrare imagini
function getImaginiFiltrate() {
    let ora = new Date().getHours();
    let timp;
    if (ora >= 5 && ora < 12) {
        timp = "dimineata";
    } else if (ora >= 12 && ora < 20) {
        timp = "zi";
    } else {
        timp = "noapte";
    }

    let imaginiTimp = obGlobal.obImagini.imagini.filter(img => img.timp === timp);
    let trunchiat = Math.max(6, imaginiTimp.length - (imaginiTimp.length % 3));
    if (trunchiat > imaginiTimp.length) trunchiat = imaginiTimp.length; 
    return imaginiTimp.slice(0, trunchiat);
}

//E5.B5
function verificaEroriGalerieJson() {
    const caleJson = path.join(__dirname, "resurse/json/galerie.json");
    if (!fs.existsSync(caleJson)) {
        console.error(`Eroare critica: Fisierul galerie.json nu a fost gasit la calea: ${caleJson}`);
        return;
    }

    const continutString = fs.readFileSync(caleJson, "utf-8");
    let date;
    try {
        date = JSON.parse(continutString);
    } catch (e) {
        console.error("Eroare JSON: Fisierul galerie.json nu este un JSON valid sintactic.");
        return;
    }

    if (!date.cale_galerie) {
        console.error("Eroare JSON Galerie: Lipseste proprietatea 'cale_galerie' din fisier.");
        return;
    }

    const caleGalerieAbsoluta = path.join(__dirname, date.cale_galerie);
    if (!fs.existsSync(caleGalerieAbsoluta)) {
        console.error(`Eroare FOLDER Galerie: Folderul specificat in 'cale_galerie' ("${date.cale_galerie}") nu exista in sistemul de fisiere la calea asteptata: ${caleGalerieAbsoluta}`);
    }

    if (date.imagini && Array.isArray(date.imagini)) {
        for (let imagine of date.imagini) {
            if (imagine.cale_relativa) {
                const caleImagineAbsoluta = path.join(caleGalerieAbsoluta, imagine.cale_relativa);
                if (!fs.existsSync(caleImagineAbsoluta)) {
                    console.error(`Eroare IMAGINE Galerie: Fisierul imagine "${imagine.cale_relativa}" declarat in json nu a putut fi gasit in sistemul de fisiere la calea: ${caleImagineAbsoluta}`);
                }
            }
        }
    }
}
verificaEroriGalerieJson();

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    let caleAbsMic=path.join(caleAbs, "mic");
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        let arr = imag.cale_relativa.split(".");
        let numeFis = arr[0];
        let ext = arr[1];

        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp").replace(/\\/g, '/');
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp").replace(/\\/g, '/');
        imag.fisier = path.join("/", caleGalerie, imag.cale_relativa).replace(/\\/g, '/');

    }
    // console.log(obGlobal.obImagini)
}
initImagini();

const sequences = {
    2: [[0,0], [0,1], [1,1], [1,0]],
    3: [[0,0], [0,1], [0,2], [1,2], [1,1], [1,0], [2,0], [2,1], [2,2]],
    4: [[0,0], [0,1], [0,2], [0,3], [1,3], [1,2], [1,1], [1,0], [2,0], [2,1], [2,2], [2,3], [3,3], [3,2], [3,1], [3,0]]
};

function compileazaScss(caleScss, caleCss, dateEjs = {}) {
   if (typeof caleCss === "object" && caleCss !== null) {
        dateEjs = caleCss;
        caleCss = null;
    }

    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        //E5.B4
        let numeFis = numeFisExt.substring(0, numeFisExt.length - path.extname(numeFisExt).length);
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);

    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    let numeFisCss = path.basename(caleCss);
    
    if (fs.existsSync(caleCss)) {
        //E5.B4
        let numeFaraExt = path.parse(numeFisCss).name;
        let extensie = path.parse(numeFisCss).ext;
        //E5.B3
        let numeFisBackup = `${numeFaraExt}_${new Date().getTime()}${extensie}`;
        
        try {
            fs.copyFileSync(caleCss, path.join(caleBackup, numeFisBackup));
        } catch (eroareCopiere) {
            console.error(`Eroare la salvarea în backup a fișierului ${caleCss}:`, eroareCopiere.message);
        }
    }

    try {
        let continutScss = fs.readFileSync(caleScss, "utf8");
        let scssRandat = ejs.render(continutScss, dateEjs);

        let rezCompilare = sass.compileString(scssRandat, {
            loadPaths: [obGlobal.folderScss]
        });

        fs.writeFileSync(caleCss, rezCompilare.css);
    } catch (eroareCompilare) {
        console.error(`Eroare la compilarea SCSS pentru ${caleScss}:`, eroareCompilare.message);
    }
}

let vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) === ".scss") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        
       if (numeFis === "galerie_animata_frag.scss") continue;

       if (numeFis === "galerie_animata.scss") {
            let secventa = sequences[3] || [[0,0], [0,1], [0,2], [1,2], [1,1], [1,0], [2,0], [2,1], [2,2]]; 
            let sassList = "(" + secventa.map(pos => `(${pos[0]}, ${pos[1]})`).join(", ") + ")";
            compileazaScss(caleCompleta, null, { n: 3, sassList: sassList });
        } else {
            compileazaScss(caleCompleta);
        }
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis) {
    if (eveniment === "change" || eveniment === "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        
        if (fs.existsSync(caleCompleta)) {
            if (path.extname(numeFis) === ".scss" && numeFis !== "galerie_animata_frag.scss") {
                if (numeFis === "galerie_animata.scss") {
                    let secventa = sequences[3] || [[0,0], [0,1], [0,2], [1,2], [1,1], [1,0], [2,0], [2,1], [2,2]]; 
                    let sassList = "(" + secventa.map(pos => `(${pos[0]}, ${pos[1]})`).join(", ") + ")";
                    compileazaScss(caleCompleta, null, { n: 3, sassList: sassList });
                } else {
                    compileazaScss(caleCompleta);
                }
            }
        }
    }
});

app.get("/galerie-animata.css", function(req, res) {
    let N_galerie = parseInt(req.query.n) || 9;
    let n = Math.sqrt(N_galerie);
    if (![2, 3, 4].includes(n)) n = 3;

    let secventa = sequences[n] || sequences[3];
    let sassList = "(" + secventa.map(pos => `(${pos[0]}, ${pos[1]})`).join(", ") + ")";

    let caleScss = path.join(obGlobal.folderScss, "galerie_animata.scss");
    let continutScss = fs.readFileSync(caleScss, "utf8");

    let scssRandat = ejs.render(continutScss, { n: n, sassList: sassList });

    try {
        let rezCompilare = sass.compileString(scssRandat, { loadPaths: [obGlobal.folderScss] });
        res.setHeader("Content-Type", "text/css");
        res.send(rezCompilare.css);
    } catch (err) {
        console.error("Eroare SASS:", err);
        res.status(500).send("");
    }
});

//E4.9 E4.10 E4.11
app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404)
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
                //console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

//E4.2.2 Obiectul express server asculta pe portul 8008
app.listen(8008);
console.log("Serverul a pornit");