# Assets wake word souverain « Hey Juris » (on-device, V4)

Le moteur `useWakeWord` charge **au runtime** (uniquement si l'avocat active l'opt-in)
les assets ci-dessous, servis depuis `/wake/` (self-hosted, 100 % souverain — aucun
CDN, aucun cloud, aucune dépendance npm donc aucun impact sur le lockfile).

Tant que ces fichiers ne sont pas déployés, le toggle « Hey Juris » s'affiche
**honnêtement « indisponible »** (le moteur ne prétend jamais écouter) — ce n'est
PAS une façade, juste l'attente de l'asset modèle.

## Fichiers attendus dans ce dossier

| Fichier | Rôle | Source |
|---------|------|--------|
| `ort.web.mjs` | Runtime onnxruntime-web (WASM) self-hosté | `node_modules/onnxruntime-web/dist/ort.web.min.mjs` (copier) + ses `.wasm` |
| `melspectrogram.onnx` | Audio 16 kHz → mel (openWakeWord) | [openWakeWord releases](https://github.com/dscripka/openWakeWord) |
| `embedding.onnx` | mel → embedding (openWakeWord) | idem |
| `hey_juris.onnx` | embedding → score « Hey Juris » | **à entraîner** (cf. ci-dessous) |

> Les `.wasm` d'onnxruntime-web doivent être copiés à côté de `ort.web.mjs` (le
> runtime les fetch en relatif). Vérifier la version ort vs. l'export des modèles.

## Entraîner le modèle custom « Hey Juris »

openWakeWord fournit un pipeline d'entraînement de modèle custom **sans enregistrer
de voix réelle** (TTS synthétique + augmentation) :

**TURNKEY** : `scripts/train-hey-juris-wakeword.py` (driver openWakeWord prêt à
l'emploi, phrase « hey juris » pré-configurée). À exécuter sur **GPU (Google Colab
gratuit)** — pas sur un Mac dev (pas de GPU + négatifs de plusieurs Go). Étapes Colab
copier-coller dans l'en-tête du script. ~30-60 min → produit `hey_juris.onnx`.

1. Ouvrir le script → suivre les cellules Colab (clone openWakeWord + piper-sample-generator,
   télécharger les négatifs, `python scripts/train-hey-juris-wakeword.py`).
2. Récupérer `hey_juris.onnx` → le déposer ici (`front/public/wake/`).
3. **Réactiver le toggle** « Hey Juris » (retirer `disabled` dans `LawyerSettingsGeneralPage`).
4. QA synthétique (sans micro) : `python scripts/wake-pipeline-qa.py front/public/wake/hey_juris.onnx clip.wav`.
5. Calibrer `DEFAULT_WAKE_THRESHOLD` (`wakeWordDecision.ts`) selon les faux-positifs mesurés on-device.

## Pourquoi ce choix (décision D3)

- **openWakeWord** (Apache-2.0) : 100 % on-device (ONNX), 0 cloud, 0 compte, 0
  télémétrie. Rejeté : **Porcupine/Picovoice** (AccessKey + validation licence
  réseau = non pleinement souverain) et **Web Speech API** (audio → Google, banni V1).
- Assets self-hostés (pas de dépendance npm) → aucun risque sur le lockfile partagé.

Détail : `documentation/roadmap/juris-ia-commande-vocale/02-architecture-decisions.md` (D3).

## Setup + état des lieux (validation locale 2026-06-28)

**Fetch automatique des assets de base** (ort runtime + modèles génériques) :
```bash
bash scripts/setup-wake-assets.sh
```
→ dépose `ort.web.mjs` + `ort-wasm-*` + `melspectrogram.onnx` + `embedding.onnx` ici
(gitignorés). Reste à fournir `hey_juris.onnx` (entraînement ci-dessus).

**Validé en local** :
- ✅ Les 3 modèles ONNX (melspec/embedding/classifieur) se chargent et **s'enchaînent**
  (tenseurs valides bout-en-bout, embeddings non-dégénérés) — vérifié via onnxruntime
  Python sur des échantillons réels.

**⚠️ NON validé (frontière honnête)** :
- La **détection** n'est PAS encore prouvée : sur un vrai positif (`alexa_test.wav` +
  modèle alexa), le score reste ~0 → la **recette exacte de preprocessing openWakeWord**
  (fenêtrage/normalisation mel/échelle) doit être calée 1:1 avec la référence
  openWakeWord. Le même écart s'applique à `useWakeWord.ts` (JS) tant que la recette
  n'est pas figée. À finaliser avec : modèle « Hey Juris » entraîné + **QA on-device**
  (micro réel) + alignement sur le code openWakeWord de référence.
- Le runtime ort **navigateur** (chargement wasm self-hosté) n'est pas testable hors
  navigateur — à valider en QA front.

Tant que ces points ne sont pas verts, le toggle « Hey Juris » reste **« indisponible »
honnête** (aucune fausse écoute, règle 53).
