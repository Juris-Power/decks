# Olm 3.2.15 — la bibliothèque de chiffrement de bout en bout que lib-jitsi-meet attend

**Origine** : paquet npm `@matrix-org/olm@3.2.15` (source :
https://gitlab.matrix.org/matrix-org/olm/-/tree/3.2.15), licence **Apache-2.0**.
C'est la version qu'embarque Jitsi Meet. Sommes SHA-256 du paquet publié :

```
cf9a793bcbad919967d79e7f2bf52e0492b646332d36ee7e1c2d1b0ff47b3c40  olm.js
3fc8dbfe8f44d550b1c9165e6c2af33323aaeba0a5ec223cef74959dd434642b  olm.wasm
```

Contrôle : `shasum -a 256 olm.js olm.wasm` dans ce dossier.

**Pourquoi ici et pas dans `package.json`** (2026-09-17). La bibliothèque
lib-jitsi-meet servie par notre serveur décide du chiffrement natif sur une
seule question — `isSupported(){ return void 0 !== window.Olm }` — et notre
serveur Jitsi ne sert pas `olm.js` en fichier séparé (`/olm.js` y répond l'index
de l'application ; seul `/libs/olm.wasm` est un vrai fichier). Le script
s'expose lui-même en global (`window.Olm`) quand il est chargé par une balise
`<script>`, et va chercher `olm.wasm` à côté de lui : deux fichiers servis
tels quels par le front suffisent, sans dépendance, sans reconstruction du
conteneur, sans toucher au verrou npm partagé par douze sessions. Olm est figé
en amont (3.2.15 est la dernière) : rien à mettre à jour.

Chargé par `front/src/shared/lib/jitsi/olm.ts`, après lib-jitsi-meet, AVANT
toute conférence — sinon la bibliothèque tranche « non supporté » à la
création et la consultation part sans clé par participant.
