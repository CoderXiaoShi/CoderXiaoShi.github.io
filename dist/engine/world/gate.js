import*as r from"three";const v=1/16,N=matchMedia("(prefers-reduced-motion: reduce)").matches,g=1.2,c=.82,p=1.38,q=.28,C=q/2,w={a:"#1d5aa8",b:"#48a2e0",c:"#b2e3fa",white:"#f2faff",rim:"#cdeeff",halo:"#6cbcf0",ground:"#5aaee4"},O=.9,P=.5,B=.6,k=.55,K=[c+.7,p+.7],Y=`
  vec3 look(float r, float a) {
    float phase = a * 2.0 + log(max(r, 0.055)) * 5.4 + uSpin;
    float flow = 0.5 + 0.5 * sin(phase);
    float arms = smoothstep(0.62, 0.98, flow);
    vec3 col = mix(uA, uB, flow * 0.8);
    col = mix(col, uC, arms * (0.4 + 0.25 * (1.0 - r)));
    // Receding ripples and a dark vanishing point give the light somewhere
    // to lead, rather than a white spot painted on a solid object.
    float ripple = pow(0.5 + 0.5 * sin(r * 35.0 + log(max(r, 0.055)) * 3.0 + uTime * 1.9), 8.0);
    col += uB * ripple * 0.1 * (1.0 - smoothstep(0.25, 1.0, r));
    col = mix(uA * 0.45, col, smoothstep(0.04, 0.25, r));
    col = mix(col, uWhite, arms * (1.0 - smoothstep(0.1, 0.4, r)) * uCharge * 0.45);
    return col;
  }`,_=`
#define CELL ${v}
#define OY ${g}
#define RX ${c}
#define RY ${p}
#define HZ ${C}
#define SINK ${B}
#define LEAN ${k}
uniform float uTime, uSpin, uFlow, uNear, uCharge;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
// Distance to the oval's edge in metres, near enough (its value over its
// slope): positive inside.
float ovalEdge(vec2 p, vec2 radius) {
  vec2 q = (p - vec2(0.0, OY)) / radius;
  float r = max(length(q), 1e-4);
  return (1.0 - r) * r / max(length(q / radius), 1e-4);
}
float edgeDist(vec2 p) { return ovalEdge(p, vec2(RX, RY)); }`,M=`
vec3 cameraLocal() {
  vec3 toCamera = cameraPosition - modelMatrix[3].xyz;
  return vec3(dot(toCamera, modelMatrix[0].xyz), dot(toCamera, modelMatrix[1].xyz), dot(toCamera, modelMatrix[2].xyz));
}`,T=`
#define OY ${g}
#define BACK 0.9
attribute float aKind;
varying float vKind;
varying vec3 vLocal, vCamera;
#include <fog_pars_vertex>
${M}
void main() {
  vCamera = cameraLocal();
  vec3 local = position;
  if (aKind < 0.5) {
    // The halo is one card turned to face the camera, so its light hugs the
    // oval's outline the same way from every side. It stands behind the
    // lens (BACK is more than the lens reaches towards any side), so the
    // lens hides whatever glow falls on its own pixels. It grows with how
    // much bigger the lens's near edge looks than the card.
    vec3 centre = vec3(0.0, OY, 0.0), toEye = vCamera - centre;
    float far = length(toEye);
    vec3 view = toEye / far, right = cross(vec3(0.0, 1.0, 0.0), view);
    right = dot(right, right) < 1e-6 ? vec3(1.0, 0.0, 0.0) : normalize(right);
    local = centre - view * BACK + (right * position.x + cross(view, right) * position.y) * (far + BACK) / max(far - BACK, 0.5);
  }
  vLocal = local;
  vKind = aKind;
  vec4 mvPosition = modelViewMatrix * vec4(local, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,D=`
