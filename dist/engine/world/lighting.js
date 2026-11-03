import*as v from"three";import*as R from"@world/layout.js";const V=4,O=s=>s.toFixed(3);function W(s){if(s)return s;const n=R.ISLAND,C=[n.x0,-1,n.z0],g=[n.x1-n.x0,12,n.z1-n.z0];return{min:C,extent:g,size:[Math.ceil(g[0]),12,Math.ceil(g[2])]}}const Z=`
  uniform highp sampler3D uInteriorLight;
  uniform float uInteriorBoost;
  uniform vec3 uInteriorColor;
  varying vec3 vInteriorPosition;
`,J=`
  #include <project_vertex>
  vec4 interiorPosition = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    interiorPosition = instanceMatrix * interiorPosition;
  #endif
  vInteriorPosition = (modelMatrix * interiorPosition).xyz;
`,Q=(s,n)=>`
  #include <emissivemap_fragment>
  vec3 interiorNormal = inverseTransformDirection(normal, viewMatrix);
  // Sample on the lit side of walls/floors; solid cells carry no irradiance.
  vec3 lightUV = (vInteriorPosition + interiorNormal * 0.45 - vec3(${s.map(O)})) / vec3(${n.map(O)});
  if (uInteriorBoost > 0.0 && all(greaterThan(lightUV, vec3(0.0))) && all(lessThan(lightUV, vec3(1.0)))) {
    vec4 field = texture(uInteriorLight, lightUV);
    // First-order directional coefficients keep tops brighter than undersides.
    vec3 direction = (field.gba - vec3(128.0 / 255.0)) * 8.0;
    float irradiance = max(0.0, field.r * 4.0 + dot(interiorNormal, direction));
    totalEmissiveRadiance += diffuseColor.rgb * uInteriorColor * irradiance * uInteriorBoost;
  }
`;function Y(s,n,C=null){const g=performance.now(),{min:x,extent:M,size:_}=W(C),$=Q(x,M),f=R.HOUSE,[y,I,S]=_,d=new Uint8Array(y*I*S*4),j=s.types.map(e=>!!e&&e.kind==="opaque"&&!e.noOcclude),L=(e,t,i)=>j[s.get(Math.floor(e),Math.floor(t),Math.floor(i))];function G(e,t,i,o,c,l,m){const E=Math.ceil(m/.65);for(let u=1;u<E;u++){const p=u/E;if(L(e+o*p,t+c*p,i+l*p))return!0}return!1}const H=n.map(e=>({...e,direction:e.direction?new v.Vector3(...e.direction).normalize().toArray():null})),P=e=>Math.max(0,Math.min(255,Math.round(128+e*255/(V*2))));let k=0;for(let e=0;e<S;e++)for(let t=0;t<I;t++)for(let i=0;i<y;i++){const o=x[0]+(i+.5)*M[0]/y,c=x[1]+(t+.5)*M[1]/I,l=x[2]+(e+.5)*M[2]/S;let m=0,E=0,u=0,p=0;if(!L(o,c,l)){f&&o>f.x0&&o<f.x1&&l>f.z0&&l<f.z1&&c>0&&c<f.height&&(m=.095);for(const a of H){const N=a.position[0]-o,T=a.position[1]-c,U=a.position[2]-l,h=Math.hypot(N,T,U);if(h>=a.radius||G(o,c,l,N,T,U,h))continue;const w=1/Math.max(h,.1),D=1-(h/a.radius)**2;let z=a.power*D*D/(1+h*h*.12);if(a.direction){const X=-(N*a.direction[0]+T*a.direction[1]+U*a.direction[2])*w,B=Math.max(0,Math.min(1,(X-.05)/.8));z*=.16+.84*B*B*(3-2*B)}m+=z*.6,E+=z*N*w*.4,u+=z*T*w*.4,p+=z*U*w*.4}}k=Math.max(k,m);const A=(i+y*(t+I*e))*4;d[A]=Math.round(Math.min(1,m/V)*255),d[A+1]=P(E),d[A+2]=P(u),d[A+3]=P(p)}const r=new v.Data3DTexture(d,y,I,S);r.name="interior-irradiance",r.format=v.RGBAFormat,r.type=v.UnsignedByteType,r.minFilter=r.magFilter=v.LinearFilter,r.generateMipmaps=!1,r.unpackAlignment=1,r.needsUpdate=!0;const b={uInteriorLight:{value:r},uInteriorBoost:{value:0},uInteriorColor:{value:new v.Color(16773081)}},F=new WeakSet;function q(e){if(!(e!=null&&e.isMeshLambertMaterial)||e.transparent||F.has(e))return;F.add(e);const t=e.onBeforeCompile,i=e.customProgramCacheKey();e.onBeforeCompile=function(o,c){t.call(this,o,c),Object.assign(o.uniforms,b),o.vertexShader=`varying vec3 vInteriorPosition;
`+o.vertexShader.replace("#include <project_vertex>",J),o.fragmentShader=Z+o.fragmentShader.replace("#include <emissivemap_fragment>",$)},e.customProgramCacheKey=()=>`${i}-interior-irradiance-v1-${x.join()}-${M.join()}`,e.needsUpdate=!0}function K(e){e.traverse(t=>{for(const i of Array.isArray(t.material)?t.material:[t.material])q(i)})}return{texture:r,uniforms:b,apply:K,sources:n,stats:{sources:n.length,bytes:d.byteLength,bakeMs:performance.now()-g,peak:k}}}export{Y as createInteriorLighting};
