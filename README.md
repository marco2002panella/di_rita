# Pierluigi di Rita · Personal Trainer

Sito vetrina (HTML/CSS/JS statico) per Pierluigi di Rita, personal trainer a Ceccano, Palestra Zen Zero.
Il form di contatto invia un'email a `pierluigidirita@outlook.it` tramite un Cloudflare Worker e [Resend](https://resend.com).

```
public/               sito statico (index.html, styles.css, main.js)
src/worker.js         Worker: POST /api/contact (il resto è servito da public/)
wrangler.toml         configurazione Cloudflare Workers + asset statici
```

## Deploy su Cloudflare (Workers con asset statici)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** e scegli questo repository.
2. Impostazioni di build:
   - Build command: *(vuoto)*
   - Deploy command: `npx wrangler deploy` (il default)
   - Il nome del Worker deve essere `di-rita`, come in `wrangler.toml`.
3. **Settings → Variables and Secrets**, aggiungi:
   - `RESEND_API_KEY` come **Secret** (obbligatoria)
   - `TO_EMAIL` (opzionale, default `pierluigidirita@outlook.it`)
   - `FROM_EMAIL` (opzionale, vedi sotto)
4. Rifai il deploy dopo aver aggiunto le variabili.

### Email con Resend

1. Crea un account su [resend.com](https://resend.com) **usando `pierluigidirita@outlook.it`** e genera una API key.
2. Senza un dominio verificato, Resend consente di inviare solo all'indirizzo con cui è registrato l'account: con il mittente di prova `onboarding@resend.dev` (default) le richieste arrivano quindi direttamente a Pierluigi.
3. Quando ci sarà un dominio proprio, verificalo su Resend e imposta `FROM_EMAIL`, ad esempio `Sito Pierluigi <contatti@tuodominio.it>`.

Le richieste contengono nome, recapito, obiettivo e messaggio. Se il recapito è un indirizzo email, viene impostato come `Reply-To`, così basta rispondere alla mail. Il campo nascosto `website` funge da trappola per i bot.

## Sviluppo locale

Con Node.js installato:

```bash
npx wrangler dev
```

Per provare l'invio reale crea un file `.dev.vars` (vedi `.dev.vars.example`).
Senza Node basta servire la cartella `public/` con un qualsiasi server statico: il form mostrerà un errore perché `/api/contact` non esiste.

## Da completare

- Foto di Pierluigi (non usata al momento: l'hero mostra l'illustrazione a icone).
- Dominio personalizzato, Instagram, P.IVA e privacy policy quando disponibili.
