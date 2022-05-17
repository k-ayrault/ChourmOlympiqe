//----------------------------------------------------------------------------------------------------------------------
//  Routes API
//----------------------------------------------------------------------------------------------------------------------
const START_API = "http://api.chourmolympique.fr/api/qsj/start";
const ESSAI_API = "http://api.chourmolympique.fr/api/qsj/essai";
const INDICE_API = "http://api.chourmolympique.fr/api/qsj/indice";
const JOUEUR_SAISI_API = "http://api.chourmolympique.fr/api/qsj/joueur_saisi";
const ABANDON_API = "http://api.chourmolympique.fr/api/qsj/abandon";

//----------------------------------------------------------------------------------------------------------------------
//  Clés réponses API
//----------------------------------------------------------------------------------------------------------------------
const ID_UTILISATEUR_REPONSE = "id_utilisateur";
const NBRE_CONTRATS_REPONSE = "nbre_contrats";
const BOOL_ERREUR_REPONSE = "error";
const MESSAGES_ERREURS_REPONSE = "messages";
const BOOL_RESULTAT_REPONSE = "gagne";
const BOOL_INDICES_REPONSE = "all_indice";
const INDEX_INDICE_REPONSE = "index_indice";
const INDICE_REPONSE = "indice";

//----------------------------------------------------------------------------------------------------------------------
//  Clés requête API
//----------------------------------------------------------------------------------------------------------------------
const ID_UTILISATEUR_REQUETE = "id_utilisateur";
const JOUEUR_ESSAI_REQUETE = "joueur_essai";
const INDEX_CONTRATS_REQUETE = "index_contrats";
const TEXTE_JOUEUR_SAISI_REQUETE = "texte_saisi";

//----------------------------------------------------------------------------------------------------------------------
//  Templates
//----------------------------------------------------------------------------------------------------------------------
let template_contrat_id = "template_contrat";
let id_contrat_base = "contrat_";
let template_joueur_id = "template_recherche_joueur";
let template_chargement_id = "template_chargement_partie";

//----------------------------------------------------------------------------------------------------------------------
//  Classes dans les templates correspondant aux valeurs à afficher pour un contrat
//----------------------------------------------------------------------------------------------------------------------
const DATES_TEMPLATE = "dates";
const IMG_CLUB_TEMPLATE = "img_club";
const NOM_CLUB_TEMPLATE = "nom_club";
const DETAILS_TEMPLATE = "details";

//----------------------------------------------------------------------------------------------------------------------
//  Classes dans les templates correspondant aux valeurs à afficher pour un joueur
//----------------------------------------------------------------------------------------------------------------------
const IMG_JOUEUR_TEMPLATE = "img_joueur";
const NOM_JOUEUR_TEMPLATE = "nom_joueur";

//----------------------------------------------------------------------------------------------------------------------
//  Table allant afficher les différents indices
//----------------------------------------------------------------------------------------------------------------------
let conteneur_contrats = document.getElementById("conteneur_contrats");

//----------------------------------------------------------------------------------------------------------------------
//  Table allant afficher les joueurs correspondants au texte de la recherche
//----------------------------------------------------------------------------------------------------------------------
let conteneur_joueurs = document.getElementById("conteneur_joueurs");

//----------------------------------------------------------------------------------------------------------------------
//  Restes
//----------------------------------------------------------------------------------------------------------------------
let img_mystere = '/Images/Jeux/QSJ/img_mystere.png';

//----------------------------------------------------------------------------------------------------------------------
//  Variables relatives à la partie
//----------------------------------------------------------------------------------------------------------------------
let id_utilisateur = "";
let nbre_contrats = 0;
let index_contrats = [];
let contrats = [];
let erreur = false;
let message_erreur = "";
let gagne = false;
let all_indice = false;

//----------------------------------------------------------------------------------------------------------------------
//  Modals
//----------------------------------------------------------------------------------------------------------------------
let modal_win = new bootstrap.Modal('#modal_win', {
    keyboard: false
});
let modal_lose = new bootstrap.Modal('#modal_lose', {
    keyboard: false
});
let modal_erreur = new bootstrap.Modal('#modal_erreur', {
    keyboard: false
});
let modal_abandon = new bootstrap.Modal('#modal_abandon', {
    keyboard: false
});

