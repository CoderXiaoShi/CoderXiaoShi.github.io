import*as t from"three";import*as E from"@world/layout.js";import{rng as K}from"./textures.js";const P=E.POOL,Q={floor:-2,steps:4,...E.SHELTER||{x0:E.ISLAND.x0-8,z0:E.ISLAND.z0-8,w:E.ISLAND.x1-E.ISLAND.x0+16,d:E.ISLAND.z1-E.ISLAND.z0+16}},R=-1.08;function Y(r,l){var y;const{x0:M,z0:A,w:u,d,floor:n,steps:w}=Q,h=new Float32Array(u*d),s=new Uint8Array(u*d),[g,L,p]=r.min,[f,b,x]=r.size;for(let m=0;m<d;m++)for(let S=0;S<u;S++){const v=M+S,o=A+m;let a=R;if(v>=g&&v<g+f&&o>=p&&o<p+x){for(let C=L+b-1;C>=L;C--)if(r.get(v,C,o)){a=C+1;break}}a=Math.max(a,((y=l.topAt(v+.5,o+.5))==null?void 0:y.y)??R),P&&v>=P.x0&&v<P.x1&&o>=P.z0&&o<P.z1&&(a=Math.max(a,P.water)),h[S+m*u]=a,s[S+m*u]=Math.max(0,Math.min(255,Math.round((a-n)*w)))}const i=new t.DataTexture(s,u,d,t.RedFormat,t.UnsignedByteType);return i.name="shelter",i.minFilter=i.magFilter=t.NearestFilter,i.generateMipmaps=!1,i.unpackAlignment=1,i.needsUpdate=!0,{texture:i,box:new t.Vector4(M,A,1/u,1/d),topAt(m,S){const v=Math.floor(m-M),o=Math.floor(S-A);return v<0||o<0||v>=u||o>=d?R:h[v+o*u]}}}const Z=`
  uniform vec3 uCenter, uBox, uOffset, uCam, uDir;
  uniform float uTime, uSize, uLen, uPixel, uAlpha, uSplash;
  uniform sampler2D uShelter;
  uniform vec4 uShelterBox;
  attribute vec4 aSeed;
  attribute float aKind;
  varying vec2 vUv;
  varying float vAlpha, vLife, vSplash;
  float shelterTop(vec2 xz) { return texture2D(uShelter, (xz - uShelterBox.xy) * uShelterBox.zw).r * 63.75 - 2.0; }
  vec3 wrapped(vec3 p) { vec3 o = uCenter - 0.5 * uBox; return o + mod(p - o, uBox); }
  void main() {
    vec2 corner = position.xy;
    float alpha = uAlpha;
    vec3 p, pos;
    vUv = corner; vLife = 0.0; vSplash = 0.0;
    #ifdef SNOW
      p = wrapped(aSeed.xyz * uBox + uOffset);
      p.x += sin(uTime * 0.5 + aSeed.w * 37.0) * 0.45;
      p.z += sin(uTime * 0.3 + aSeed.x * 53.0) * 0.45;
      if (p.y < shelterTop(p.xz)) alpha = 0.0;
    #else
      if (aKind > 0.5) {
        // Every seventh seed is a splash: a few droplets hop up where rain lands.
        float cycle = uTime / (0.42 + 0.3 * aSeed.z) + aSeed.w * 13.0, n = floor(cycle);
        vLife = fract(cycle); vSplash = 1.0;
        vec2 jitter = fract(sin(vec2(n * 12.9898 + aSeed.x * 78.233, n * 39.425 + aSeed.y * 11.135)) * 43758.5453);
        vec3 o = uCenter - 0.5 * uBox;
        vec2 xz = o.xz + mod(fract(aSeed.xy + jitter) * uBox.xz - o.xz, uBox.xz);
        p = vec3(xz.x, shelterTop(xz) + 0.01, xz.y);
        alpha = 0.6 * uSplash * (1.0 - vLife * vLife) * (1.0 - smoothstep(12.0, 22.0, length(p - uCam)));
      } else {
        p = wrapped(aSeed.xyz * uBox + uOffset);
        if (p.y < shelterTop(p.xz)) alpha = 0.0;
      }
    #endif
    vec3 rel = abs(p - uCenter) / (0.5 * uBox);
    alpha *= (1.0 - smoothstep(0.72, 1.0, max(rel.x, rel.z))) * (1.0 - smoothstep(0.8, 1.0, rel.y));
    alpha *= smoothstep(1.0, 3.0, length(p - uCam));
    if (alpha < 0.004) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vAlpha = 0.0; return; }
    vec4 view = viewMatrix * vec4(p, 1.0);
    float pixel = max(-view.z, 0.1) * uPixel;
    #ifdef SNOW
      float size = uSize * (0.6 + 0.8 * aSeed.z), s = max(size, pixel * 1.6);
      alpha *= size / s;
      vUv = corner * vec2(1.0, 2.0) - vec2(0.0, 1.0);
      view.xy += vUv * 0.5 * s;
      gl_Position = projectionMatrix * view;
    #else
      if (vSplash > 0.5) {
        vec3 look = p - uCam, right = normalize(vec3(-look.z, 0.0, look.x));
        pos = p + right * corner.x * 0.16 + vec3(0.0, corner.y * 0.24, 0.0);
      } else {
        float width = max(uSize, pixel * 1.25);
        alpha *= uSize / width;
        vec3 tail = p - uDir * uLen * (0.8 + 0.4 * aSeed.w), side = normalize(cross(uDir, p - uCam));
        pos = mix(tail, p, corner.y) + side * corner.x * 0.5 * width;
      }
      gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
    #endif
    vAlpha = alpha;
  }
`,$=`
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vAlpha, vLife, vSplash;
  void main() {
    float a = vAlpha;
    #ifdef SNOW
      a *= smoothstep(1.0, 0.25, length(vUv));
    #else
      if (vSplash > 0.5) {
        // Three square droplets on little arcs, as Minecraft's rain splashes.
        float drop = 0.0;
        for (int k = 0; k < 3; k++) {
          float s = float(k) - 1.0;
          vec2 c = vec2(s * 0.8 * vLife, (0.18 + 0.5 * (1.0 - 0.45 * abs(s))) * sin(3.1416 * vLife));
          vec2 q = abs(vUv - c) / vec2(0.15, 0.1);
          drop = max(drop, step(max(q.x, q.y), 1.0));
        }
        a *= drop;
      } else a *= (1.0 - abs(vUv.x)) * mix(0.15, 1.0, vUv.y);
    #endif
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;function X(r,l,M){const A=K(l?6284:2815),u=new Float32Array(r*4),d=new Float32Array(r);for(let s=0;s<r;s++){for(let g=0;g<4;g++)u[s*4+g]=A();d[s]=!l&&s%7===6?1:0}const n=new t.InstancedBufferGeometry;n.setAttribute("position",new t.Float32BufferAttribute([-1,0,0,1,0,0,1,1,0,-1,1,0],3)),n.setIndex([0,1,2,0,2,3]),n.setAttribute("aSeed",new t.InstancedBufferAttribute(u,4)),n.setAttribute("aKind",new t.InstancedBufferAttribute(d,1)),n.instanceCount=0,n.boundingSphere=new t.Sphere(new t.Vector3,1e4);const w=new t.ShaderMaterial({name:l?"snow":"rain",defines:l?{SNOW:""}:{},uniforms:{...M,uBox:{value:new t.Vector3},uOffset:{value:new t.Vector3},uDir:{value:new t.Vector3(0,-1,0)},uSize:{value:l?.075:.014},uLen:{value:.7},uAlpha:{value:0},uSplash:{value:0},uColor:{value:new t.Color}},vertexShader:Z,fragmentShader:$,transparent:!0,depthWrite:!1,side:t.DoubleSide}),h=new t.Mesh(n,w);return h.name=w.name,h.frustumCulled=!1,h.renderOrder=4,h.visible=!1,{mesh:h,count:r,box:w.uniforms.uBox.value,offset:w.uniforms.uOffset.value}}const T=[26,10,10];function ee(){const r=T.reduce((p,f)=>p+f,0),l=new Float32Array(r*2*3),M=new Float32Array(r*2),A=new Float32Array(r*2),u=[];let d=0;for(const p of T){for(let f=0;f<p;f++)M[(d+f)*2]=-1,M[(d+f)*2+1]=1;for(let f=0;f<p-1;f++){const b=(d+f)*2;u.push(b,b+1,b+3,b,b+3,b+2)}d+=p}const n=new t.BufferGeometry;n.setAttribute("position",new t.BufferAttribute(l,3).setUsage(t.DynamicDrawUsage)),n.setAttribute("aEdge",new t.BufferAttribute(M,1)),n.setAttribute("aGlow",new t.BufferAttribute(A,1).setUsage(t.DynamicDrawUsage)),n.setIndex(u),n.boundingSphere=new t.Sphere(new t.Vector3,1e4);const w=new t.ShaderMaterial({name:"lightning",uniforms:{uFlash:{value:0}},transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide,vertexShader:`attribute float aEdge, aGlow; varying float vEdge, vGlow;
      void main() { vEdge = aEdge; vGlow = aGlow; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform float uFlash; varying float vEdge, vGlow;
      void main() { float core = 1.0 - abs(vEdge); gl_FragColor = vec4(vec3(0.86, 0.9, 1.0) * core * core * vGlow * uFlash, 1.0);
        #include <colorspace_fragment>
      }`}),h=new t.Mesh(n,w);h.name="lightning",h.frustumCulled=!1,h.renderOrder=4,h.visible=!1;const s=new t.Vector3,g=new t.Vector3(0,1,0);function L(p,f,b,x,i){s.set(x-f.position.z,0,f.position.x-b).normalize();const y=[],m=[];let S=0;for(let o=0;o<T[0];o++){const a=o/(T[0]-1);o&&(S+=(p()-.5)*7),m.push([S,78+(i-78)*a,1.2-.6*a,1])}y.push(m);for(let o=1;o<T.length;o++){const a=m[4+Math.floor(p()*10)],C=p()<.5?-1:1,V=[];let[U,I]=a;for(let B=0;B<T[o];B++)V.push([U,I,.5*(1-B/T[o]),.7*(1-B/T[o])]),U+=C*(1.2+p()*2.6),I-=2.2+p()*2.4;y.push(V)}let v=0;for(const o of y)for(let a=0;a<o.length;a++){const[C,V,U,I]=o[a],B=o[Math.max(0,a-1)],W=o[Math.min(o.length-1,a+1)],e=W[0]-B[0],c=W[1]-B[1],z=Math.hypot(e,c)||1,k=-c/z*U/2,D=e/z*U/2;for(const F of[-1,1])l[v*3]=b+s.x*(C+F*k),l[v*3+1]=V+F*D,l[v*3+2]=x+s.z*(C+F*k),A[v]=I,v++}n.attributes.position.needsUpdate=!0,n.attributes.aGlow.needsUpdate=!0}return{mesh:h,material:w,shape:L,up:g}}const q={cloud:0,rain:0,snow:0,fog:0,haze:0,wind:0,storm:0},J=new t.Vector2(.82,.57).normalize(),H=(r,l)=>(r%l+l)%l;function oe({stage:r,world:l,quality:M,sound:A}){const u=Y(l.grid,l.ground),d=matchMedia("(prefers-reduced-motion: reduce)"),n={uCenter:{value:new t.Vector3},uCam:{value:new t.Vector3},uTime:{value:0},uPixel:{value:.001},uShelter:{value:u.texture},uShelterBox:{value:u.box}},w=X(M.mobile?840:1820,!1,n),h=X(M.mobile?700:1500,!0,n);w.box.set(30,18,30),h.box.set(26,16,26);const s=ee();r.scene.add(w.mesh,h.mesh,s.mesh);const g=l.materials.uniforms;g.uShelter.value=u.texture,g.uShelterBox.value=u.box,g.uSkyTint.value=r.sky.material.uniforms.uFogColor.value;const L=K(951),p=new t.Vector3,f=new t.Vector3,b=new t.Color(.75,.82,.86);let x={...q},i={...q},y=0,m=0,S=0,v=-1,o=1.6,a=-1;function C(e){x={...q,...e},x.storm>0?i.storm>.05||(o=1.6):(a=-1,s.mesh.visible=!1,r.setLightning(0))}function V(e){const c=Math.atan2(p.z,p.x)+(L()-.5)*.9,z=Math.min(145,(.55+.4*L())*e.far),k=e.position.x+Math.cos(c)*z,D=e.position.z+Math.sin(c)*z;s.shape(L,e,k,D,u.topAt(k,D)),a=0,o=(8+L()*12)/Math.max(.35,i.storm),A==null||A.play("thunder",1.1-z/300,z/343)}const U=e=>e<.05?1:e<.09?.25:e<.16?.85:Math.max(0,.85*(1-(e-.16)/.4));function I(e,c,z,k,{fall:D,drift:F,alpha:_}){const j=c>.002&&!d.matches;if(e.mesh.visible=j,!j){e.mesh.geometry.instanceCount=0;return}e.mesh.geometry.instanceCount=Math.ceil(e.count*Math.min(1,c)),f.set(J.x*F,-D,J.y*F);const G=e.mesh.material.uniforms,N=e.offset;N.set(H(N.x+f.x*z,e.box.x),H(N.y+f.y*z,e.box.y),H(N.z+f.z*z,e.box.z)),G.uDir.value.copy(f).normalize(),G.uAlpha.value=_}function B(e,c,z=c.position){const k=1-Math.exp(-e/.8);for(const O in i)i[O]+=(x[O]-i[O])*k;const D=x.rain>.01?Math.min(1,.45+x.rain):0;y+=(D-y)*(1-Math.exp(-e/(D>y?2.5:9)));const F=x.snow>.01?Math.min(1,.35+x.snow):0;m+=(F-m)*(1-Math.exp(-e/(F>m?5:8))),g.uWet.value=y<.003?0:y,g.uSnow.value=m<.003?0:m,l.coast.follow(c),Math.abs(r.veil-v)>.002&&(v=r.veil,l.coast.setWeather(v)),S=(S+e)%(Math.PI*20),c.getWorldDirection(p),n.uTime.value=S,n.uCam.value.copy(c.position),n.uPixel.value=2/(c.projectionMatrix.elements[5]*Math.max(1,r.renderer.domElement.height)),n.uCenter.value.lerpVectors(c.position,z,.55),n.uCenter.value.x+=p.x*4,n.uCenter.value.y+=1.5,n.uCenter.value.z+=p.z*4;const _=t.MathUtils.clamp(r.hemi.intensity/1.25,.2,1.1),j=r.scene.fog.color,G=w.mesh.material.uniforms,N=h.mesh.material.uniforms;if(G.uColor.value.copy(j).lerp(b,.45).multiplyScalar(.55+.45*_),N.uColor.value.setRGB(.92,.94,.96).multiplyScalar(.35+.65*_),G.uLen.value=.55+.35*i.rain,G.uSplash.value=Math.min(1,i.rain*1.2),I(h,i.snow,e,c,{fall:1.15,drift:i.wind*1.6,alpha:.9}),I(w,i.rain,e,c,{fall:9+2*i.storm,drift:i.wind*5,alpha:.4+.3*i.rain}),d.matches||x.storm<=0){a>=0&&(a=-1,s.mesh.visible=!1,r.setLightning(0));return}if(o-=e,o<=0&&a<0&&V(c),a>=0){a+=e;const O=U(a);r.setLightning(O*.65),s.material.uniforms.uFlash.value=O,s.mesh.visible=O>.01,a>=.6&&(a=-1,s.mesh.visible=!1,r.setLightning(0))}}function W(){i={...x},y=x.rain>.01?Math.min(1,.45+x.rain):0,m=x.snow>.01?Math.min(1,.35+x.snow):0,B(0,r.camera)}return{shelter:u,rain:w.mesh,snow:h.mesh,lightning:s.mesh,setWeather:C,update:B,settle:W,get state(){return{...i,wet:y,cover:m}},warmup(e){for(const c of[w,h])c.mesh.visible=e,c.mesh.geometry.instanceCount=e?c.count:0;e&&s.shape(L,r.camera,0,-400,0),s.mesh.visible=e,e||W()}}}export{Y as buildShelter,oe as createWeatherFx};
