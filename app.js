"use strict";
const projects=[
 {title:"节奏剪辑",category:"DYNAMIC EDITING / 16:9",description:"让动作、镜头与节奏，在同一刻发生。",file:"cut",ratio:"landscape",short:"DYNAMIC EDITING"},
 {title:"产品影像",category:"PRODUCT FILM / 16:9",description:"从产品细节，到空间里的视觉想象。",file:"product",ratio:"landscape",short:"PRODUCT FILM"},
 {title:"Atoms · AI 影像",category:"ATOMS / AI VISUALS / 9:16",description:"从海岸灯塔，进入想象中的宫殿。",file:"atoms",ratio:"portrait",short:"AI VISUALS"}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cinema=$("#cinema"), films=[$("#film-a"),$("#film-b")], motion=matchMedia("(prefers-reduced-motion: reduce)");
let selected=new URLSearchParams(location.search).get("film")==="atoms"?2:matchMedia("(max-width:600px)").matches?2:0, front=0, paused=motion.matches, token=0, raf=0, fillFrame=true;
const anyDialog=()=>!!document.querySelector("dialog[open]");
const allowed=()=>!paused&&!document.hidden&&!anyDialog();
function updateMotion(){
 $("#pause-preview").setAttribute("aria-pressed",String(paused));
 $("#pause-preview").setAttribute("aria-label",paused?"播放动态预览":"暂停动态预览");
 $("#pause-icon").textContent=paused?"▷":"Ⅱ";$("#pause-label").textContent=paused?"播放预览":"暂停预览";
 films.forEach((v,i)=>{if(i===front&&allowed())v.play().catch(e=>{if(e.name==="NotAllowedError"&&v===films[front]){paused=true;updateMotion()}});else v.pause()});
}
function framing(){const portrait=projects[selected].ratio==="portrait";cinema.classList.toggle("fill-frame",portrait&&fillFrame);const b=$("#frame-toggle");b.hidden=!portrait;b.setAttribute("aria-pressed",String(fillFrame));b.setAttribute("aria-label",fillFrame?"切换为原始画幅":"切换为铺满屏幕");b.innerHTML=fillFrame?"画幅：铺满 <span aria-hidden=\"true\">↔</span>":"画幅：原比例 <span aria-hidden=\"true\">↔</span>";}
function focusFrame(){if(projects[selected].ratio!=="portrait"){films[front].style.objectPosition="50% 50%";return;}const v=films[front];const portraitScreen=matchMedia("(max-aspect-ratio:1/1)").matches;const point=portraitScreen?"45% 50%":v.currentTime<3?"50% 4%":"50% 38%";v.style.objectPosition=point;}
function render(){const p=projects[selected];cinema.classList.toggle("is-portrait",p.ratio==="portrait");framing();$("#film-title").textContent=p.title;$("#film-category").textContent=p.category;$("#film-description").textContent=p.description;$("#index-count").textContent=`0${selected+1} / 03`;$("#play-film").setAttribute("aria-label",`播放${p.title}完整作品`);$$("[data-project]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.project)===selected)));$("#announcement").textContent=`正在预览：${p.title}`;const c=$(".caption");c.classList.remove("is-changing");void c.offsetWidth;c.classList.add("is-changing");}
function mediaStatus(){const v=films[front];const state=v.dataset.loadState;$("#media-error").hidden=state!=="error";$("#duration-label").textContent=state==="ready"&&Number.isFinite(v.duration)?`精选片段 / ${Math.round(v.duration)} SEC`:state==="error"?"预览加载失败":"正在载入预览";}
function progress(){cancelAnimationFrame(raf);const tick=()=>{const v=films[front];focusFrame();const ratio=v.duration?v.currentTime/v.duration:0;$$(".tab-rule i").forEach((bar,i)=>bar.style.transform=`scaleX(${i===selected?ratio:0})`);if(!v.paused&&!document.hidden)raf=requestAnimationFrame(tick)};tick()}
films.forEach(v=>{v.muted=true;v.loop=true;v.addEventListener("playing",progress);v.addEventListener("timeupdate",()=>{if(v===films[front])progress()});v.addEventListener("loadeddata",()=>{v.dataset.loadState="ready";if(v===films[front])mediaStatus()});v.addEventListener("error",()=>{v.dataset.loadState="error";if(v===films[front])mediaStatus()});});
async function showProject(index,initial=false){
 const request=++token;index=(index+projects.length)%projects.length;selected=index;render();$("#media-error").hidden=true;
 const old=films[front], next=films[initial?front:1-front], p=projects[index];
 next.pause();next.dataset.loadState="loading";next.poster=`media/${p.file}-poster.jpg`;next.src=`media/${p.file}-preview.mp4`;next.load();
 const ready=new Promise(resolve=>{const finish=()=>{next.removeEventListener("loadeddata",finish);next.removeEventListener("error",finish);clearTimeout(timer);resolve()};const timer=setTimeout(finish,4500);next.addEventListener("loadeddata",finish,{once:true});next.addEventListener("error",finish,{once:true});if(next.readyState>=2)finish()});
 if(initial){next.classList.add("is-front");updateMotion()}
 await ready;if(request!==token)return;
 front=films.indexOf(next);films.forEach(v=>v.classList.toggle("is-front",v===next));if(old!==next)setTimeout(()=>{if(request===token&&old!==films[front]){old.pause();old.removeAttribute("src");old.load()}},800);
 mediaStatus();focusFrame();
 updateMotion();progress();
}
$$("[data-project]").forEach(b=>b.addEventListener("click",()=>{if(Number(b.dataset.project)!==selected)showProject(Number(b.dataset.project))}));
$("#frame-toggle").addEventListener("click",()=>{fillFrame=!fillFrame;framing();focusFrame()});
window.addEventListener("resize",focusFrame);
$("#previous").addEventListener("click",()=>showProject(selected-1));$("#next").addEventListener("click",()=>showProject(selected+1));
$("#pause-preview").addEventListener("click",()=>{paused=!paused;updateMotion()});
motion.addEventListener("change",e=>{if(e.matches)paused=true;updateMotion()});
document.addEventListener("visibilitychange",updateMotion);
document.addEventListener("keydown",e=>{if(anyDialog())return;if(e.key==="ArrowRight"){e.preventDefault();showProject(selected+1)}if(e.key==="ArrowLeft"){e.preventDefault();showProject(selected-1)}});
const workList=$("#work-list");projects.forEach((p,i)=>{const b=document.createElement("button");b.className="work-row";b.innerHTML=`<span class="work-no">0${i+1}</span><div><h3>${p.title}</h3><p>${p.short}</p></div><img src="media/${p.file}-poster.jpg" alt="" loading="lazy"><span aria-hidden="true">↗</span>`;b.setAttribute("aria-label",`预览${p.title}`);b.addEventListener("click",()=>{$("#works-dialog").close();showProject(i)});workList.append(b)});
$$("[data-view]").forEach(b=>b.addEventListener("click",()=>{workList.classList.toggle("is-grid",b.dataset.view==="grid");$$("[data-view]").forEach(v=>v.setAttribute("aria-pressed",String(v===b)))}));
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>{$(`#${b.dataset.open}-dialog`).showModal();updateMotion()}));
$$(".close-panel").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
$$(".panel").forEach(d=>d.addEventListener("close",updateMotion));
const player=$("#player-dialog"),full=$("#full-film");
$("#play-film").addEventListener("click",()=>{const p=projects[selected];$("#player-heading").textContent=p.title;$("#full-error").hidden=true;full.poster=`media/${p.file}-poster.jpg`;full.src=`media/${p.file}-full.mp4`;player.showModal();updateMotion();full.play().catch(()=>{});});
full.addEventListener("error",()=>{if(player.open)$("#full-error").hidden=false});full.addEventListener("playing",()=>{$("#full-error").hidden=true});
$(".close-player").addEventListener("click",()=>player.close());player.addEventListener("close",()=>{full.pause();full.removeAttribute("src");full.load();updateMotion()});
showProject(selected,true);

const initialPanel=new URLSearchParams(location.search).get("panel");if(["about","contact"].includes(initialPanel)){$(`#${initialPanel}-dialog`).showModal();updateMotion();}