//----------------------------------------------------------------------------------------------------------------------
//  Début de la partie
//----------------------------------------------------------------------------------------------------------------------
chargementPartie();
document.addEventListener("DOMContentLoaded", () => {
    recherche_joueur.value = "";
    if (!id_utilisateur) {
        commencerJeu();
    } else {
        message_erreur = "Veuillez raffraichir la page s'il vous plaît !"
    }
});

//----------------------------------------------------------------------------------------------------------------------
//  Recherche du joueur
//----------------------------------------------------------------------------------------------------------------------
let recherche_joueur = document.getElementById("recherche_joueur");
recherche_joueur.addEventListener("keyup", remplitDataList)
recherche_joueur.addEventListener("keydown", remplitDataList)

//----------------------------------------------------------------------------------------------------------------------
//  Fonctions
//----------------------------------------------------------------------------------------------------------------------
//  Nombre de seconde du timer avant le prochain indice
const SECONDE_INDICE = 30;
let secondes = SECONDE_INDICE;
let secondes_avant_indice = document.getElementById("secondes_avant_indice");

/**
 * Commence une partie en faisant un appel à l'API pour en commencer une,
 * et affiche le premier indice, et commence le timer pour chaque nouvel indice
 */
function commencerJeu() {
    fetch(START_API).then((reponse) => reponse.json()).then((reponse) => {
        id_utilisateur = reponse[ID_UTILISATEUR_REPONSE];
        nbre_contrats = reponse[NBRE_CONTRATS_REPONSE];
        initialiseConteneursContrats(nbre_contrats);
        nouvelleIndice();
        setInterval(() => {
            if (!all_indice) {
                secondes--;
                secondes_avant_indice.innerText = secondes;
                if (secondes == 0) {
                    nouvelleIndice();
                    secondes = SECONDE_INDICE;
                }
            }
        }, 1000)
    });
}

/**
 * Ajoute 'nbre' de 'template_contrat' dans 'conteneur_contrats'
 * @param nbre : Nombre_de_contrats_du_joueur
 */
function initialiseConteneursContrats(nbre) {
    for (let i = 0; i < nbre; i++) {
        let template_contrat = document.getElementById(template_contrat_id);
        let template_contrat_clone = document.importNode(template_contrat.content, true);
        let tr = template_contrat_clone.querySelector('tr');
        tr.id = id_contrat_base + i;
        template_contrat_clone.querySelector('.' + DATES_TEMPLATE).innerText = "????-????";
        template_contrat_clone.querySelector('.' + IMG_CLUB_TEMPLATE).src = img_mystere;
        template_contrat_clone.querySelector('.' + IMG_CLUB_TEMPLATE).alt = "???";
        template_contrat_clone.querySelector('.' + NOM_CLUB_TEMPLATE).innerText = "???";
        template_contrat_clone.querySelector('.' + DETAILS_TEMPLATE).innerText = "???";
        conteneur_contrats.appendChild(template_contrat_clone);
    }
}

/**
 * Remplit le tableau correspondant à la liste des joueurs correspondants au texte recherché, par ces derniers
 */
function remplitDataList() {
    let texte_recherche = recherche_joueur.value;
    let data = new FormData();
    data.append(TEXTE_JOUEUR_SAISI_REQUETE, texte_recherche);
    fetch(JOUEUR_SAISI_API, {
        method: 'POST',
        body: data
    }).then((reponse) => reponse.json()).then((reponse) => {
        conteneur_joueurs.innerHTML = "";
        Object.entries(reponse).forEach(([index, joueur]) => {
            let template_joueur = document.getElementById(template_joueur_id);
            let template_joueur_clone = document.importNode(template_joueur.content, true);
            template_joueur_clone.querySelector('tr').dataset.id = joueur["id"];
            template_joueur_clone.querySelector('.' + NOM_JOUEUR_TEMPLATE).innerText = joueur["prenom"] + " " + joueur["nom"];
            template_joueur_clone.querySelector('.' + IMG_JOUEUR_TEMPLATE).src = joueur["photo"];
            conteneur_joueurs.appendChild(template_joueur_clone);
            conteneur_joueurs.lastElementChild.addEventListener("click", () => essaieJoueur(joueur["id"]))
        })
    });
}

/**
 *  Vérifie via un appel à l'API que le joueur testé ('id') est le bon,
 *  et trraite les informations selon la réponse de cette dernière
 * @param id : id_joueur_testé
 */
