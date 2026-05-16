import { useEffect, useRef } from 'react';

const NaplesGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = window.innerWidth < 768 ? 400 : 600;
    };
    resize();
    window.addEventListener('resize', resize);

    let angle = 0;
    let animId: number;

    const nodes = [
      {label:'Centro Storico',lat:0.7,lon:0.5,color:'#F5A623',size:8.4,role:false},
      {label:'Posillipo',lat:0.3,lon:1.8,color:'#F5A623',size:7.2,role:false},
      {label:'Vomero',lat:0.5,lon:3.2,color:'#F5A623',size:7.2,role:false},
      {label:'Chiaia',lat:-0.2,lon:4.5,color:'#F5A623',size:7.2,role:false},
      {label:'Ischia',lat:-0.5,lon:5.8,color:'#F5A623',size:7.2,role:false},
      {label:'Procida',lat:0.4,lon:0.2,color:'#F5A623',size:6,role:false},
      {label:'Mergellina',lat:-0.3,lon:2.5,color:'#F5A623',size:6,role:false},
      {label:'Pozzuoli',lat:0.6,lon:5.0,color:'#F5A623',size:6,role:false},
      {label:'Supplier',lat:0.8,lon:2.2,color:'#7F77DD',size:12,role:true},
      {label:'Lister',lat:-0.6,lon:3.8,color:'#fbbf24',size:12,role:true},
      {label:'Provider',lat:0.2,lon:5.5,color:'#1D9E75',size:12,role:true},
      {label:'Customer',lat:-0.7,lon:1.2,color:'#D4537E',size:12,role:true},
    ];

    const connections = [
      [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
      [0,3],[1,4],[2,6],[3,5],
      [8,0],[8,1],[8,9],
      [9,0],[9,2],[9,3],[9,11],
      [10,4],[10,5],[10,11],
      [11,0],[11,3],[11,1],
      [8,10],[9,10],
    ];

    const particles: {lat:number;lon:number;size:number;opacity:number}[] = [];
    for(let i=0;i<220;i++){
      particles.push({
        lat:(Math.random()-0.5)*Math.PI,
        lon:Math.random()*Math.PI*2,
        size:Math.random()*1.2+0.3,
        opacity:Math.random()*0.5+0.15
      });
    }

    function project(lat:number,lon:number,rot:number){
      const W=canvas.width, H=canvas.height;
      const cx=W/2, cy=H/2;
      const R=Math.min(W,H)*0.38;
      const x=Math.cos(lat)*Math.cos(lon+rot);
      const y=Math.sin(lat);
      const z=Math.cos(lat)*Math.sin(lon+rot);
      return {x:cx+x*R,y:cy-y*R,z,visible:z>-0.15};
    }

    function drawFrame(rot:number){
      const W=canvas.width, H=canvas.height;
      const cx=W/2, cy=H/2;
      const R=Math.min(W,H)*0.38;
      ctx.clearRect(0,0,W,H);

      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.3);
      g.addColorStop(0,'rgba(245,166,35,0.05)');
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

      for(let lat=-60;lat<=60;lat+=20){
        ctx.beginPath(); let f=true;
        for(let l=0;l<=360;l+=4){
          const p=project(lat*Math.PI/180,l*Math.PI/180,rot);
          if(!p.visible){f=true;continue;}
          f?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); f=false;
        }
        ctx.strokeStyle='rgba(245,166,35,0.06)';
        ctx.lineWidth=0.5; ctx.stroke();
      }
      for(let l=0;l<360;l+=30){
        ctx.beginPath(); let f=true;
        for(let lat=-80;lat<=80;lat+=4){
          const p=project(lat*Math.PI/180,l*Math.PI/180,rot);
          if(!p.visible){f=true;continue;}
          f?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); f=false;
        }
        ctx.strokeStyle='rgba(245,166,35,0.04)';
        ctx.lineWidth=0.5; ctx.stroke();
      }

      particles.forEach(p=>{
        const pr=project(p.lat,p.lon,rot);
        if(!pr.visible) return;
        const a=((pr.z+1)/2)*p.opacity;
        ctx.beginPath();
        ctx.arc(pr.x,pr.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(245,166,35,${a})`;
        ctx.fill();
      });

      const projected=nodes.map((n,i)=>{
        const p=project(n.lat,n.lon,rot);
        return {...n,...p,i};
      });

      connections.forEach(([a,b])=>{
        const pa=projected[a],pb=projected[b];
        if(!pa.visible||!pb.visible) return;
        const depth=(pa.z+pb.z)/2;
        const alpha=Math.max(0,depth)*0.5;
        const isRole=a>=8||b>=8;
        ctx.beginPath();
        ctx.moveTo(pa.x,pa.y);
        const midX=(pa.x+pb.x)/2;
        const midY=(pa.y+pb.y)/2-20;
        ctx.quadraticCurveTo(midX,midY,pb.x,pb.y);
        if(isRole){
          const grad=ctx.createLinearGradient(pa.x,pa.y,pb.x,pb.y);
          grad.addColorStop(0,projected[a].color+'88');
          grad.addColorStop(1,projected[b].color+'88');
          ctx.strokeStyle=grad;
          ctx.lineWidth=1.2;
          ctx.setLineDash([5,4]);
        } else {
          ctx.strokeStyle=`rgba(245,166,35,${alpha*0.4})`;
          ctx.lineWidth=0.6;
          ctx.setLineDash([3,5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      const t=Date.now()/1000;
      connections.forEach(([a,b],idx)=>{
        const pa=projected[a],pb=projected[b];
        if(!pa.visible||!pb.visible) return;
        if(a<8&&b<8) return;
        const progress=(t*0.4+idx*0.3)%1;
        const mx=(pa.x+pb.x)/2;
        const my=(pa.y+pb.y)/2-20;
        const bx=pa.x*(1-progress)**2+2*mx*progress*(1-progress)+pb.x*progress**2;
        const by=pa.y*(1-progress)**2+2*my*progress*(1-progress)+pb.y*progress**2;
        ctx.beginPath();
        ctx.arc(bx,by,2.5,0,Math.PI*2);
        ctx.fillStyle=projected[a].color;
        ctx.fill();
      });

      projected.sort((a,b)=>a.z-b.z).forEach(n=>{
        if(!n.visible) return;
        const scale=(n.z+1.2)/2.2;
        const r=n.size*scale;
        if(n.role){
          const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*4);
          g.addColorStop(0,n.color+'55');
          g.addColorStop(1,'transparent');
          ctx.fillStyle=g;
          ctx.beginPath();
          ctx.arc(n.x,n.y,r*4,0,Math.PI*2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x,n.y,r,0,Math.PI*2);
          ctx.fillStyle=n.color;
          ctx.fill();
          const fs=Math.round(10*scale+3);
          ctx.font=`500 ${fs}px sans-serif`;
          ctx.fillStyle='#ffffff';
          ctx.textAlign='center';
          ctx.fillText(n.label,n.x,n.y-r-5);
        } else {
          ctx.beginPath();
          ctx.arc(n.x,n.y,r*0.7,0,Math.PI*2);
          ctx.fillStyle=n.color+'cc';
          ctx.fill();
          const fs=Math.round(8*scale+2);
          ctx.font=`${fs}px sans-serif`;
          ctx.fillStyle=`rgba(245,166,35,${scale*0.9})`;
          ctx.textAlign='center';
          ctx.fillText(n.label,n.x,n.y-r*0.7-4);
        }
      });

      const pulse=0.8+Math.sin(t*3)*0.2;
      ctx.beginPath();
      ctx.arc(cx,cy,10*pulse,0,Math.PI*2);
      ctx.fillStyle='#F5A623';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx,cy,18*pulse,0,Math.PI*2);
      ctx.strokeStyle='rgba(245,166,35,0.3)';
      ctx.lineWidth=1.5; ctx.stroke();
      ctx.font='bold 12px sans-serif';
      ctx.fillStyle='#F5A623';
      ctx.textAlign='center';
      ctx.fillText('Naples',cx,cy-22);
    }

    function loop(){
      angle+=0.003;
      drawFrame(angle);
      animId=requestAnimationFrame(loop);
    }
    loop();

    return()=>{
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',resize);
    };
  },[]);

  return (
    <section className="py-8 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 text-center mb-4">
        <p className="text-[#F5A623] text-sm font-semibold uppercase tracking-widest mb-3">
          Our Ecosystem
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          The Naples <span className="text-[#F5A623]">Network</span>
        </h2>
        <p className="text-[#94a3b8] max-w-xl mx-auto text-base">
          Suppliers, Listers, Providers and Customers — 
          all connected across Naples neighborhoods
        </p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{background:'#0f172a'}}
      />
    </section>
  );
};

export default NaplesGlobe;
