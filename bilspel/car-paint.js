/* Pixel-based paint replacement: works without CanvasRenderingContext2D.filter. */
(()=>{'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function hsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0;if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h/6+1)%1}return[h,d?d/(1-Math.abs(2*l-1)):0,l]}
function rgb(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h*6%2-1)),m=l-c/2;const a=h<1/6?[c,x,0]:h<2/6?[x,c,0]:h<3/6?[0,c,x]:h<4/6?[0,x,c]:h<5/6?[x,0,c]:[c,0,x];return a.map(v=>Math.round((v+m)*255))}
function hexHsl(hex){const c=hex.match(/[a-f\d]{2}/gi);return hsl(...c.map(v=>parseInt(v,16)))}
function recolor(data,width,height,source,target,view){
 if(source===target)return data;const from=hexHsl(source),to=hexHsl(target),neutral=from[1]<.24||from[2]>.84||from[2]<.23,mask=new Uint8Array(width*height),hist=new Float64Array(128);let total=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const n=y*width+x,i=n*4;if(data[i+3]<180)continue;const nx=x/width,ny=y/height,p=hsl(data[i],data[i+1],data[i+2]);
  if(p[2]<.10||p[2]>.98)continue;
  const hueDiff=Math.min(Math.abs(p[0]-from[0]),1-Math.abs(p[0]-from[0])),floor=from[2]>.6?.30:.13;
  let weight=neutral?clamp((.32-p[1])/.14)*clamp((p[2]-floor)/.13):clamp((.15-hueDiff)/.07)*clamp((p[1]-.16)/.2);
  // Soft wheel exclusions avoid hard rectangular patches on the painted panels.
  if(neutral){const wheel=(cx,cy,rx,ry)=>clamp(((((nx-cx)/rx)**2+((ny-cy)/ry)**2)-.7)/.3);if(view===0)weight*=wheel(.57,.79,.075,.17)*wheel(.93,.69,.055,.14);else weight*=wheel(.10,.87,.11,.19)*wheel(.90,.87,.11,.19)}
  if(view===1&&p[1]>.5&&(p[0]<.10||p[0]>.94)){const lamp=cx=>((nx-cx)/.14)**2+((ny-.45)/.07)**2<1;if(lamp(.28)||lamp(.72))weight=0;}
  if(weight<.05)continue;mask[n]=Math.round(weight*255);hist[Math.min(127,Math.floor(p[2]*128))]+=weight;total+=weight;
 }
 if(!total)return data;let acc=0,median=.5;for(let k=0;k<128;k++){acc+=hist[k];if(acc>=total/2){median=(k+.5)/128;break}}
 const base=to[2]>.9?.82:to[2]<.23?.15:to[2],contrast=to[2]>.9?.65:to[2]<.23?.55:.9;
 for(let n=0;n<mask.length;n++){if(!mask[n])continue;const i=n*4,p=hsl(data[i],data[i+1],data[i+2]),l=clamp(base+(p[2]-median)*contrast,.035,.97),out=rgb(to[0],to[1]*.92,l),weight=mask[n]/255;for(let c=0;c<3;c++)data[i+c]=Math.round(data[i+c]*(1-weight)+out[c]*weight)}return data;
}
window.NightDrivePaint={recolor};
})();
