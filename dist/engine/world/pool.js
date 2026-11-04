import*as o from"three";import*as ce from"@world/layout.js";import{rng as ae}from"./textures.js";const s=ce.POOL||{x0:0,x1:1,z0:0,z1:1,water:0,bed:-1},z=s.water,Q=8,V=new o.Vector3((s.x0+s.x1)/2,z,(s.z0+s.z1)/2);function de(i=128){const W=ae(4242),L=new Uint8Array(i*i),c=u=>u*u*(3-2*u),y=[[6,.7],[13,.3]].map(([u,a])=>({n:u,weight:a,grid:Float32Array.from({length:u*u},W)}));for(let u=0;u<i;u++)for(let a=0;a<i;a++){let R=0;for(const{n:h,weight:F,grid:p}of y){const g=a/i*h,t=u/i*h,S=Math.floor(g),v=Math.floor(t),T=c(g-S),P=c(t-v),q=(I,N)=>p[I%h+N%h*h];R+=F*((q(S,v)*(1-T)+q(S+1,v)*T)*(1-P)+(q(S,v+1)*(1-T)+q(S+1,v+1)*T)*P)}L[a+u*i]=Math.round(R*255)}const r=new o.DataTexture(L,i,i,o.RedFormat,o.UnsignedByteType);return r.name="caustics",r.wrapS=r.wrapT=o.RepeatWrapping,r.magFilter=o.LinearFilter,r.minFilter=o.LinearMipmapLinearFilter,r.generateMipmaps=!0,r.unpackAlignment=1,r.needsUpdate=!0,r}const he=`
  varying vec3 vWorld;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`,ve=`
  #include <common>
  #include <fog_pars_fragment>
  uniform float uTime, uRain, uWind, uSun, uLight, uGlow, uFlash, uCover, uVeil;
  uniform vec3 uTop, uHorizon, uAir, uSunDir, uSunColor, uDeep, uShallow, uMirror, uLand, uGlowColor, uCloudLit, uCloudShade;
  uniform vec2 uCloudShift;
  uniform sampler2D uClouds;
  uniform vec2 uAirFog;
  uniform vec4 uRipples[RIPPLES];
  uniform sampler2D uShelter;
  uniform vec4 uShelterBox;
  varying vec3 vWorld;

  vec2 hash22(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    q += dot(q, q.yzx + 33.33);
    return fract((q.xx + q.yz) * q.zy);
  }

  float hash12(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // One layer of raindrops over cells \`size\` metres across. Now and then a
  // cell takes a drop, somewhere new each time; its ring runs out with a
  // crest or two and dies away within half a second. Where a ring would be
  // finer than the screen can show, \`detail\` stretches it. Adds to the
  // surface's slope (xy) and height (z); a big drop also brightens the water
  // where it lands (w).
  void rainRings(vec2 p, float size, float density, float detail, inout vec4 wave) {
    vec2 q = p / size, cell = floor(q);
    float k = mix(40.0, 70.0, detail), width = 0.0032;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j)), h = hash22(c);
      float period = 0.5 + 0.5 * h.x;
      float cycle = uTime / period + h.y, n = floor(cycle), age = fract(cycle) * period;
      vec2 at = hash22(c + vec2(n * 0.618, n * 1.414));
      if (fract(at.x * 7.13 + at.y * 3.71) > density) continue;
      vec2 d = (q - c - 0.15 - 0.7 * at) * size;
      float dist = length(d), x = dist - 0.02 - age * 0.3;
      float big = 0.5 + fract(at.x * 3.7 + at.y * 1.9);
      float life = exp(-age * 3.5), g = exp(-x * x / width) * life * 0.0016 * big;
      wave.xy += g * (k * cos(k * x) - 2.0 * x / width * sin(k * x)) * d / max(dist, 1e-4);
      wave.z += g * sin(k * x);
      wave.w += exp(-dist * dist * 900.0) * max(0.0, 1.0 - age * 8.0) * max(0.0, big - 1.0) * 0.6;
    }
  }

  // Slow swells and a little chop: the slope of a few travelling waves.
  vec2 swell(vec2 p, float detail) {
    const vec2 a = vec2(0.80, 0.60), b = vec2(-0.45, 0.89), c = vec2(0.96, -0.28), d = vec2(-0.70, -0.71);
    vec2 s = a * 0.025 * cos(dot(p, a) * 2.1 + uTime * 1.05) + b * 0.026 * cos(dot(p, b) * 3.3 + uTime * 1.45);
    s += (c * 0.026 * cos(dot(p, c) * 7.4 + uTime * 2.3) + d * 0.024 * cos(dot(p, d) * 11.0 + uTime * 2.9)) * detail;
    return s * (0.35 + 1.3 * uWind);
  }

  // Rings spreading from the swimmer: strokes, a dive, climbing out.
  vec2 wakes(vec2 p) {
    vec2 s = vec2(0.0);
    for (int i = 0; i < RIPPLES; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w <= 0.0 || age < 0.0 || age > 3.2) continue;
      vec2 d = p - r.xy;
      float dist = length(d), x = dist - 0.12 - age * 0.62;
      float life = 1.0 - age / 3.2, g = exp(-x * x / 0.03);
      s += r.w * life * life * g * (16.0 * cos(16.0 * x) - x / 0.015 * sin(16.0 * x)) * 0.011 * d / max(dist, 1e-4);
    }
    return s;
  }

  vec3 skyAlong(vec3 d) {
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, d.y));
    return mix(col, uAir, smoothstep(0.1, -0.02, d.y));
  }

  void main() {
    vec2 p = vWorld.xz;
    float detail = 1.0 - smoothstep(0.004, 0.012, length(fwidth(p)));
    vec4 wave = vec4(swell(p, detail) + wakes(p), 0.0, 0.0);
    float glitter = 0.0;
    if (uRain > 0.0) {
      rainRings(p, 0.42, clamp(0.12 + uRain * 0.6, 0.0, 0.8), detail, wave);
      #if LAYERS > 1
      if (uRain > 0.8) rainRings(p + 17.3, 0.3, (uRain - 0.8) * 2.5, detail, wave);
      #endif
      // Under all the drops too small to make a ring, the surface glitters:
      // a faint dapple that never holds still.
      glitter = (vnoise(p * 6.0 + uTime * vec2(1.3, 0.7)) * vnoise(p * 8.5 - uTime * vec2(0.6, 1.5)) - 0.25) * 0.3 * uRain;
    }
    vec3 N = normalize(vec3(-wave.x, 1.0, -wave.y));
    // A ring's crest gathers light like a lens and its trough spreads it.
    float lens = 1.0 + clamp(wave.z * 220.0, -0.3, 0.3) + glitter;
    vec3 col;
    float alpha = 1.0;
    if (cameraPosition.y >= vWorld.y) {
      // From above: clear water over the floor, mirroring more of the sky the lower the eye.
      vec3 V = normalize(cameraPosition - vWorld), R = reflect(-V, N);
      R.y = abs(R.y);
      float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0), slant = 1.0 - V.y;
      vec3 mirrored = skyAlong(R) + uSunColor * uSun * pow(max(dot(R, uSunDir), 0.0), 600.0) * 5.0 + uFlash * vec3(0.4);
      vec3 body = mix(uShallow, uDeep, slant) * uLight + uGlowColor * uGlow * 0.7;
      float a = mix(0.36, 0.84, smoothstep(0.05, 0.9, slant));
      alpha = a + (1.0 - a) * fresnel;
      col = (body * a * (1.0 - fresnel) + mirrored * fresnel * mix(1.0, lens, 0.5)) / alpha + wave.w * 0.6 * uLight;
    } else {
      // From below: Snell's window. The whole sky is squeezed into a cone
      // overhead; outside it the surface mirrors the pool. Each colour leaves
      // the water up to its own critical angle, so the rim carries a faint
      // rainbow, softened as an eye open under water sees it.
      vec3 I = normalize(vWorld - cameraPosition);
      float cosI = max(dot(I, N), 0.0), sinI = sqrt(1.0 - cosI * cosI), rim = sinI * 1.336;
      vec3 leave = 1.0 - smoothstep(vec3(0.95), vec3(1.0), sinI * vec3(1.331, 1.336, 1.343));
      // A cloud deck is brightest overhead and dimmer towards the horizon.
      vec3 overhead = mix(uHorizon, uTop, 0.5) * 2.8;
      vec3 through = overhead, T = refract(I, -N, 1.331);
      if (dot(T, T) > 0.0) {
        float sun = max(dot(T, uSunDir), 0.0);
        vec3 deck = overhead * (0.35 + 0.65 * max(T.y, 0.0));
        through = mix(skyAlong(T) * 1.35, deck, uVeil);
        // The sky's square clouds, as the sky draws them, wavering through the water.
        if (T.y > 0.015 && uCover > 0.0) {
          float lift = max(0.0, 96.0 - vWorld.y), t = lift / T.y;
          float v = texture2D(uClouds, (vWorld.xz + T.xz * t + uCloudShift) / 768.0).r;
          float puff = step(1.0 - uCover, v) * smoothstep(0.015, 0.16, T.y) * exp(-t * 0.0011) * (1.0 - uVeil);
          through = mix(through, mix(uCloudLit, uCloudShade, smoothstep(1.0 - uCover, 1.0, v) * 0.7) * 1.3, puff * 0.93);
        }
        through += uSunColor * uSun * (pow(sun, 900.0) * 9.0 + pow(sun, 30.0) * 0.5);
        // The deck, the house, the trees and the mountain stand darker against
        // the sky towards the rim: grey shapes in the haze, never solid black.
        // Nothing on the island stands steeper than T.y = 0.9.
        float shade = 0.0;
        if (T.y < 0.9) for (int k = 0; k < STEPS; k++) {
          float t = 0.45 * pow(1.62, float(k));
          vec3 q = vWorld + T * t;
          float top = texture2D(uShelter, (q.xz - uShelterBox.xy) * uShelterBox.zw).r * 63.75 - 2.0;
          shade = max(shade, smoothstep(top + 0.05, top - 0.25, q.y) * (1.0 - smoothstep(uAirFog.x * 0.4, uAirFog.y, t)));
          if (shade > 0.99) break;
        }
        through = mix(through, mix(uLand * uLight, overhead * 0.45, 0.2), shade);
        through = (through * mix(1.0, lens, 0.7) + uFlash * vec3(0.55, 0.6, 0.66)) * (1.0 - 0.5 * smoothstep(0.7, 1.0, rim));
      }
      // Outside the window: the pool, mirrored, dim; just beyond the rim it
      // glows with the window's light scattered in the water.
      vec3 mirror = (uMirror * uLight + uGlowColor * uGlow * 0.5) * mix(1.0, lens, 0.5);
      mirror += overhead * 0.16 * exp(-max(rim - 1.0, 0.0) * 4.0);
      col = mix(mirror, through, leave) + wave.w * 0.9 * (uLight + 0.15);
    }
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`,fe=`
  attribute vec4 aAt;
  attribute vec2 aLook;
  varying vec2 vUv;
  varying vec2 vLook;
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vUv = position.xy; vLook = aLook;
    vec4 mvPosition = viewMatrix * vec4(aAt.xyz, 1.0);
    mvPosition.xy += position.xy * aAt.w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`,me=`
  uniform vec3 uTint;
  varying vec2 vUv;
  varying vec2 vLook;
  #include <common>
  #include <fog_pars_fragment>
  void main() {
    float d = length(vUv), a;
    if (vLook.y < 0.5) {
      // A bubble: a bright rim round a clear middle, and a glint.
      a = smoothstep(1.0, 0.8, d) * (0.15 + 0.85 * smoothstep(0.45, 0.9, d));
      a = max(a, smoothstep(0.3, 0.05, length(vUv - vec2(-0.3, 0.35))));
    } else if (vLook.y < 1.5) a = smoothstep(1.0, 0.45, d);
    else a = smoothstep(1.0, 0.0, d) * 0.7;
    a *= vLook.x;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uTint, a);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;function ie(i,W,L){const c=new o.InstancedBufferGeometry;c.setAttribute("position",new o.Float32BufferAttribute([-1,-1,0,1,-1,0,1,1,0,-1,1,0],3)),c.setIndex([0,1,2,0,2,3]);const y=new o.InstancedBufferAttribute(new Float32Array(i*4),4).setUsage(o.DynamicDrawUsage),r=new o.InstancedBufferAttribute(new Float32Array(i*2),2).setUsage(o.DynamicDrawUsage);c.setAttribute("aAt",y),c.setAttribute("aLook",r),c.instanceCount=0,c.boundingSphere=new o.Sphere(V,40);const u=new o.Mesh(c,L);u.name=W,u.frustumCulled=!1,u.visible=!1;let a=0;return{mesh:u,max:i,begin(){a=0},add(R,h,F,p,g,t){a>=i||(y.setXYZW(a,R,h,F,p),r.setXY(a,g,t),a++)},end(){c.instanceCount=a,u.visible=a>0,a&&(y.needsUpdate=!0,r.needsUpdate=!0)}}}function ge({stage:i,world:W,shelter:L,quality:c}){const y=W.materials.uniforms,r=i.sky.material.uniforms,u=de();y.uCaustics.value=u;const a={...o.UniformsUtils.clone(o.UniformsLib.fog),uTime:{value:0},uRain:{value:0},uWind:{value:0},uSun:{value:0},uLight:{value:1},uGlow:{value:0},uFlash:{value:0},uDeep:{value:new o.Color(2258051)},uShallow:{value:new o.Color(6143175)},uMirror:{value:new o.Color(1527642)},uLand:{value:new o.Color(3819074)},uGlowColor:{value:new o.Color(4370362)},uAirFog:{value:new o.Vector2(80,220)},uRipples:{value:Array.from({length:Q},()=>new o.Vector4)},uShelter:{value:L.texture},uShelterBox:{value:L.box},uTop:r.uTop,uHorizon:r.uHorizon,uSunDir:r.uSunDir,uSunColor:r.uSunColor,uAir:{value:i.airFog},uClouds:r.uClouds,uCover:r.uCover,uCloudShift:r.uCloudShift,uCloudLit:r.uCloudLit,uCloudShade:r.uCloudShade,uVeil:r.uCloud},R=new o.ShaderMaterial({name:"pool-water",uniforms:a,vertexShader:he,fragmentShader:ve,defines:{RIPPLES:Q,STEPS:c.mobile?9:11,LAYERS:c.mobile?1:2},transparent:!0,depthWrite:!1,side:o.DoubleSide,fog:!0}),h=new o.Mesh(new o.PlaneGeometry(s.x1-s.x0,s.z1-s.z0),R);h.name="pool-water",h.rotation.x=-Math.PI/2,h.position.copy(V),h.renderOrder=3;const F=new o.ShaderMaterial({name:"pool-particles",uniforms:o.UniformsUtils.merge([o.UniformsLib.fog,{uTint:{value:new o.Color(15662335)}}]),vertexShader:fe,fragmentShader:me,transparent:!0,depthWrite:!1,fog:!0}),p=ie(c.mobile?90:160,"pool-bubbles",F),g=ie(48,"pool-droplets",F);g.mesh.renderOrder=5,i.scene.add(h,p.mesh,g.mesh);const t=ae(31337),S=matchMedia("(prefers-reduced-motion: reduce)"),v=[],T=[],P=[],q=Array.from({length:c.mobile?40:70},()=>[t(),t(),t(),t()]),I=new o.Color,N=new o.Color(3304823),$=new o.Color(3117982),ee=new o.Color,ne={color:I,near:-9,far:26};let k=0,B=0,O=0,j=0,M=!1;function H(l,d,f){a.uRipples.value[B].set(l,d,k,f),B=(B+1)%Q}function oe(l,d,f,m,x=.35){for(let C=0;C<m;C++)v.push({x:l+(t()-.5)*x,y:Math.min(z-.05,d+(t()-.5)*x),z:f+(t()-.5)*x,r:.008+t()*t()*.03,phase:t()*6.3,drift:(t()-.5)*.1})}function le(l,d,f=1){if(!S.matches){for(let m=0,x=Math.round(8+18*f);m<x;m++){const C=t()*Math.PI*2,U=.4+t()*1.4*f;T.push({x:l+Math.cos(C)*.25,y:z+.05,z:d+Math.sin(C)*.25,vx:Math.cos(C)*U,vy:1.2+t()*2.8*f,vz:Math.sin(C)*U,r:.02+t()*.03})}H(l,d,Math.min(1.2,f)),oe(l,z-.35,d,Math.round(10*f),.6)}}function se(l,d,f){if(!S.matches)for(let m=0;m<7;m++)P.push({t:m*.09+t()*.05,x:l,y:d,z:f})}function ue(l,d,f,m){const x=S.matches;if(x||(k+=l),k>3600){k-=3600;for(const n of a.uRipples.value)n.z-=3600}a.uTime.value=k,y.uPoolTime.value=k;const C=i.night,U=i.hemi.intensity,X=o.MathUtils.clamp(U/1.25,.2,1.2)*(1-.72*C),_=o.MathUtils.clamp((y.uEmissiveBoost.value-.4)/.5,0,1),te=i.sun.visible?i.sun.intensity/2.7:0;a.uRain.value=x?0:m.rain,a.uWind.value=m.wind,a.uSun.value=te,a.uLight.value=X,a.uGlow.value=_,a.uFlash.value=r.uFlash.value,a.uAirFog.value.set(i.airNear,i.airFar);const b=d.position;M=b.y<z&&b.x>s.x0&&b.x<s.x1&&b.z>s.z0&&b.z<s.z1;const D=r.uSunDir.value,G=1/1.336,re=Math.sqrt(1-G*G*(1-D.y*D.y));y.uPoolLight.value.set(G*D.x/re,G*D.z/re,te*(M?.5:1),_),R.depthWrite=M,p.mesh.renderOrder=M?5:2,M?(ee.copy(r.uHorizon.value).lerp(r.uTop.value,.5),I.copy(N).lerp(ee,.35).multiplyScalar(.3+.9*X).lerp($,_*.6),i.setSubmerged(ne)):i.setSubmerged(null),F.uniforms.uTint.value.setScalar(.4+.6*Math.min(1,X)).lerp($,_*.35);const E=f.swim;if(E&&!x&&(O-=l,E.surface&&O<=0)){const n=E.speed>.3;H(E.x,E.z,n?Math.min(.75,.25+E.speed/4):.16),O=n?.36:1.3}if(M&&!x&&m.rain>.05)for(j-=l;j<=0;j+=1/(18*m.rain)){const n=t()*Math.PI*2,e=Math.sqrt(t())*3.5,w=b.x+Math.cos(n)*e,A=b.z+Math.sin(n)*e;w>s.x0&&w<s.x1&&A>s.z0&&A<s.z1&&v.push({x:w,y:z-.03-t()*.12,z:A,r:.004+t()*.007,phase:t()*6.3,drift:0})}for(let n=P.length-1;n>=0;n--){const e=P[n];(e.t-=l)>0||(v.push({x:e.x+(t()-.5)*.04,y:e.y,z:e.z+(t()-.5)*.04,r:.006+t()*.016,phase:t()*6.3,drift:(t()-.5)*.06}),P.splice(n,1))}p.begin();for(let n=v.length-1;n>=0;n--){const e=v[n];if(e.phase+=l*9,e.y+=(.2+e.r*9)*l,e.x+=(Math.sin(e.phase)*.05+e.drift)*l,e.z+=Math.cos(e.phase*.8)*.05*l,e.y>z-e.r*.5||v.length>p.max){v.splice(n,1);continue}p.add(e.x,e.y,e.z,e.r,.85,0)}if(M&&!x){const n=(e,w,A)=>A-w/2+((e-A+w/2)%w+w)%w;for(const[e,w,A,Y]of q){const Z=n(e*9+k*.05*(Y-.5),9,b.x),J=n(w*4+k*.02,4,b.y),K=n(A*9,9,b.z);Z<s.x0||Z>s.x1||K<s.z0||K>s.z1||J>z-.05||J<s.bed||p.add(Z,J,K,.006+Y*.01,.18+.25*Y,2)}}p.end(),g.begin();for(let n=T.length-1;n>=0;n--){const e=T[n];if(e.vy-=9.8*l,e.x+=e.vx*l,e.y+=e.vy*l,e.z+=e.vz*l,e.y<z){T.splice(n,1);continue}g.add(e.x,e.y,e.z,e.r,.8,1)}g.end()}return{water:h,caustics:u,update:ue,splash:le,exhale:se,burst:oe,ripple:H,get submerged(){return M},fogColor:I,warmup(l){for(const d of[p,g])d.begin(),l&&d.add(V.x,-30,V.z,.1,1,0),d.end()}}}export{ge as createPool};
