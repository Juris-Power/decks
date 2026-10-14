# Images landing

## Versions WebP disponibles

Pour chaque PNG > 500 KB, une version `.webp` à 85% de qualité existe :

| Image | PNG | WebP | Économie |
|-------|-----|------|----------|
| hero | 1.2 MB | 58 KB | 95% |
| banner | 957 KB | 42 KB | 96% |
| consultation-tips | 1.7 MB | 125 KB | 93% |
| testimonials | 830 KB | 31 KB | 96% |
| avocatPC | 1.2 MB | 58 KB | 95% |
| hero-lawyer (../lawyers/) | 1.2 MB | 58 KB | 95% |

**Total** : ~7 MB → ~370 KB (-95%)

## Usage recommandé

WebP est supporté par 96% des navigateurs (Chrome 23+, Firefox 65+, Safari 14+).

Préférer la version `.webp` dans :

- **CMS** : remplacer l'URL `.png` par `.webp` dans le panneau admin
- **Code applicatif** : utiliser `<picture>` avec fallback PNG :

```html
<picture>
  <source srcset="/images/landing/hero.webp" type="image/webp" />
  <img src="/images/landing/hero.png" alt="..." loading="lazy" />
</picture>
```

## Régénération

Pour ajouter une nouvelle image > 500 KB :

```bash
cwebp -q 85 input.png -o input.webp
```

Tooling : `brew install webp` (macOS).
