# Soventory
WebApp inventaire for EPTM

## Backend sur Vercel

- Root Directory : `backend`
- Framework Preset : Express
- Node.js : `22.x`
- Build Command : `npm run build`
- Output Directory : laisser la configuration par defaut, sans override.
- Configurer les variables decrites dans `backend/.env.example` avant de redeployer.

Le point d'entree `backend/index.ts` doit importer Express directement pour
permettre sa detection par Vercel. Il monte l'API existante sans changer ses routes.
Les modules internes sont dans `backend/server`, pas dans le dossier reserve
`backend/api`, afin que Vercel ne cree pas une fonction par fichier TypeScript.

## Frontend sur Vercel

- Root Directory : `soventory_frontend`
- Framework Preset : Create React App
- Node.js : `22.x`
- Build Command : `CI=false npm run build`
- Output Directory : `build`
- Configurer `REACT_APP_API_URL` avec l'URL du backend, puis redeployer.

La commande Vercel conserve les avertissements ESLint existants sans les rendre
bloquants via le mode CI de Create React App. Les erreurs de compilation,
TypeScript et ESLint restent bloquantes. La commande locale reste `npm run build`.

## Diagnostic des imports

Les categories sont creees avant les equipements : leur presence ne confirme pas
la reussite de l'import. Un echec SQL d'insertion est journalise dans les Runtime
Logs du backend et signale comme un echec par la route d'import.
Les categories identiques sont resolues une seule fois par lot, avec un upsert
atomique qui reutilise leur identifiant si elles existent deja. Les valeurs sont
passees en parametres SQL (les apostrophes sont acceptees).

L'interface envoie des lots de 10 lignes et affiche le nombre de lignes ajoutees,
rejetees et leurs erreurs. Une ligne invalide ou un identifiant deja present
n'empeche pas l'ajout des lignes suivantes ; les equipements existants ne sont
pas ecrases. Une categorie peut rester creee meme si son equipement est rejete.
Les dates ISO ou JJ.MM.AAAA/JJ/MM/AAAA sont acceptees, ainsi que les prix a virgule.
Les identifiants a 5 chiffres et la conversion historique a 6 chiffres sont
conserves. Une valeur archive absente vaut 0 ; un etat detruit force archive a 1.

Vercel est configure pour 60 secondes par invocation, les requetes MySQL pour
5 secondes et les connexions pour 10 secondes. Le traitement cesse de demarrer
des requetes apres 40 secondes et signale les lignes restantes non importees.
En cas d'erreur reseau, l'interface arrete les lots suivants et invite a verifier
la base avant de reessayer : les lignes deja inserees ne sont pas annulees.
