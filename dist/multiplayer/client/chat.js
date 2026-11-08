import*as R from"three";const U=6,W=12e3,X=6e3,V=`
#mp-chat { position: fixed; left: 20px; bottom: calc(max(20px, env(safe-area-inset-bottom)) + 232px); z-index: 12;
  width: min(340px, 62vw); display: flex; flex-direction: column; gap: 5px; font: 500 13px/1.45 var(--text);
  pointer-events: none; }
#mp-chat[hidden] { display: none; }
.mp-log { display: flex; flex-direction: column; gap: 2px; }
.mp-line { width: fit-content; max-width: 100%; padding: 3px 8px; border-radius: 4px; overflow-wrap: anywhere;
  background: rgba(12, 14, 13, .55); color: #f2f0ea; text-shadow: 1px 1px 0 rgba(0, 0, 0, .5); transition: opacity .8s; }
.mp-line b { font-weight: 600; }
.mp-line.sys { color: #cbc8c0; font-size: 12px; padding: 2px 8px; }
.mp-line.fade { opacity: 0; }
.mp-hint { pointer-events: auto; justify-self: start; padding: 3px 10px; border: 0; border-radius: 4px; cursor: pointer;
  background: rgba(12, 14, 13, .55); color: #e8e6df; font: 500 12px/1.4 var(--text); }
.mp-hint.down { opacity: .55; cursor: default; }
.mp-field { pointer-events: auto; display: none; gap: 4px; }
#mp-chat.typing .mp-field { display: flex; }
#mp-chat.typing .mp-hint { display: none; }
.mp-field input { flex: 1; min-width: 0; padding: 7px 9px; border: 0; border-radius: 4px;
  background: var(--field); color: var(--ink); font: 500 13px/1.4 var(--text);
  box-shadow: 0 0 0 2px var(--line), inset 1px 1px 0 rgba(0, 0, 0, .15); }
.mp-field input:focus-visible { outline: 2px solid var(--gold); outline-offset: 1px; }
.mp-layer { position: fixed; inset: 0; z-index: 9; pointer-events: none; overflow: hidden; }
.mp-tag, .mp-bubble { position: absolute; left: 0; top: 0; will-change: transform; }
.mp-tag { padding: 2px 7px; border-radius: 4px; background: rgba(12, 14, 13, .6); color: #fff;
  font: 600 12px/1.3 var(--text); text-shadow: 1px 1px 0 rgba(0, 0, 0, .6); }
.mp-bubble { max-width: 230px; padding: 5px 9px; border-radius: 6px; background: var(--gui); color: var(--ink);
  font: 500 13px/1.4 var(--text); box-shadow: 0 0 0 2px var(--line); overflow-wrap: anywhere; }
.mp-bubble b { font-weight: 600; }
.mp-bubble::after { content: ""; position: absolute; left: 50%; top: 100%; margin-left: -5px;
  border: 5px solid transparent; border-top-color: var(--line); }
`;function q({onSend:_,selfId:g}){const h=document.createElement("style");h.textContent=V,document.head.append(h);const l=document.createElement("div");l.id="mp-chat",l.hidden=!0;const y=document.createElement("div");y.className="mp-layer";const f=document.createElement("div");f.className="mp-log";const p=document.createElement("button");p.className="mp-hint",p.type="button";const x=document.createElement("form");x.className="mp-field";const a=document.createElement("input");a.maxLength=120,a.placeholder="说点什么…",a.autocomplete="off",x.append(a),l.append(f,p,x),document.body.append(l,y);const r=new Map;let w=0,c=!1;function A(e,t){const n=setTimeout(()=>e.classList.add("fade"),t);return setTimeout(()=>e.remove(),t+900),n}function E(e,t=W){for(f.append(e);f.children.length>U;)f.firstElementChild.remove();A(e,t)}const k=(e,t)=>{const n=document.createElement("b");return n.textContent=e,n.style.color=`hsl(${t}, 62%, 70%)`,n};function D(e,t){const n=r.get(e),i=document.createElement("div");i.className="mp-line",i.append(k((n==null?void 0:n.name)||e,(n==null?void 0:n.hue)||0),` ${t}`),E(i)}function v(e){const t=document.createElement("div");t.className="mp-line sys",t.textContent=e,E(t,6e3)}function L(){p.textContent=c?`${w} 人在岛上 · 按 T 聊天`:"重连中…",p.classList.toggle("down",!c)}function I(e){w=e,L()}function K(e){c=e==="up",l.hidden=e==="offline",l.hidden||(L(),c&&v("连上了小岛"))}const b=[];function N(){l.classList.add("typing"),a.focus()}function T(){l.classList.remove("typing"),a.value="",a.blur()}p.addEventListener("click",()=>{c&&N()}),x.addEventListener("submit",e=>{e.preventDefault();const t=a.value.trim().slice(0,120);if(T(),!t)return;const n=Date.now();for(;b.length&&n-b[0]>1e4;)b.shift();if(b.length>=4){v("说得太快了，歇口气");return}b.push(n),_(t)}),a.addEventListener("keydown",e=>{e.key==="Escape"&&(e.stopPropagation(),T())}),addEventListener("keydown",e=>{l.hidden||document.activeElement===a||document.activeElement&&(document.activeElement.tagName==="INPUT"||document.activeElement.tagName==="TEXTAREA")||e.metaKey||e.ctrlKey||e.altKey||(e.key==="t"||e.key==="T"||e.key==="/")&&(e.preventDefault(),c&&N())},!0);function C(e,t,n){let i=r.get(e);if(!i){const s=document.createElement("div");s.className="mp-tag";const d=document.createElement("div");d.className="mp-bubble",d.style.visibility="hidden",y.append(s,d),i={tag:s,bubble:d,until:0,name:t,hue:n},r.set(e,i)}return i.name=t,i.hue=n,i.tag.textContent=t,i.tag.style.color=`hsl(${n}, 62%, 72%)`,i}function S(e){const t=r.get(e);t&&(t.tag.remove(),t.bubble.remove(),r.delete(e))}function j(){for(const[e,t]of r){if(e===g){t.tag.style.visibility="hidden",t.bubble.style.visibility="hidden";continue}t.tag.remove(),t.bubble.remove(),r.delete(e)}}function F(e,t){const n=r.get(e);n&&(n.bubble.replaceChildren(k(n.name,n.hue),` ${t}`),n.bubble.style.visibility="visible",n.until=performance.now()+X)}C(g,"",0);const u=new R.Vector3;function z(e,t,n,i,s,d,o,m){return u.set(t,n+d,i).applyMatrix4(s.matrixWorldInverse),u.z>-.3||(u.applyMatrix4(s.projectionMatrix),u.z>=1)?!1:(e.style.transform=`translate(${((u.x+1)/2*o).toFixed(1)}px, ${((1-(u.y+1)/2)*m).toFixed(1)}px) translate(-50%, -100%)`,!0)}function H(e,t,n){if(l.hidden)return;const i=innerWidth,s=innerHeight;for(const[d,o]of r){const m=n(d);if(!m){o.tag.style.visibility="hidden",o.bubble.style.visibility="hidden";continue}const $=m.x,B=m.y,M=m.z,P=o.until>e;z(o.tag,$,B,M,t,2.16,i,s)?o.tag.style.visibility="visible":o.tag.style.visibility="hidden",P&&z(o.bubble,$,B,M,t,o.tag.style.visibility==="visible"?2.62:2.2,i,s)?o.bubble.style.visibility="visible":o.bubble.style.visibility="hidden"}}return{line:D,system:v,presence:I,status:K,track:C,untrack:S,clear:j,sayBubble:F,update:H}}export{q as createChat};
