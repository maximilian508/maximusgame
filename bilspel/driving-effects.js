/* Rolling rear tyre treads and speed feedback. No changes to the source car photographs. */
(()=>{'use strict';
let vibrating=false,nextPulse=0,lastCanvas=null,enabled=true,focused=true;
function setEnabled(value){enabled=Boolean(value);if(!enabled)stopFeedback()}
function stopFeedback(){if(vibrating&&typeof navigator.vibrate==='function'){try{navigator.vibrate(0)}catch{}}vibrating=false;nextPulse=0;if(lastCanvas)lastCanvas.style.transform='';}
function speedFeedback(speed,running,canvas,now=performance.now()){
 if(lastCanvas&&lastCanvas!==canvas)lastCanvas.style.transform='';lastCanvas=canvas;
 if(!enabled||!running||!focused||!Number.isFinite(speed)||speed<=200||document.hidden){stopFeedback();return}
 if(typeof navigator.vibrate==='function'&&now>=nextPulse){try{const pulse=Math.round(Math.min(48,26+(speed-200)*.12));vibrating=navigator.vibrate([pulse,24,pulse])||vibrating}catch{}nextPulse=now+220}
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(canvas&&!reduced){const strength=Math.min(1.8,.75+(speed-200)/180);canvas.style.transform=`translate(${(Math.sin(now*.069)*strength).toFixed(2)}px,${(Math.sin(now*.091)*strength*.65).toFixed(2)}px) scale(1.004)`}
}
window.addEventListener('blur',()=>{focused=false;stopFeedback()});window.addEventListener('focus',()=>{focused=true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFeedback()});window.addEventListener('pagehide',stopFeedback);
function attachRollingTyres(root,sprite,carPlane,B){
 const width=sprite.width,height=sprite.height,mask=document.createElement('canvas');mask.width=width;mask.height=height;
 const c=mask.getContext('2d',{willReadFrequently:true});c.drawImage(sprite,0,0);const data=c.getImageData(0,0,width,height),p=data.data;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,n=x/width,edge=(n>.012&&n<.16)||(n>.84&&n<.988),max=Math.max(p[i],p[i+1],p[i+2]),min=Math.min(p[i],p[i+1],p[i+2]),tyre=edge&&y>height*.72&&max<105&&max-min<32&&p[i+3]>150;p[i]=p[i+1]=p[i+2]=255;p[i+3]=tyre?220:0}c.putImageData(data,0,0);
 const scene=root.getScene(),texture=new B.DynamicTexture('moving tyre tread',{width,height},scene,false);texture.hasAlpha=true;
 const mat=new B.StandardMaterial('rolling tyre overlay',scene);mat.diffuseTexture=texture;mat.emissiveColor=B.Color3.White();mat.disableLighting=true;mat.useAlphaFromDiffuseTexture=true;mat.backFaceCulling=false;
 const overlay=carPlane.clone('rolling rear tyre treads',root);overlay.material=mat;overlay.position.z-=.006;overlay.isPickable=false;
 root.metadata.rollingTyres={mask,texture,width,height,lastDistance:NaN,lastTick:-1};
}
function drawTyreTread(c,mask,width,height,distance){
 const spacing=Math.max(8,height*.033),phase=((distance*10)%spacing+spacing)%spacing;
 c.clearRect(0,0,width,height);c.fillStyle='#02050a70';c.fillRect(0,0,width,height);c.strokeStyle='#a8b5cbaa';c.lineWidth=Math.max(1.2,width/340);
 for(let y=height*.68-spacing+phase;y<height+spacing;y+=spacing){c.beginPath();c.moveTo(0,y);c.lineTo(width*.18,y+spacing*.6);c.moveTo(width*.82,y+spacing*.6);c.lineTo(width,y);c.stroke();c.strokeStyle='#02050abb';c.lineWidth=Math.max(1,width/420);c.beginPath();c.moveTo(0,y+spacing*.35);c.lineTo(width*.18,y+spacing*.9);c.moveTo(width*.82,y+spacing*.9);c.lineTo(width,y+spacing*.35);c.stroke();c.strokeStyle='#a8b5cbaa';c.lineWidth=Math.max(1.2,width/340)}
 c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';
}
function updateRollingTyres(root,distance,running,now=performance.now()){
 const t=root?.metadata?.rollingTyres;if(!t||!running||!Number.isFinite(distance)||distance===t.lastDistance||now-t.lastTick<24)return;
 const c=t.texture.getContext();drawTyreTread(c,t.mask,t.width,t.height,distance);
 t.texture.update();t.lastDistance=distance;t.lastTick=now;
}
window.NightDriveEffects={speedFeedback,stopFeedback,setEnabled,attachRollingTyres,updateRollingTyres,drawTyreTread};
})();
