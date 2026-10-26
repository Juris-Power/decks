import{a as s,j as c}from"./vendor-framer-C8Iu_Nti.js";import{g as i,c as l,p as r,s as a,w as t,f as n,n as m}from"./deck-CMzgpwhv.js";import{n as e,r as w}from"./PresentationShell-BdcyEibh.js";const y={largeur:m(2e3),hauteur:m(1125)},I=n`
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
`,T=n`
  box-sizing: border-box;
  border: var(--border-thin) solid ${t(e.accent,.32)};
  border-radius: ${w.md};
  background:
    linear-gradient(${e.verreClair}, ${e.verreBas}),
    ${t(e.fond,.9)};
  backdrop-filter: blur(${r(10)});
  box-shadow: ${a(`0 16px 40px ${t(e.ombrePortee,.5)}`)};
`;n`
  border-color: ${e.accent};
  box-shadow: ${a(`0 0 0 1px ${t(e.accent,.45)}, 0 0 36px ${t(e.accent,.35)}, 0 16px 40px ${t(e.ombrePortee,.5)}`)};
`;const z=n`
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
    border: var(--border-thin) solid ${t(e.accent,.42)};
    background:
      radial-gradient(circle at 30% 25%, ${e.reflet}, transparent 60%),
      linear-gradient(${e.verre}, ${e.verre});
    box-shadow: ${a(`0 0 22px ${t(e.accent,.16)}`)};
  }

  svg {
    position: relative;
    width: 46%;
    height: 46%;
    overflow: visible;
  }
`,P=n`
  text-shadow:
    0 0 ${r(30)} ${t(e.accent,.5)},
    0 0 ${r(64)} ${t(e.accent,.18)};
`,q=i.p.withConfig({displayName:"pitchstyles__Surtitre",componentId:"sc-ysby63-0"})(["margin:0;font-size:",";font-weight:700;line-height:1.7;letter-spacing:0.22em;text-transform:uppercase;white-space:pre-line;color:",";"],r(22),e.accent),S=i.h2.withConfig({displayName:"pitchstyles__TitreDePlanche",componentId:"sc-ysby63-1"})(["margin:0;font-size:",";font-weight:900;line-height:1.02;letter-spacing:-0.02em;text-transform:uppercase;color:",";"],r(64),e.encre),j=i.span.withConfig({displayName:"pitchstyles__Accent",componentId:"sc-ysby63-2"})(["color:",";background-image:linear-gradient(135deg,"," 0%,"," 100%);-webkit-background-clip:text;background-clip:text;padding-block:0.15em;@supports (-webkit-background-clip:text) or (background-clip:text){color:transparent;}"],l.primaryCyan,l.primary,l.primaryCyan),A=i.p.withConfig({displayName:"pitchstyles__Chapeau",componentId:"sc-ysby63-3"})(["margin:0;font-size:",";font-weight:500;line-height:1.4;color:",";"],r(30),e.encreDouce);i.p.withConfig({displayName:"pitchstyles__Legende",componentId:"sc-ysby63-4"})(["margin:0;font-size:",";line-height:1.4;color:",";"],r(19),e.encreDouce);const F=i.span.withConfig({displayName:"pitchstyles__FiletDeSignature",componentId:"sc-ysby63-5"})(["display:block;width:",";height:",";border-radius:",";background:",";box-shadow:",";transform-origin:left center;"],r(320),r(4),w.none,e.signature,a(`0 0 18px ${t(e.accent,.45)}`)),R=i.svg.attrs({viewBox:"0 0 2000 1125","aria-hidden":!0,focusable:!1}).withConfig({displayName:"pitchstyles__Calque",componentId:"sc-ysby63-6"})(["position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;"]),$=i.section.withConfig({displayName:"ToileDePlanche__Nuit",componentId:"sc-13qzr6k-0"})(["position:relative;width:100%;height:var(--hauteur-ecran,100dvh);overflow:hidden;isolation:isolate;color:",";background:radial-gradient(120% 90% at 50% 42%,",",transparent 62%),",";user-select:none;"],e.encre,t(e.marque,.1),e.fondDegrade),_=i.div.withConfig({displayName:"ToileDePlanche__Fond",componentId:"sc-13qzr6k-1"})(["position:absolute;inset:0;pointer-events:none;"]),k=i.div.withConfig({displayName:"ToileDePlanche__Toile",componentId:"sc-13qzr6k-2"})(["position:absolute;left:50%;top:50%;width:",";height:",";transform-origin:center center;transform:translate(-50%,-50%);text-wrap:pretty;& h1,& h2,& h3{text-wrap:balance;}"],r(2e3),r(1125));function E({etiquette:v,fond:d,children:x}){const p=s.useRef(null),h=s.useRef(null);return s.useLayoutEffect(()=>{const o=p.current,u=h.current;if(!o||!u)return;const g=()=>{const f=Math.min(o.clientWidth/y.largeur,o.clientHeight/y.hauteur);f>0&&(u.style.transform=`translate(-50%, -50%) scale(${f})`)};g();const b=new ResizeObserver(g);return b.observe(o),()=>b.disconnect()},[]),c.jsxs($,{ref:p,"aria-label":v,children:[d&&c.jsx(_,{"aria-hidden":"true",children:d}),c.jsx(k,{ref:h,children:x})]})}export{j as A,A as C,F,q as S,E as T,R as a,S as b,z as d,P as l,I as p,T as v};
