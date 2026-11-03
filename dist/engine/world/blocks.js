import*as t from"three";import*as y from"@world/layout.js";const v=y.POOL,d=y.POOL_LAMPS||{xs:[],y:0},b=`
  varying vec3 vTex;
  varying float vEmissive;
  varying vec3 vSurfacePosition;
`,S=`
  attribute vec3 iLayers;
  attribute float iEmissive;
`,w=`
  #include <begin_vertex>
  {
    mat4 im = instanceMatrix;
    vec3 scaleXYZ = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
    vec3 lp = (position + 0.5) * scaleXYZ;
    vec3 an = abs(normal);
    if (an.y > 0.5) vTex = vec3(lp.x, lp.z, normal.y > 0.0 ? iLayers.x : iLayers.z);
    else if (an.x > 0.5) vTex = vec3(normal.x > 0.0 ? scaleXYZ.z - lp.z : lp.z, lp.y, iLayers.y);
    else vTex = vec3(normal.z > 0.0 ? lp.x : scaleXYZ.x - lp.x, lp.y, iLayers.y);
    vEmissive = iEmissive;
  }
`,T=`
  attribute vec2 tileUv;
  attribute float tileLayer;
`,P=`
  #include <begin_vertex>
  vTex = vec3(tileUv, tileLayer);
  vEmissive = 0.0;
`,E=`
  attribute vec3 iLayers;
  uniform float uTime;
`,L=`
  #include <begin_vertex>
  {
    vec3 base = instanceMatrix[3].xyz;
    float sway = sin(uTime * 1.7 + base.x * 0.7 + base.z * 0.5) * 0.06 + sin(uTime * 3.1 + base.z) * 0.02;
    transformed.x += sway * uv.y;
    transformed.z += sway * 0.6 * uv.y;
    vTex = vec3(uv, iLayers.x);
    vEmissive = 0.0;
  }
`,M=`
  uniform highp sampler2DArray uTiles;
  uniform float uEmissiveBoost;
  uniform sampler2D uMarble;
  uniform float uMarbleLayer;
  uniform sampler2D uShelter;
  uniform vec4 uShelterBox;
  uniform float uWet;
  uniform float uSnow;
  uniform vec3 uSkyTint;
  uniform sampler2D uCaustics;
  uniform vec4 uPoolLight;
  uniform float uPoolTime;
  varying vec3 vTex;
  varying float vEmissive;
  varying vec3 vSurfacePosition;
`,f=h=>h.toFixed(3),C=v?`
  #ifndef BLOCK_GLASS
  if (vSurfacePosition.y < ${f(v.water)} && vSurfacePosition.x > ${f(v.x0-.05)} && vSurfacePosition.x < ${f(v.x1+.05)}
    && vSurfacePosition.z > ${f(v.z0-.05)} && vSurfacePosition.z < ${f(v.z1+.05)}) {
    float poolDepth = ${f(v.water)} - vSurfacePosition.y;
    // Walls take the pattern on their own plane, stretched down from the surface.
    vec3 poolNormal = abs(inverseTransformDirection(normal, viewMatrix));
    vec2 litFrom = (poolNormal.y > 0.5 ? vSurfacePosition.xz : poolNormal.x > 0.5 ? vec2(vSurfacePosition.z, poolDepth * 1.6) : vec2(vSurfacePosition.x, poolDepth * 1.6)) + uPoolLight.xy * poolDepth;
    // Caustics: two slowly drifting fields of smooth noise, each drawing a
    // bright, wandering line where it crosses its middle. Their lines cross
    // into an uneven net, brightest where they meet; a broad, slower field
    // makes some stretches of the floor glow and others go quiet. The walls,
    // which the light only grazes, catch a little just under the surface.
    vec2 web = litFrom * 0.2;
    web += 0.07 * vec2(sin(web.y * 3.1 + uPoolTime * 0.5), cos(web.x * 2.7 - uPoolTime * 0.4));
    float lineA = 1.0 - abs(texture2D(uCaustics, web + uPoolTime * vec2(0.011, 0.006)).r * 2.0 - 1.0);
    float lineB = 1.0 - abs(texture2D(uCaustics, web * 1.37 + vec2(0.41, 0.17) - uPoolTime * vec2(0.008, 0.012)).r * 2.0 - 1.0);
    float swell = smoothstep(0.3, 0.72, texture2D(uCaustics, litFrom * 0.045 + uPoolTime * vec2(0.003, 0.002)).r);
    float caustic = min(1.2, (pow(lineA, 10.0) + pow(lineB, 10.0) * 0.7 + 0.8 * pow(lineA * lineB, 5.0)) * (0.2 + 0.9 * swell))
      * (poolNormal.y > 0.5 ? 1.0 : 0.4 * (1.0 - smoothstep(0.15, 1.3, poolDepth)));
    float lamps = 0.35 + 0.4 * exp((${f(v.z0)} - vSurfacePosition.z) * 0.4);
    ${d.xs.map(h=>`{ vec3 toLamp = vSurfacePosition - vec3(${f(h)}, ${f(d.y)}, ${f(v.z0)}); lamps += 0.9 / (1.0 + dot(toLamp, toLamp) * 1.2); }`).join(`
    `)}
    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.82, 0.93, 0.97), min(poolDepth / 2.8, 1.0));
    totalEmissiveRadiance += diffuseColor.rgb * (caustic * uPoolLight.z * 0.95 + lamps * uPoolLight.w * vec3(0.6, 0.9, 0.97));
  }
  #endif
`:"",z=`
  vec4 tileTexel = texture(uTiles, vTex);
  if (abs(vTex.z - uMarbleLayer) < 0.5) {
    vec3 stoneNormal = abs(inverseTransformDirection(normalize(vNormal), viewMatrix));
    vec2 slab = stoneNormal.y > 0.5 ? vSurfacePosition.xz :
      stoneNormal.x > 0.5 ? vSurfacePosition.zy : vSurfacePosition.xy;
    tileTexel = texture2D(uMarble, slab / 16.0);
  }
  diffuseColor *= tileTexel;
  #ifdef CUTOUT
    if (diffuseColor.a < 0.5) discard;
  #endif
`,_=`
  float weatherSheen = 0.0;
  #ifndef BLOCK_GLASS
  if (uWet + uSnow > 0.0 && vEmissive <= 0.0) {
    vec3 skyNormal = inverseTransformDirection(normal, viewMatrix);
    vec3 skyProbe = vSurfacePosition + skyNormal * 0.35;
    float shelterTop = texture2D(uShelter, (skyProbe.xz - uShelterBox.xy) * uShelterBox.zw).r * 63.75 - 2.0;
    float open = step(shelterTop - 0.6, skyProbe.y);
    float up = smoothstep(0.55, 0.85, skyNormal.y);
    float block = fract(sin(dot(floor(vSurfacePosition.xz), vec2(12.9898, 78.233))) * 43758.5453);
    float snowCover = open * up * step(block, uSnow);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.94, 0.96, 0.98), snowCover);
    float wetness = uWet * open * (1.0 - snowCover);
    diffuseColor.rgb *= 1.0 - wetness * mix(0.16, 0.34, up);
    weatherSheen = wetness * up;
  }
  #endif
  #include <emissivemap_fragment>
  totalEmissiveRadiance += diffuseColor.rgb * vEmissive * uEmissiveBoost;
`+C,A=`
  #include <project_vertex>
  vec4 glassPosition = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    glassPosition = instanceMatrix * glassPosition;
  #endif
  vSurfacePosition = (modelMatrix * glassPosition).xyz;
`,D=`
  float glassRim = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0);
  vec3 glassNormal = abs(inverseTransformDirection(normal, viewMatrix));
  vec2 pane = glassNormal.y > 0.5 ? vSurfacePosition.xz :
    glassNormal.x > 0.5 ? vSurfacePosition.zy : vSurfacePosition.xy;
  float diagonal = pane.x * 0.65 + pane.y;
  float glassHighlight = smoothstep(3.2, 3.8, diagonal) * (1.0 - smoothstep(5.2, 5.8, diagonal));
  float overheadGlass = step(0.5, glassNormal.y);
  outgoingLight = mix(outgoingLight, vec3(0.44, 0.63, 0.69), mix(0.6, 0.28, overheadGlass));
  outgoingLight += vec3(0.18, 0.23, 0.25) * glassRim + vec3(0.22) * glassHighlight;
  float glassNear = 1.0 - smoothstep(1.0, 7.0, length(vViewPosition));
  diffuseColor.a = min(0.48, diffuseColor.a * mix(1.0, 0.52, overheadGlass) + glassRim * 0.18 + glassHighlight * 0.08 + glassNear * mix(0.07, 0.025, overheadGlass));
  #include <opaque_fragment>
`,B=`
  if (weatherSheen > 0.0) {
    float sheenFresnel = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 5.0);
    outgoingLight = mix(outgoingLight, uSkyTint, weatherSheen * (0.05 + 0.5 * sheenFresnel));
  }
  #include <opaque_fragment>
`;function N(h,c,x){const a={uTiles:{value:h},uMarble:{value:c},uMarbleLayer:{value:x},uEmissiveBoost:{value:1},uTime:{value:0}},n=new t.DataTexture(new Uint8Array([0]),1,1,t.RedFormat,t.UnsignedByteType);n.needsUpdate=!0,Object.assign(a,{uShelter:{value:n},uShelterBox:{value:new t.Vector4(0,0,1,1)},uWet:{value:0},uSnow:{value:0},uSkyTint:{value:new t.Color(10466488)}}),Object.assign(a,{uCaustics:{value:n},uPoolLight:{value:new t.Vector4},uPoolTime:{value:0}});const m={box:[S,w],voxel:[T,P],cross:[E,L]};function u(s,{cutout:o=!1,transparent:r=!1,opacity:g=1}={}){const l=new t.MeshLambertMaterial({vertexColors:s==="voxel",transparent:r,opacity:g,depthWrite:!r,side:s==="cross"||s==="voxel"&&r?t.DoubleSide:t.FrontSide});return o&&(l.defines={CUTOUT:""}),r&&(l.defines={BLOCK_GLASS:""}),l.onBeforeCompile=i=>{for(const p of["uShelter","uShelterBox","uWet","uSnow","uSkyTint","uCaustics","uPoolLight","uPoolTime"])i.uniforms[p]=a[p];i.uniforms.uTiles=a.uTiles,i.uniforms.uEmissiveBoost=a.uEmissiveBoost,i.uniforms.uTime=a.uTime,i.uniforms.uMarble=a.uMarble,i.uniforms.uMarbleLayer=a.uMarbleLayer,i.vertexShader=b+m[s][0]+i.vertexShader.replace("#include <begin_vertex>",m[s][1]).replace("#include <project_vertex>",A),i.fragmentShader=M+i.fragmentShader.replace("#include <map_fragment>",z).replace("#include <emissivemap_fragment>",_),r?i.fragmentShader=i.fragmentShader.replace("#include <opaque_fragment>",D):i.fragmentShader=i.fragmentShader.replace("#include <opaque_fragment>",B)},l.customProgramCacheKey=()=>`${s}-${o}-${r}`,l}function e(s){const o=new t.MeshDepthMaterial({depthPacking:t.RGBADepthPacking});return o.onBeforeCompile=r=>{r.uniforms.uTiles=a.uTiles,r.uniforms.uTime=a.uTime,r.vertexShader=b+m[s][0]+r.vertexShader.replace("#include <begin_vertex>",m[s][1]),r.fragmentShader=`uniform highp sampler2DArray uTiles;
varying vec3 vTex;
varying float vEmissive;
`+r.fragmentShader.replace("#include <alphatest_fragment>","if (texture(uTiles, vTex).a < 0.5) discard;")},o.customProgramCacheKey=()=>`depth-${s}`,o}return{uniforms:a,voxel:u("voxel"),voxelCutout:u("voxel",{cutout:!0}),voxelGlass:u("voxel",{transparent:!0}),box:u("box"),boxCutout:u("box",{cutout:!0}),boxGlass:u("box",{transparent:!0}),cross:u("cross",{cutout:!0}),voxelDepth:e("voxel"),boxDepth:e("box")}}class R{constructor(c){this.layer=c,this.items={opaque:[],metal:[],cutout:[],glass:[]},this.stack=[new t.Matrix4]}at(c,x,a,n,m){const u=new t.Matrix4().makeRotationY(n||0).setPosition(c,x,a);this.stack.push(this.stack[this.stack.length-1].clone().multiply(u)),m(),this.stack.pop()}box(c,x,a,n,m,u,e,s={}){const{top:o=e.top??e.tex,side:r=e.side??e.tex,bottom:g=e.bottom??e.top??e.tex}=e,l=new t.Matrix4,i=new t.Matrix4().compose(new t.Vector3(c,x+m/2,a),new t.Quaternion().setFromEuler(new t.Euler(s.rx||0,s.ry||0,s.rz||0,s.order||"XYZ")),new t.Vector3(Math.max(n,.001),Math.max(m,.001),Math.max(u,.001)));l.multiplyMatrices(this.stack[this.stack.length-1],i);const p=e.glass?"glass":e.cutout?"cutout":e.metal?"metal":"opaque";return this.items[p].push({matrix:l,layers:[this.layer[o],this.layer[r],this.layer[g]],color:new t.Color(e.tint??16777215),emissive:e.emissive||0,tag:s.tag||null,shadow:s.shadow!==!1&&!e.emissive}),l}build(c){const x=new t.BoxGeometry(1,1,1),a=[];for(const[n,m]of Object.entries(this.items))for(const u of[!0,!1]){const e=m.filter(l=>l.shadow===u);if(!e.length)continue;const s=n==="glass"?c.boxGlass:n==="cutout"?c.boxCutout:n==="metal"?c.boxMetal:c.box,o=new t.InstancedMesh(x,s,e.length),r=new Float32Array(e.length*3),g=new Float32Array(e.length);e.forEach((l,i)=>{o.setMatrixAt(i,l.matrix),o.setColorAt(i,l.color),r.set(l.layers,i*3),g[i]=l.emissive}),o.geometry=x.clone(),o.geometry.setAttribute("iLayers",new t.InstancedBufferAttribute(r,3)),o.geometry.setAttribute("iEmissive",new t.InstancedBufferAttribute(g,1)),o.castShadow=u&&n!=="glass",o.receiveShadow=n!=="glass",n==="cutout"&&(o.customDepthMaterial=c.boxDepth),o.instanceMatrix.needsUpdate=!0,o.computeBoundingSphere(),o.userData.tags=e.map(l=>l.tag),o.matrixAutoUpdate=!1,n==="glass"&&(o.renderOrder=2),a.push(o)}return a}}export{R as BoxBatch,N as createBlockMaterials};
