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
