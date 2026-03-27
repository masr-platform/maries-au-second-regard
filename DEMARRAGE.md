# MARIÉS AU SECOND REGARD — Guide de démarrage

## Étapes pour mettre le site en ligne

### 1. Installer les dépendances
```bash
cd masr
npm install
```

### 2. Créer le fichier .env.local
Copiez `.env.example` en `.env.local` et remplissez :
- **DATABASE_URL** : depuis votre dashboard Supabase (Settings > Database)
- **NEXTAUTH_SECRET** : générez avec `openssl rand -base64 32`
- **OPENAI_API_KEY** : depuis platform.openai.com
- **STRIPE_SECRET_KEY** : depuis votre dashboard Stripe (déjà créé)
- **REDIS_URL** : depuis Upstash (gratuit pour démarrer)

### 3. Initialiser la base de données
```bash
npx prisma db push
npx prisma generate
```

### 4. Lancer en développement
```bash
npm run dev
# → http://localhost:3000
```

### 5. Déployer sur Vercel (production)
1. Créez un compte sur vercel.com
2. Importez le projet depuis GitHub
3. Ajoutez toutes les variables d'environnement
4. Vercel déploie automatiquement

---

## Services à créer (si pas déjà fait)

| Service | Lien | Coût |
|---------|------|------|
| Supabase (BDD) | supabase.com | Gratuit jusqu'à 500MB |
| Upstash (Redis) | upstash.com | Gratuit jusqu'à 10k req/j |
| OpenAI | platform.openai.com | ~$0.10/1000 matchings |
| Stripe | stripe.com | Déjà créé ✓ |
| Vercel | vercel.com | Gratuit (hobby) |

---

## Architecture des fichiers

```
masr/
├── prisma/schema.prisma          # Schéma base de données
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── (auth)/
│   │   │   ├── inscription/      # Formulaire d'inscription
│   │   │   └── connexion/        # Formulaire de connexion
│   │   ├── questionnaire/        # Questionnaire 7 sections
│   │   ├── tableau-de-bord/      # Espace utilisateur + matchs
│   │   ├── admin/                # Dashboard administrateur
│   │   └── api/
│   │       ├── auth/             # NextAuth
│   │       ├── users/            # Inscription
│   │       ├── questionnaire/    # Sauvegarde questionnaire
│   │       ├── matching/         # Moteur IA
│   │       ├── messages/         # Chat
│   │       ├── stripe/           # Paiements
│   │       └── admin/            # APIs admin
│   └── lib/
│       ├── ai-matching.ts        # Algorithme IA de matching
│       ├── supervision-chat.ts   # Supervision conversations
│       ├── auth.ts               # Configuration NextAuth
│       ├── prisma.ts             # Client base de données
│       └── redis.ts              # Cache Redis
└── .env.example                  # Variables d'environnement
```