function essaieJoueur(id) {
    let data = new FormData();
    data.append(ID_UTILISATEUR_REQUETE, id_utilisateur);
    data.append(JOUEUR_ESSAI_REQUETE, id);
    fetch(ESSAI_API, {
        method: 'POST',
        body: data
    }).then((reponse) => reponse.json()).then((reponse) => {
        if (reponse[BOOL_ERREUR_REPONSE]) {
            message_erreur = reponse[MESSAGES_ERREURS_REPONSE];
            afficheErreur()
        } else {
            if (reponse[BOOL_RESULTAT_REPONSE]) {
                modal_win.toggle();
            } else {
                modal_lose.toggle();
            }
        }
    });
}

/**
 * Récupère un nouvelle indice en faisant un appel à l'API,
 * et traite les informations selon la réponse de cette dernière
 */
function nouvelleIndice() {
    let data = new FormData();
    data.append(ID_UTILISATEUR_REQUETE, id_utilisateur);
    data.append(INDEX_CONTRATS_REQUETE, JSON.stringify(index_contrats));
    fetch(INDICE_API, {
        method: 'POST',
        body: data
    }).then((reponse) => reponse.json()).then((reponse) => {
        if (reponse[BOOL_ERREUR_REPONSE]) {
            message_erreur = reponse[MESSAGES_ERREURS_REPONSE];
            afficheErreur();
        } else {
            all_indice = reponse[BOOL_INDICES_REPONSE]
            if (!all_indice) {
                index_contrats.push(reponse[INDEX_INDICE_REPONSE]);
                contrats.push(JSON.parse(reponse[INDICE_REPONSE]));
                afficheIndice();
            }

            if (index_contrats.length == 1) {
                partieChargee();
            }
        }
    })
}

/**
 * Affiche le dernier indice récupéré
 */
function afficheIndice() {
    let id = id_contrat_base + index_contrats[index_contrats.length - 1];
    let DOM_contrat = document.getElementById(id);
    let last_contrat = contrats[contrats.length - 1];
    let debut = new Date(last_contrat["debut"]).getFullYear();
    let fin = new Date(last_contrat["fin"]).getFullYear();
    DOM_contrat.querySelector('.' + DATES_TEMPLATE).innerText = debut + "-" + fin;
    DOM_contrat.querySelector('.' + IMG_CLUB_TEMPLATE).src = last_contrat["club"]["logo"];
    DOM_contrat.querySelector('.' + IMG_CLUB_TEMPLATE).alt = last_contrat["club"]["nom"];
    DOM_contrat.querySelector('.' + NOM_CLUB_TEMPLATE).innerText = last_contrat["club"]["nom"];
    DOM_contrat.querySelector('.' + DETAILS_TEMPLATE).innerText = last_contrat["detailTransfert"];
}

/**
 * Affiche un modal contenant le message de l'erreur
 */
function afficheErreur() {
    let DOM_message_erreur = document.getElementById("message_erreur");
    DOM_message_erreur.innerText = message_erreur;
    modal_erreur.toggle();
}

/**
 * Affiche une page de chargement
 */
function chargementPartie() {
    let template_chargement = document.getElementById(template_chargement_id);
    let template_chargement_clone = document.importNode(template_chargement.content, true);
    document.body.appendChild(template_chargement_clone);
    document.body.classList.add("body_chargement_partie");
}

/**
 * Supprime l'élément du DOM, qui affiche une page de chargement
 */
function partieChargee() {
    let DOM_element_chargement_partie = document.getElementById("chargement_partie");
    DOM_element_chargement_partie.parentElement.removeChild(DOM_element_chargement_partie);
    document.body.classList.remove("body_chargement_partie");
}

let btn_abandon = document.getElementById("btn_abandon");
btn_abandon.addEventListener("click", abandon);
function abandon() {
    let data = new FormData();
    data.append(ID_UTILISATEUR_REQUETE, id_utilisateur);
    fetch(ABANDON_API, {
        method:'POST',
        body:data
    }).then((reponse) => reponse.json()).then((reponse) => {
        let nom = reponse["prenom"] + " " + reponse["nom"];
        document.getElementById("nom_joueur_abandon").innerText = nom;
        document.getElementById("img_joueur_abandon").src = reponse["photo"];
        document.getElementById("img_joueur_abandon").alt = nom;
        modal_abandon.toggle();
    })

}