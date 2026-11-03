import*as o from"three";const H=new o.Color(.15,.15,.4),F=.6,M=60,q=`
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`,D={vertexShader:`
    varying vec3 vDir;
    void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    uniform vec3 uHaze;
    varying vec3 vDir;
    void main() {
      float h = vDir.y;
      vec3 top = vec3(0.003, 0.005, 0.028), mid = vec3(0.022, 0.04, 0.2);
      vec3 col = mix(uHaze * 1.15, mid, smoothstep(0.0, 0.16, h));
      col = mix(col, top, smoothstep(0.16, 0.7, h));
      gl_FragColor = vec4(col, 1.0);
    }
  `},P={vertexShader:`
    varying vec3 vWorld;
    void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
  `,fragmentShader:`
    uniform vec3 uHaze; uniform vec3 uCam; uniform float uTime;
    varying vec3 vWorld;
    ${q}
    // Thin lines and dots fade to their average brightness once smaller than a
    // pixel, so the distant city reads as a glow instead of shimmering.
    float line(float d, float w, float px) { return 1.0 - smoothstep(w - px, w + px, d); }
    void main() {
      float c = cos(${F.toFixed(2)}), s = sin(${F.toFixed(2)});
      vec2 p = vec2(c * vWorld.x + s * vWorld.z, -s * vWorld.x + c * vWorld.z);
      vec3 col = vec3(0.0015, 0.002, 0.0045);
      // Streets every block, brighter avenues every third.
      vec2 f = fract(p / ${M.toFixed(1)}); vec2 e = min(f, 1.0 - f) * ${M.toFixed(1)};
      float d = min(e.x, e.y), px = fwidth(d) + 1e-3;
      float street = line(d, 3.0, px);
      vec2 fa = fract(p / ${(M*3).toFixed(1)}); vec2 ea = min(fa, 1.0 - fa) * ${(M*3).toFixed(1)};
      float avenue = line(min(ea.x, ea.y), 5.0, fwidth(min(ea.x, ea.y)) + 1e-3);
      vec3 sodium = vec3(1.0, 0.62, 0.3), led = vec3(0.75, 0.88, 1.0);
      col += street * sodium * 0.16 + avenue * mix(sodium, led, 0.35) * 0.6;
      // Lamps along every street, a dot every 9 m.
      vec2 lp = p / 9.0; vec2 lc = fract(lp) - 0.5; float lpx = fwidth(lp.x) + 1e-3;
      float lamp = (1.0 - smoothstep(0.12, 0.12 + lpx * 1.5, length(lc))) * step(d, 4.5);
      col += mix(lamp, 0.05, clamp(lpx * 2.0 - 0.4, 0.0, 1.0)) * step(d, 4.5) * vec3(1.0, 0.75, 0.45) * 1.6;
      // Lit windows and yards within the blocks, a 5 m lattice.
      vec2 q = p / 5.0, cell = floor(q), fq = fract(q) - 0.5; float qpx = fwidth(q.x) + 1e-3;
      // Thicker towards the horizon, as the city's lights pack together there.
      float far = smoothstep(500.0, 3200.0, length(vWorld.xz - uCam.xz));
      float hq = hash(cell), on = step(0.74 - 0.26 * far, hq) * (1.0 - street);
      float bulb = mix(1.0 - smoothstep(0.12, 0.12 + qpx * 1.5, length(fq)), 0.06, clamp(qpx * 2.0 - 0.5, 0.0, 1.0));
      col += on * bulb * mix(vec3(1.0, 0.82, 0.55), vec3(0.6, 0.85, 1.0), step(0.86, hq)) * 1.5;
      // A freeway sweeping past downtown, white headlights one way, red tail lights the other.
      float fx = vWorld.x - (210.0 + 70.0 * sin(vWorld.z / 260.0));
      float band = 1.0 - smoothstep(9.0, 12.0, abs(fx));
      col += band * vec3(1.0, 0.55, 0.2) * 0.35;
      float lane = step(abs(fx), 9.0);
      float go = fract((vWorld.z - uTime * 26.0) / 13.0), back = fract((vWorld.z + uTime * 24.0) / 11.0);
      col += lane * step(fx, 0.0) * step(go, 0.22) * vec3(1.0, 0.97, 0.9) * 1.6;
      col += lane * step(0.0, fx) * step(back, 0.22) * vec3(1.0, 0.18, 0.12) * 1.4;
      // Haze only far out, gathering into the glow along the horizon.
      float dist = length(vWorld.xz - uCam.xz);
      col = mix(col, uHaze, smoothstep(1100.0, 5200.0, dist) * 0.9);
      gl_FragColor = vec4(col, 1.0);
    }
  `},N={vertexShader:`
    attribute vec4 aInfo;
    varying vec3 vLocal; varying vec3 vSize; varying vec3 vNormalL; varying vec4 vInfo; varying float vDist;
    void main() {
      mat4 im = instanceMatrix;
      vSize = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
      vLocal = (position + vec3(0.5, 0.0, 0.5)) * vSize;
      vNormalL = normal; vInfo = aInfo;
      vec4 view = viewMatrix * modelMatrix * im * vec4(position, 1.0);
      vDist = -view.z;
      gl_Position = projectionMatrix * view;
    }
  `,fragmentShader:`
    uniform vec3 uHaze;
    varying vec3 vLocal; varying vec3 vSize; varying vec3 vNormalL; varying vec4 vInfo; varying float vDist;
    ${q}
    void main() {
      float seed = vInfo.x, litFrac = vInfo.y, tint = mod(vInfo.z, 4.0), pattern = floor(vInfo.z / 4.0), crown = vInfo.w;
      vec3 warm = vec3(1.0, 0.85, 0.6), cool = vec3(0.8, 0.9, 1.0), blue = vec3(0.32, 0.58, 1.0);
      vec3 wc = tint < 0.5 ? warm : tint < 1.5 ? cool : blue;
      vec3 col;
      if (vNormalL.y > 0.5) {
        // Roofs: dark, with a ring of light round the tallest crowns.
        col = vec3(0.003, 0.004, 0.01);
        vec2 e = min(vLocal.xz, vSize.xz - vLocal.xz);
        col += crown * (1.0 - smoothstep(0.8, 1.8, min(e.x, e.y))) * mix(vec3(0.95, 0.97, 1.0), blue, step(1.5, crown)) * 1.3;
      } else {
        // Glass going from near black at street level to the sky's blue up top,
        // a grid of windows over it, most of them lit.
        float u = abs(vNormalL.x) > 0.5 ? vLocal.z : vLocal.x, face = vNormalL.x * 3.0 + vNormalL.z * 7.0;
        float up = clamp(vLocal.y / max(vSize.y, 1.0), 0.0, 1.0);
        // Four facades: punched windows, ribbon windows, a glass curtain wall,
        // and tall narrow windows between fins.
        vec2 bay = vec2(4.5, 5.5), wx = vec2(0.28, 0.72), wy = vec2(0.3, 0.75);
        if (pattern > 0.5 && pattern < 1.5) { bay = vec2(3.0, 5.0); wx = vec2(0.06, 0.94); wy = vec2(0.38, 0.8); }
        else if (pattern > 1.5 && pattern < 2.5) { bay = vec2(2.6, 4.2); wx = vec2(0.1, 0.9); wy = vec2(0.12, 0.9); }
        else if (pattern > 2.5) { bay = vec2(2.2, 4.8); wx = vec2(0.36, 0.64); wy = vec2(0.08, 0.92); }
        vec3 glass = mix(vec3(0.0023, 0.0027, 0.006), pattern > 1.5 && pattern < 2.5 ? vec3(0.012, 0.022, 0.065) : vec3(0.008, 0.012, 0.04), up * up);
        vec2 g = vec2(u / bay.x, vLocal.y / bay.y), cell = floor(g), f = fract(g);
        float px = max(fwidth(g.x), fwidth(g.y));
        float win = smoothstep(wx.x - px, wx.x + px, f.x) * (1.0 - smoothstep(wx.y - px, wx.y + px, f.x))
                  * smoothstep(wy.x - px, wy.x + px, f.y) * (1.0 - smoothstep(wy.y - px, wy.y + px, f.y));
        float cover = (wx.y - wx.x) * (wy.y - wy.x);
        float h = hash(cell + vec2(seed * 31.0 + face, seed * 17.0));
        float on = step(1.0 - litFrac, h);
        vec3 bulb = mix(wc, cool, step(0.9, hash(cell * 1.3 + seed))) * (0.7 + 0.6 * hash(cell * 2.1 + seed));
        vec3 sharp = glass + win * on * bulb * 1.25;
        vec3 average = glass + litFrac * cover * 0.6 * wc * 1.25;
        col = mix(sharp, average, clamp((px - 0.25) * 2.0, 0.0, 1.0));
        // The crown band of the tallest towers, and the street glow on the lowest floors.
        col += crown * smoothstep(vSize.y - 7.0, vSize.y - 1.5, vLocal.y) * mix(vec3(0.95, 0.97, 1.0), blue, step(1.5, crown)) * 1.5;
        col += vec3(1.0, 0.45, 0.12) * 0.05 * (1.0 - smoothstep(0.0, 16.0, vLocal.y));
      }
      col = mix(col, uHaze, smoothstep(1100.0, 5200.0, vDist) * 0.9);
      gl_FragColor = vec4(col, 1.0);
    }
  `};function C(e){return()=>{e|=0,e=e+1831565813|0;let n=Math.imul(e^e>>>15,1|e);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}function R(){const e=C(1964),n=[],S=Math.cos(F),I=Math.sin(F),x=C(2077);let w=2;const a=(i,v,d,h,m,g)=>n.push({x:S*i-I*v,z:I*i+S*v,w:d*w,d:h*w*(.9+x()*.2),h:m,info:g}),u=["plain","slab","stepped","podium","twin","spire"];for(let i=-20;i<=20;i++)for(let v=-20;v<=20;v++){const d=(i+.5)*M,h=(v+.5)*M,m=Math.hypot(d,h),g=Math.exp(-((m/300)**2));if(w=1.5+x()*.9,!(Math.abs(i+v)%2)&&e()<.1+.3*g){const y=e()+g*.25,c=y>1?240+e()*90:y>.8?150+e()*70:y>.45?75+e()*60:32+e()*35,b=Math.floor(e()*4),L=b===2,W=L?e()<.5?1:2:e()<.72?0:e()<.6?1:2,l=()=>[e(),L?.3+e()*.2:.5+e()*.4,W+4*b,0],p=u[Math.floor(e()*u.length)],T=(e()-.5)*8,k=(e()-.5)*8,r=d+T,s=h+k;if(p==="slab")a(r,s,40+e()*12,16+e()*8,c*(.55+e()*.3),l());else if(p==="stepped"){const t=34+e()*16;a(r,s,t,t*(.8+e()*.2),c*.5,l()),a(r,s,t*.74,t*.7,c*.78,l()),a(r,s,t*.48,t*.46,c,l())}else if(p==="podium"){const t=22+e()*10;a(r,s,t*1.75,t*1.5,10+e()*12,l()),a(r,s,t,t*(.85+e()*.3),c,l())}else if(p==="twin"){const t=18+e()*8;a(r-t*.62,s,t,t,c,l()),a(r+t*.62,s,t,t,c*(.62+e()*.25),l())}else if(p==="spire"){const t=24+e()*14;a(r,s,t,t,c,l()),a(r,s,2.2,2.2,c+22+e()*26,[e(),1,1,1])}else{const t=24+e()*22;a(r,s,t,t*(.7+e()*.5),c,l())}}else if(e()<.16){const y=14+e()*22,c=14+e()*22;a(d+(e()-.5)*10,h+(e()-.5)*10,y,c,6+e()*20,[e(),.35+e()*.35,(e()<.8?0:1)+4*Math.floor(e()*4),0])}}return[...n].sort((i,v)=>v.h-i.h).slice(0,6).forEach(i=>{i.info[3]=i.info[2]%4===2?2:1}),n}function $(e,{mobile:n=!1}={}){const S=n?512:768,I=Math.round(S/1.8),x=new o.WebGLRenderTarget(S,I,{samples:n?0:4});x.texture.generateMipmaps=!1,x.texture.minFilter=o.LinearFilter;const w=new o.Scene,a=new o.PerspectiveCamera(40,1.8,2,12e3),u={uHaze:{value:H},uCam:{value:a.position},uTime:{value:0}},i=new o.Mesh(new o.SphereGeometry(9e3,24,12),new o.ShaderMaterial({...D,uniforms:u,side:o.BackSide,depthWrite:!1}));i.renderOrder=-1;const v=new o.Mesh(new o.PlaneGeometry(16e3,16e3),new o.ShaderMaterial({...P,uniforms:u}));v.rotation.x=-Math.PI/2;const d=R(),h=new o.BoxGeometry(1,1,1);h.translate(0,.5,0);const m=new o.InstancedMesh(h,new o.ShaderMaterial({...N,uniforms:u}),d.length),g=new Float32Array(d.length*4),y=new o.Matrix4,c=new o.Quaternion().setFromAxisAngle(new o.Vector3(0,1,0),-F);d.forEach((t,f)=>{m.setMatrixAt(f,y.compose(new o.Vector3(t.x,0,t.z),c,new o.Vector3(t.w,t.h,t.d))),g.set(t.info,f*4)}),m.geometry.setAttribute("aInfo",new o.InstancedBufferAttribute(g,4)),m.frustumCulled=!1,w.add(i,v,m);function b(t){const f=t*.01+.9,z=540+30*Math.sin(t*.021);a.position.set(Math.sin(f)*z,255+16*Math.sin(t*.017),Math.cos(f)*z),a.lookAt(0,85,0),i.position.copy(a.position),u.uTime.value=t}function L(){const t=e.shadowMap,f=t.autoUpdate,z=t.needsUpdate,A=e.getRenderTarget();t.autoUpdate=!1,t.needsUpdate=!1,e.setRenderTarget(x),e.render(w,a),e.setRenderTarget(A),t.autoUpdate=f,t.needsUpdate=z}const W=new o.Frustum,l=new o.Matrix4,p=new o.Sphere,T=matchMedia("(prefers-reduced-motion: reduce)"),k=1/(n?20:30);let r=0,s=1/0;return b(0),{texture:x.texture,scene:w,camera:a,render(){b(r),L()},update(t,f,z){T.matches||(r+=t),s+=t,!(s<k||T.matches&&s!==1/0&&r>0)&&(l.multiplyMatrices(f.projectionMatrix,f.matrixWorldInverse),W.setFromProjectionMatrix(l),z.getWorldPosition(p.center),p.radius=2.2,!(!W.intersectsSphere(p)||p.center.distanceTo(f.position)>45)&&(s=0,b(r),L()))}}}export{$ as createAerial};