attribute float aSide;
varying vec3 vLocal, vCamera;
varying float vSide;
#include <fog_pars_vertex>
${M}
void main() {
  vLocal = position;
  vCamera = cameraLocal();
  vSide = aSide;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;function $(){const u=[],s=[],d=(n,l)=>{const[o,t,a,i]=n;for(const m of[o,t,a,o,a,i])u.push(...m),s.push(l)},A=(n,l)=>{const o=n/c,t=(l-g)/p,a=Math.max(Math.hypot(o,t),1e-4);return(1-a)*a/Math.max(Math.hypot(o/c,t/p),1e-4)},f=(n,l)=>{if(l<0)return!1;const o=(l+.5)*v;return o>=0&&A((n+.5)*v,o)>0},e=(n,l,o)=>{const t=n/c,a=(l-g)/p;return[n,l,o*C*Math.sqrt(Math.max(0,1-t*t-a*a))]},b=Math.floor(-c/v)-1,S=Math.ceil(c/v)+1,x=Math.ceil((g+p)/v)+1;for(let n=0;n<x;n++)for(let l=b;l<S;l++){if(!f(l,n))continue;const o=l*v,t=n*v,a=o+v,i=t+v;d([e(o,t,1),e(a,t,1),e(a,i,1),e(o,i,1)],0),d([e(a,t,-1),e(o,t,-1),e(o,i,-1),e(a,i,-1)],0),f(l-1,n)||d([e(o,t,-1),e(o,t,1),e(o,i,1),e(o,i,-1)],1),f(l+1,n)||d([e(a,t,1),e(a,t,-1),e(a,i,-1),e(a,i,1)],1),!f(l,n-1)&&t>0&&d([e(o,t,1),e(a,t,1),e(a,t,-1),e(o,t,-1)],1),f(l,n+1)||d([e(o,i,-1),e(a,i,-1),e(a,i,1),e(o,i,1)],1)}const h=new r.BufferGeometry;return h.setAttribute("position",new r.Float32BufferAttribute(u,3)),h.setAttribute("aSide",new r.Float32BufferAttribute(s,1)),h}function X(){const u=i=>new r.Color(i),s={...r.UniformsUtils.clone(r.UniformsLib.fog),uTime:{value:0},uSpin:{value:0},uFlow:{value:0},uNear:{value:0},uCharge:{value:0},uShow:{value:0},uPreview:{value:null},uFit:{value:new r.Vector4(1,1,0,0)},uA:{value:u(w.a)},uB:{value:u(w.b)},uC:{value:u(w.c)},uWhite:{value:u(w.white)},uRim:{value:u(w.rim)},uHalo:{value:u(w.halo)},uGround:{value:u(w.ground)}},d=new r.Group,A=g+p,f=new r.Mesh($(),new r.ShaderMaterial({uniforms:s,fog:!0,side:r.DoubleSide,vertexShader:D,fragmentShader:`${_}
      uniform vec3 uA, uB, uC, uWhite, uRim;
      uniform float uShow;
      uniform sampler2D uPreview;
      uniform vec4 uFit;
      varying vec3 vLocal, vCamera;
      varying float vSide;
      #include <fog_pars_fragment>
      ${Y}
      void main() {
        vec3 col;
        if (vSide > 0.5) {
          float flow = 0.5 + 0.5 * sin(vLocal.y * 7.0 + vLocal.z * 12.0 - uFlow);
          col = mix(uB, uRim, 0.35 + 0.45 * flow);
        } else {
          vec2 p = (floor(vLocal.xy / CELL) + 0.5) * CELL;
          float inside = edgeDist(p) / CELL;
          if (inside < 0.0 || p.y < 0.0) discard;
          vec2 q = (p - vec2(0.0, OY)) / vec2(RX, RY);
          // The swirl lines a cone sunk behind the face. Follow the view ray
          // from this texel down to it: as you walk round, the eye leans
          // towards you and the far wall opens up, like looking into a hole.
          // One ray per texel keeps the pixels whole; below LEAN = 1 the
          // pattern never folds over itself.
          float face = vCamera.z < 0.0 ? -1.0 : 1.0;
          vec3 ray = vec3(p, face * HZ * sqrt(max(0.0, 1.0 - dot(q, q)))) - vCamera;
          vec2 lean = ray.xy / max(-face * ray.z, 1e-3) * SINK / vec2(RX, RY);
          lean *= LEAN / sqrt(LEAN * LEAN + dot(lean, lean));
          vec2 sunk = q + lean * (1.0 - min(length(q), 1.0));
          col = look(length(sunk), atan(sunk.y, sunk.x));
          if (uShow > 0.001) {
            vec2 uv = vec2(p.x / (2.0 * RX) + 0.5, (p.y - OY + RY) / (2.0 * RY));
            col = mix(col, texture2D(uPreview, uv * uFit.xy + uFit.zw).rgb, uShow * smoothstep(2.0, 6.0, inside));
          }
          float rim = (1.0 - smoothstep(0.0, 1.6, inside))
            * (0.55 + 0.2 * sin(atan(q.y, q.x) * 5.0 - uTime * 1.5));
          col = mix(col, uRim, rim);
        }
        col *= 1.0 + 0.1 * uNear + 0.25 * uCharge;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`}));f.name="portal-vortex",d.add(f);const e=[],b=[],S=(i,m)=>{const[y,R,L,E]=i;for(const F of[y,R,L,y,L,E])e.push(...F),b.push(m)},[x,h]=K;S([[-x,-h,0],[x,-h,0],[x,h,0],[-x,h,0]],0),S([[-1.6,.03,2],[1.6,.03,2],[1.6,.03,-1.2],[-1.6,.03,-1.2]],1);const n=new r.BufferGeometry;n.setAttribute("position",new r.Float32BufferAttribute(e,3)),n.setAttribute("aKind",new r.Float32BufferAttribute(b,1)),n.boundingSphere=new r.Sphere(new r.Vector3(0,g,0),5);const l=new r.Mesh(n,new r.ShaderMaterial({uniforms:s,fog:!0,side:r.DoubleSide,transparent:!0,depthWrite:!1,blending:r.AdditiveBlending,vertexShader:T,fragmentShader:`${_}
      uniform vec3 uHalo, uGround;
      varying vec3 vLocal, vCamera; varying float vKind;
      #include <fog_pars_fragment>
      void main() {
        vec3 col;
        if (vKind < 0.5) {
          // Follow each camera ray to where it passes closest to the lens.
          // Rays that meet it leave the lens's own pixels alone; the mask
          // sits just under its stepped edge, so no gap shows between them.
          // The rest glow by how far they miss, in metres, which keeps one
          // soft outline from any side.
          vec3 radius3 = vec3(RX - 0.7 * CELL, RY - 0.7 * CELL, HZ);
          vec3 origin = (vCamera - vec3(0.0, OY, 0.0)) / radius3;
          vec3 ray = (vLocal - vCamera) / radius3;
          vec3 c = origin - ray * dot(origin, ray) / dot(ray, ray);
          float r = length(c);
          if (r < 1.0) discard;
          // The value over its slope is only reliable near the lens; its
          // bounding box also limits the glow, especially at a narrow tip.
          float d = (r - 1.0) * r / max(length(c / radius3), 1e-4);
          d = max(d, length(max(abs(c * radius3) - radius3, 0.0)));
          // A bright skin over a wide, faint aura, fading out with no edge,
          // and out towards the ground, where the card would cut it straight.
          // The aura swells a little as you come close.
          float glow = 0.6 * exp(-d * 12.0) + 0.4 * exp(-d * (5.0 - uNear));
          col = uHalo * glow * (1.0 - smoothstep(0.2, 0.5 + 0.1 * uNear, d)) * smoothstep(0.0, 0.4, vLocal.y)
            * (0.15 * (1.0 + 0.6 * uNear) + 0.5 * uCharge);
        } else {
          // Light spilling onto the grass from the foot of the oval: brightest
          // where it meets the ground, fading unevenly texel by texel, no edge.
          vec2 cell = floor(vLocal.xz / CELL), g = (cell + 0.5) * CELL;
          float across = max(abs(g.x) - RX * 0.35, 0.0) / 0.5;
          float out_ = g.y / (g.y > 0.0 ? 0.85 : 0.55);
          float spill = exp(-across * across - out_ * out_);
          col = uGround * spill * mix(0.7, 1.15, hash(cell)) * (0.42 * (1.0 + 0.4 * uNear) + 0.6 * uCharge);
        }
        #ifdef USE_FOG
          #ifdef FOG_EXP2
            col *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
          #else
            col *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
          #endif
        #endif
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}));l.name="portal-glow",l.renderOrder=2,d.add(l);let o=0,t=0,a=0;return{group:d,width:1.1,solid:c+.05,depth:C,aspect:c/p,box:new r.Box3(new r.Vector3(-c,0,-C),new r.Vector3(c,A,C)),setPreview(i,m=[1,1,0,0]){s.uPreview.value=i,s.uFit.value.set(...m),i||(s.uShow.value=0)},update(i,m,y,R){const L=i*(N?.2:1);o+=L;const E=1+P*m;t=(t+L*(O*E+3.5*y))%(Math.PI*2),a=(a+L*(1.6*E+2.6*y))%(Math.PI*2),s.uTime.value=o%1e3,s.uSpin.value=t,s.uFlow.value=a,s.uNear.value=m,s.uCharge.value=y,s.uShow.value=s.uPreview.value?R:0}}}export{X as createGate};
