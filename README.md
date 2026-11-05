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
