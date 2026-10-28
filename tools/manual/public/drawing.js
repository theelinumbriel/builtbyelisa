export function line(ctx, stroke) {
  const pts=stroke.points;if(!pts.length)return;ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;ctx.lineCap='round';ctx.lineJoin='round';
  if(pts.length===1){ctx.beginPath();ctx.arc(pts[0][0],pts[0][1],stroke.width/2,0,Math.PI*2);ctx.fill();return;}
  for(let i=1;i<pts.length;i++) {const a=pts[i-1],b=pts[i];ctx.lineWidth=stroke.width*(.45+.8*((a[2]??.5)+(b[2]??.5))/2);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
}
export function bounds(screen) {
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  if(screen.background){minX=0;minY=0;maxX=screen.background.width;maxY=screen.background.height;}
  for(const s of screen.strokes)for(const p of s.points){minX=Math.min(minX,p[0]-s.width);minY=Math.min(minY,p[1]-s.width);maxX=Math.max(maxX,p[0]+s.width);maxY=Math.max(maxY,p[1]+s.width);}
  return Number.isFinite(minX)?{x:minX-24,y:minY-24,w:Math.max(1,maxX-minX+48),h:Math.max(1,maxY-minY+48)}:{x:0,y:0,w:1200,h:800};
}
export function distanceToStroke(stroke,x,y){let distance=Infinity;for(let i=0;i<stroke.points.length;i++){const a=stroke.points[i],b=stroke.points[Math.min(i+1,stroke.points.length-1)];const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length)):0;distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));}return distance;}
