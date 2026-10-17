(()=>{'use strict';
const $=id=>document.getElementById(id),SAVE='rounding-maze-save-v2',AWARDS='rounding-maze-awards-v1';
let s=null,question=null,choices=[],mapping=[],backtracking=false,completed=false;
const random=n=>Math.floor(Math.random()*n),shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const at=(x,y)=>y*s.n+x;
function adj(p){let x=p%s.n,y=Math.floor(p/s.n);return [[x,y-1],[x+1,y],[x,y+1],[x-1,y]].filter(([a,b])=>a>=0&&a<s.n&&b>=0&&b<s.n&&s.cells[at(a,b)]===0).map(([a,b])=>at(a,b))}
function generate(n,mode,visibility='classic'){s={n,mode,visibility,hintsLeft:3,deadEnds:[],cells:Array(n*n).fill(1),player:0,goal:0,visited:[],stars:0,moves:0,correctCount:0,history:[],backtracking:false,question:null,completed:false,feedback:'Find the one true path to the treasure!'};
function carve(x,y){s.cells[at(x,y)]=0;for(const [dx,dy] of shuffle([[0,2],[0,-2],[2,0],[-2,0]])){let nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<n-1&&ny<n-1&&s.cells[at(nx,ny)]===1){s.cells[at(x+dx/2,y+dy/2)]=0;carve(nx,ny)}}}
carve(1,n-2);let start=at(1,n-2),dist=Array(n*n).fill(-1),q=[start];dist[start]=0;
for(let i=0;i<q.length;i++)for(let v of adj(q[i]))if(dist[v]<0){dist[v]=dist[q[i]]+1;q.push(v)}
s.goal=dist.indexOf(Math.max(...dist));s.player=start;s.visited=[start];return s}
function unit(){if(s.mode==='10')return 10;if(s.mode==='100')return 100;if(s.mode==='random')return random(2)?10:100;return s.correctCount<8?10:s.correctCount<16?100:(random(2)?10:100)}
function makeQ(){let u=unit(),n=u===10?(random(890)+110):(random(899)+101),a=Math.round(n/u)*u;let vals=[a-u,a,a+u,a+2*u].filter(x=>x>=0);while(vals.length<4)vals.push(vals[vals.length-1]+u);return {n,u,a,opts:shuffle(vals)}}
function dir(a,b){let d=b-a;return d===-s.n?'⬆️':d===s.n?'⬇️':d===1?'➡️':'⬅️'}
function options(){const previous=s.history.length?s.history[s.history.length-1]:-1;return adj(s.player).filter(p=>p!==previous)}
function ensureQ(){if(!s.question)s.question=makeQ();question=s.question;backtracking=s.backtracking;completed=s.completed;choices=backtracking?[]:options();mapping=s.mapping||[];
if(!backtracking&&choices.length>1&&!mapping.length){let vals=shuffle(question.opts.slice());if(!vals.slice(0,choices.length).includes(question.a)){let i=vals.indexOf(question.a);[vals[0],vals[i]]=[vals[i],vals[0]]}mapping=choices.map((p,i)=>({p,value:vals[i]}));s.mapping=mapping}}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(s))}catch(e){}}
function awardKeys(){try{return JSON.parse(localStorage.getItem(AWARDS)||'[]')}catch(e){return []}}
function addAwards(){let a=new Set(awardKeys());a.add('first');if(s.mode==='progressive')a.add('progressive');if(s.n===31)a.add('expert');if(s.moves<=s.visited.length+10)a.add('navigator');try{localStorage.setItem(AWARDS,JSON.stringify([...a]))}catch(e){}return [...a]}
function board(){const el=$('board');el.style.gridTemplateColumns=`repeat(${s.n},minmax(0,1fr))`;el.replaceChildren();const visited=new Set(s.visited),arrowSet=new Set(!backtracking?choices:[]),revealed=new Set(visited);if(s.visibility==='hidden'){for(const p of visited){const x=p%s.n,y=Math.floor(p/s.n);for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){let xx=x+dx,yy=y+dy;if(xx>=0&&xx<s.n&&yy>=0&&yy<s.n)revealed.add(at(xx,yy))}}}const frag=document.createDocumentFragment();
for(let i=0;i<s.cells.length;i++){let d=document.createElement('div');d.className='tile '+(s.visibility==='hidden'&&!revealed.has(i)&&i!==s.goal?'fog':s.cells[i]?'wall':'floor');if(s.deadEnds&&s.deadEnds.includes(i))d.classList.add('deadend');if(visited.has(i)&&!s.cells[i])d.classList.add('trail');if(i===s.goal){d.classList.add('goal');d.textContent='🏆'}if(i===s.player){d.classList.add('player');d.textContent='🧙'}else if(arrowSet.has(i)){d.classList.add('arrow');d.textContent=dir(s.player,i)}frag.appendChild(d)}el.appendChild(frag)}
function button(label,fn){let b=document.createElement('button');b.className='answer';b.textContent=label;b.addEventListener('click',fn);$('answers').appendChild(b)}
function render(){ensureQ();board();$('stars').textContent=s.stars;$('moves').textContent=s.moves;$('explored').textContent=s.visited.length;$('difficulty').value=s.mode;$('size').value=String(s.n);$('visibility').value=s.visibility||'classic';$('hint').textContent=s.visibility==='hidden'?`💡 Hint (${s.hintsLeft} left)`:'💡 Hint';$('hint').disabled=s.visibility==='hidden'&&s.hintsLeft<=0;$('feedback').textContent=s.feedback;$('answers').replaceChildren();$('back').disabled=s.history.length===0&&!backtracking;
$('game').hidden=completed;$('victory').hidden=!completed;
const stage=s.mode==='progressive'?(s.correctCount<8?'Stage 1: Nearest 10 (8 correct to advance)':s.correctCount<16?'Stage 2: Nearest 100 (16 correct to advance)':'Stage 3: Mixed rounding'):s.mode==='random'?'Random mix: tens and hundreds':`Nearest ${s.mode} only`;
$('stage').textContent=stage;
if(completed){$('summary').textContent=`You reached the treasure in ${s.moves} moves and earned ${s.stars} stars!`;$('earned').textContent='🏅 '+addAwards().length+' achievements unlocked';return}
$('question').textContent=`Round ${question.n} to the nearest ${question.u}`;
if(backtracking){$('phase').textContent='↩ Retrace your steps — solve to go back';for(let v of question.opts)button(v.toLocaleString(),()=>respond(v));$('back').textContent='▶ Explore Again';return}
$('back').textContent='↩ Turn Around';
if(!choices.length){if(!s.deadEnds.includes(s.player))s.deadEnds.push(s.player);$('phase').textContent='🧱 Dead end';$('question').textContent='No corridor ahead. Choose Turn Around when you are ready.';return}
if(choices.length===1){$('phase').textContent='🧭 One corridor ahead';for(let v of question.opts)button(v.toLocaleString(),()=>respond(v,choices[0]));return}
$('phase').textContent='🚦 Intersection — choose your direction';for(let {p,value} of mapping)button(dir(s.player,p)+' '+value.toLocaleString(),()=>respond(value,p));}
function respond(value,target){if(completed)return;
if(backtracking){if(value!==question.a){s.feedback='Not quite. Solve this rounding question correctly to go backward.';save();render();return}if(s.history.length){s.player=s.history.pop();s.moves++;s.stars++;s.feedback='✓ One step back. You can continue retracing or explore again.'}if(!s.history.length){s.backtracking=false;s.feedback='Back at the entrance! Try a different route.'}s.question=null;s.mapping=[];save();render();return}
if(choices.length===1&&value!==question.a){s.feedback='Try again. You must round correctly to move down a single corridor.';save();render();return}
if(target===undefined)return;s.history.push(s.player);s.player=target;s.moves++;if(!s.visited.includes(target))s.visited.push(target);
if(value===question.a){s.stars++;s.correctCount++}s.feedback='You moved into another corridor. Keep exploring or turn around.';
if(s.player===s.goal){s.completed=true;s.feedback='Treasure found!'}s.question=null;s.mapping=[];save();render();}
function reset(){generate(Number($('size').value),$('difficulty').value,$('visibility').value);save();render()}
function restore(){try{let obj=JSON.parse(localStorage.getItem(SAVE)||'null');if(obj&&[15,23,31].includes(obj.n)&&Array.isArray(obj.cells)&&obj.cells.length===obj.n*obj.n&&Array.isArray(obj.history)&&Array.isArray(obj.visited)&&typeof obj.player==='number'&&typeof obj.goal==='number'&&['progressive','random','10','100'].includes(obj.mode)){s=obj;s.visibility=s.visibility||'classic';s.hintsLeft=Number.isInteger(s.hintsLeft)?s.hintsLeft:3;s.deadEnds=Array.isArray(s.deadEnds)?s.deadEnds:[];return true}}catch(e){}return false}
$('hint').addEventListener('click',()=>{if(!question||s.completed)return;if(s.visibility==='hidden'){if(s.hintsLeft<=0)return;s.hintsLeft--;}let low=Math.floor(question.n/question.u)*question.u;s.feedback=`💡 ${question.n} is between ${low} and ${low+question.u}. Halfway is ${low+question.u/2}.`;save();render()});
$('back').addEventListener('click',()=>{if(!s.history.length&&!s.backtracking)return;s.backtracking=!s.backtracking;s.question=null;s.mapping=[];s.feedback=s.backtracking?'Solve each new question to go back one step.':'Exploration resumed. Choose your next corridor.';save();render()});
$('restart').addEventListener('click',()=>{if(confirm('Start a new maze? Your current maze will be replaced.'))reset()});$('again').addEventListener('click',reset);
for(let id of ['size','difficulty','visibility'])$(id).addEventListener('change',()=>{if(confirm('Changing settings starts a new maze. Continue?'))reset();else{$('size').value=String(s.n);$('difficulty').value=s.mode;$('visibility').value=s.visibility||'classic'}});
$('achievements').addEventListener('click',()=>{let a=new Set(awardKeys()),items=[['first','🏆 First Treasure'],['progressive','📚 Progressive Explorer'],['expert','🧩 Expert Labyrinth'],['navigator','🧭 Clever Navigator']];$('awardList').replaceChildren();items.forEach(([k,label])=>{let d=document.createElement('div');d.textContent=(a.has(k)?'✓ ':'🔒 ')+label;$('awardList').appendChild(d)});$('awards').hidden=false;$('awards').scrollIntoView({behavior:'smooth',block:'nearest'})});$('closeAwards').addEventListener('click',()=>{$('awards').hidden=true});
if(!restore())generate(23,'progressive','classic');save();render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
})();
