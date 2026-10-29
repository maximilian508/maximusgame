/* Rolling rear tyre treads and speed feedback. No changes to the source car photographs. */
(()=>{'use strict';
let vibrating=false,nextPulse=0,lastCanvas=null;
function stopFeedback(){if(vibrating&&typeof navigator.vibrate==='function'){try{navigator.vibrate(0)}catch{}}vibrating=false;nextPulse=0;if(lastCanvas)lastCanvas.style.transform='';}
function speedFeedback(speed,running,canvas,now=performance.now()){
 if(lastCanvas&&lastCanvas!==canvas)lastCanvas.style.transform='';lastCanvas=canvas;
 if(!running||!Number.isFinite(speed)||speed<=200||document.hidden){stopFeedback();return}
 if(typeof navigator.vibrate==='function'&&now>=nextPulse){try{vibrating=navigator.vibrate(24)||vibrating}catch{}nextPulse=now+160}
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(canvas&&!reduced){const strength=Math.min(.9,.35+(speed-200)/250);canvas.style.transform=`translate(${(Math.sin(now*.069)*strength).toFixed(2)}px,${(Math.sin(now*.091)*strength*.65).toFixed(2)}px) scale(1.004)`}
}
window.addEventListener('blur',stopFeedback);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFeedback()});window.addEventListener('pagehide',stopFeedback);
function attachRollingTyres(root,sprite,carPlane,B){
 const width=sprite.width,height=sprite.height,mask=document.createElement('canvas');mask.width=width;mask.height=height;
 const c=mask.getContext('2d',{willReadFrequently:true});c.drawImage(sprite,0,0);const data=c.getImageData(0,0,width,height),p=data.data;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,n=x/width,edge=(n>.012&&n<.16)||(n>.84&&n<.988),max=Math.max(p[i],p[i+1],p[i+2]),min=Math.min(p[i],p[i+1],p[i+2]),tyre=edge&&y>height*.72&&max<105&&max-min<32&&p[i+3]>150;p[i]=p[i+1]=p[i+2]=255;p[i+3]=tyre?220:0}c.putImageData(data,0,0);
 const scene=root.getScene(),texture=new B.DynamicTexture('moving tyre tread',{width,height},scene,false);texture.hasAlpha=true;
 const mat=new B.StandardMaterial('rolling tyre overlay',scene);mat.diffuseTexture=texture;mat.emissiveColor=B.Color3.White();mat.disableLighting=true;mat.useAlphaFromDiffuseTexture=true;mat.backFaceCulling=false;
 const overlay=carPlane.clone('rolling rear tyre treads',root);overlay.material=mat;overlay.position.z-=.006;overlay.isPickable=false;
 root.metadata.rollingTyres={mask,texture,width,height,lastDistance:NaN,lastTick:-1};
}
function updateRollingTyres(root,distance,running,now=performance.now()){
 const t=root?.metadata?.rollingTyres;if(!t||!running||!Number.isFinite(distance)||distance===t.lastDistance||now-t.lastTick<32)return;
 const c=t.texture.getContext(),spacing=Math.max(7,t.height*.027),phase=((distance*3.7)%spacing+spacing)%spacing;
 c.clearRect(0,0,t.width,t.height);c.fillStyle='#00000018';c.fillRect(0,0,t.width,t.height);c.strokeStyle='#85929c70';c.lineWidth=Math.max(1,t.width/430);
 for(let y=t.height*.7-spacing+phase;y<t.height+spacing;y+=spacing){c.beginPath();c.moveTo(0,y);c.lineTo(t.width*.18,y+spacing*.6);c.moveTo(t.width*.82,y+spacing*.6);c.lineTo(t.width,y);c.stroke()}
 c.globalCompositeOperation='destination-in';c.drawImage(t.mask,0,0);c.globalCompositeOperation='source-over';t.texture.update();t.lastDistance=distance;t.lastTick=now;
}
window.NightDriveEffects={speedFeedback,stopFeedback,attachRollingTyres,updateRollingTyres};
})();
