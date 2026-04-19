const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp= require("sharp");

const ejs=require('ejs');
const pg = require("pg");

//E4.2.1 Obiect express server creat
app = express();
app.set("view engine", "ejs")

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

// client=new Client({
//     database:"cti_2024",
//     user:"irina",
//     password:"irina",
//     host:"localhost",
//     port:5432
// })

// client.connect()


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
app.get(["/", "/index","/home"], function(req, res){
    res.render("pagini/index", {
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini
    });
});

//E4.9
app.get("/despre", function(req, res){
    res.render("pagini/despre");
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

// app.get("*/galerie-animata.css",function(req, res){

//     var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
//     var culori=["navy","black","purple","grey"];
//     var indiceAleator=Math.floor(Math.random()*culori.length);
//     var culoareAleatoare=culori[indiceAleator]; 
//     rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
//     console.log(rezScss);
//     var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
//     fs.writeFileSync(caleScss,rezScss);
//     try {
//         rezCompilare=sass.compile(caleScss,{sourceMap:true});

//         var caleCss=path.join(__dirname,"temp/galerie_animata.css");
//         fs.writeFileSync(caleCss,rezCompilare.css);
//         res.setHeader("Content-Type","text/css");
//         res.sendFile(caleCss);
//     }
//     catch (err){
//         console.log(err);
//         res.send("Eroare");
//     }
// });

// app.get("*/galerie-animata.css.map",function(req, res){
//     res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
// });

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split("."); //"ceva.png" -> ["ceva", "png"]
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" )
        imag.fisier=path.join("/", caleGalerie, imag.fisier )

    }
    // console.log(obGlobal.obImagini)
}
initImagini();


function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)

}


//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

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

//E4.2.2 Obiectul express server asculta pe portul 8080
app.listen(8080);
console.l