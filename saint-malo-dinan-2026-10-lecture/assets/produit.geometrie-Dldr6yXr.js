import{a as l,j as p}from"./vendor-framer-C8Iu_Nti.js";import{g as o,c as f,p as n,s as b,w as a,f as u,n as $}from"./deck-BchvNLYJ.js";import{n as e,r as I}from"./PresentationShell-DngZvYpv.js";const E={largeur:$(2e3),hauteur:$(1125)},L=u`
  font-family:
    "OverpassBold",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  font-weight: 700;
`,j=u`
  box-sizing: border-box;
  border: var(--border-thin) solid ${a(e.accent,.32)};
  border-radius: ${I.md};
  background:
    linear-gradient(${e.verreClair}, ${e.verreBas}),
    ${a(e.fond,.9)};
  backdrop-filter: blur(${n(10)});
  box-shadow: ${b(`0 16px 40px ${a(e.ombrePortee,.5)}`)};
`,z=u`
  border-color: ${e.accent};
  box-shadow: ${b(`0 0 0 1px ${a(e.accent,.45)}, 0 0 36px ${a(e.accent,.35)}, 0 16px 40px ${a(e.ombrePortee,.5)}`)};
`,F=u`
  position: relative;
  display: grid;
  place-items: center;
  width: var(--taille);
  height: var(--taille);
  border-radius: calc(var(--taille) / 2);
  background: ${e.fond};
  color: ${e.accent};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: var(--border-thin) solid ${a(e.accent,.42)};
    background:
      radial-gradient(circle at 30% 25%, ${e.reflet}, transparent 60%),
      linear-gradient(${e.verre}, ${e.verre});
    box-shadow: ${b(`0 0 22px ${a(e.accent,.16)}`)};
  }

  svg {
    position: relative;
    width: 46%;
    height: 46%;
    overflow: visible;
  }
`,U=u`
  text-shadow:
    0 0 ${n(30)} ${a(e.accent,.5)},
    0 0 ${n(64)} ${a(e.accent,.18)};
`,H=o.p.withConfig({displayName:"pitchstyles__Surtitre",componentId:"sc-ysby63-0"})(["margin:0;font-size:",";font-weight:700;line-height:1.7;letter-spacing:0.22em;text-transform:uppercase;white-space:pre-line;color:",";"],n(22),e.accent),M=o.h2.withConfig({displayName:"pitchstyles__TitreDePlanche",componentId:"sc-ysby63-1"})(["margin:0;font-size:",";font-weight:900;line-height:1.02;letter-spacing:-0.02em;text-transform:uppercase;color:",";"],n(64),e.encre),B=o.span.withConfig({displayName:"pitchstyles__Accent",componentId:"sc-ysby63-2"})(["color:",";background-image:linear-gradient(135deg,"," 0%,"," 100%);-webkit-background-clip:text;background-clip:text;padding-block:0.15em;@supports (-webkit-background-clip:text) or (background-clip:text){color:transparent;}"],f.primaryCyan,f.primary,f.primaryCyan),V=o.p.withConfig({displayName:"pitchstyles__Chapeau",componentId:"sc-ysby63-3"})(["margin:0;font-size:",";font-weight:500;line-height:1.4;color:",";"],n(30),e.encreDouce);o.p.withConfig({displayName:"pitchstyles__Legende",componentId:"sc-ysby63-4"})(["margin:0;font-size:",";line-height:1.4;color:",";"],n(19),e.encreDouce);const G=o.span.withConfig({displayName:"pitchstyles__FiletDeSignature",componentId:"sc-ysby63-5"})(["display:block;width:",";height:",";border-radius:",";background:",";box-shadow:",";transform-origin:left center;"],n(320),n(4),I.none,e.signature,b(`0 0 18px ${a(e.accent,.45)}`)),W=o.svg.attrs({viewBox:"0 0 2000 1125","aria-hidden":!0,focusable:!1}).withConfig({displayName:"pitchstyles__Calque",componentId:"sc-ysby63-6"})(["position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;"]),T=l.createContext(null),k=o.section.withConfig({displayName:"ToileDePlanche__Nuit",componentId:"sc-13qzr6k-0"})(["position:relative;width:100%;height:var(--hauteur-ecran,100dvh);overflow:hidden;isolation:isolate;color:",";background:radial-gradient(120% 90% at 50% 42%,",",transparent 62%),",";user-select:none;"],e.encre,a(e.marque,.1),e.fondDegrade),P=o.div.withConfig({displayName:"ToileDePlanche__Fond",componentId:"sc-13qzr6k-1"})(["position:absolute;inset:0;pointer-events:none;"]),A=o.div.withConfig({displayName:"ToileDePlanche__Toile",componentId:"sc-13qzr6k-2"})(["position:absolute;left:50%;top:50%;width:",";height:",";transform-origin:center center;transform:translate(-50%,-50%);text-wrap:pretty;& h1,& h2,& h3{text-wrap:balance;}& :where(img,video,iframe,embed,object,canvas,svg){max-width:none;}"],n(2e3),n(1125)),q=o.div.withConfig({displayName:"ToileDePlanche__Calque",componentId:"sc-13qzr6k-3"})(["position:absolute;inset:0;"]);function X({etiquette:t,fond:r,children:m}){const h=l.useRef(null),i=l.useRef(null),y=l.useContext(T);return l.useLayoutEffect(()=>{const d=h.current,x=i.current;if(!d||!x)return;const w=()=>{const C=Math.min(d.clientWidth/E.largeur,d.clientHeight/E.hauteur);C>0&&(x.style.transform=`translate(-50%, -50%) scale(${C})`)};w();const v=new ResizeObserver(w);return v.observe(d),()=>v.disconnect()},[]),p.jsxs(k,{ref:h,"aria-label":t,children:[r&&p.jsx(P,{"aria-hidden":"true",children:r}),p.jsxs(A,{ref:i,"data-toile":"",children:[m,y&&p.jsx(q,{children:y})]})]})}const s={largeur:390,hauteur:844},Y=(()=>{const i=Math.round(282*s.hauteur/s.largeur);return{x:130,y:262,bord:14,largeurEcran:282,hauteurEcran:i,largeur:310,hauteur:i+28}})(),g=(()=>{const i=Math.round(625);return{x:520,y:250,barre:46,largeurEcran:1e3,hauteurEcran:i,largeur:1e3,hauteur:i+46}})(),J={x:g.x+g.largeur+70,y:300,largeur:2e3-(g.x+g.largeur+70)-90,pas:156},K={rotationY:-18,rotationX:6,perspective:1400};function Q(t,r){return{left:`${(-r.x/r.largeur*100).toFixed(3)}%`,top:`${(-r.y/r.hauteur*100).toFixed(3)}%`,width:`${(t.largeur/r.largeur*100).toFixed(3)}%`,height:`${(t.hauteur/r.hauteur*100).toFixed(3)}%`}}function Z(t,r){return{x:(t.x-r.x)/r.largeur,y:(t.y-r.y)/r.hauteur,largeur:t.largeur/r.largeur,hauteur:t.hauteur/r.hauteur}}const c=t=>({x:0,y:0,...t}),_={largeur:850,hauteur:531},N={largeur:544,hauteur:340},D={largeur:640,hauteur:400},ee={preparation:{capture:s,cadre:c(s),projecteur:{x:14,y:572,largeur:362,hauteur:206}},compteRendu:{capture:_,cadre:c(_),projecteur:{x:189,y:185,largeur:645,hauteur:335}},facture:{capture:N,cadre:c(N),projecteur:{x:16,y:136,largeur:512,hauteur:86}},dossierAvocat:{capture:D,cadre:c(D),projecteur:{x:6,y:52,largeur:622,hauteur:94}},dossierClient:{capture:s,cadre:c(s),projecteur:{x:13,y:166,largeur:364,hauteur:288}}};export{B as A,V as C,ee as E,G as F,K as I,J as L,g as P,H as S,X as T,W as a,M as b,Y as c,F as d,Z as e,Q as f,T as g,z as h,U as l,L as p,j as v};
