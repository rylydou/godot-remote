(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function r(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(t){if(t.ep)return;t.ep=!0;const o=r(t);fetch(t.href,o)}})();function G(n,e){const r=n.parentElement;if(!r)throw new Error("This canvas has no parent.");const i=new ResizeObserver((t,o)=>{J(n,t[0]),e&&e()});try{i.observe(r,{box:"device-pixel-content-box"})}catch{i.observe(r,{box:"content-box"})}return{destroy(){i.disconnect()}}}function J(n,e){if(e.devicePixelContentBoxSize){n.width=Math.round(e.devicePixelContentBoxSize[0].inlineSize),n.height=Math.round(e.devicePixelContentBoxSize[0].blockSize);return}let r=window.devicePixelRatio;if(e.contentBoxSize){if(e.contentBoxSize[0]){n.width=Math.round(e.contentBoxSize[0].inlineSize*r),n.height=Math.round(e.contentBoxSize[0].blockSize*r);return}n.width=Math.round(e.contentBoxSize.inlineSize*r),n.height=Math.round(e.contentBoxSize.blockSize*r);return}n.width=Math.round(e.contentRect.width*r),n.height=Math.round(e.contentRect.height*r)}const K=20,U=3e3,A=16,x="gremote:session_id";function F(n){const e={api:n(t=>e.send_packet(t)),send_packet(t){e.ws&&e.ws.send(t)},ws:null,ws_address:"",auto_reconnect:!0,is_connected:!1,status:"Connecting...",connect(t){e.ws&&e.ws.readyState!=3&&e.ws.close(1e3,"Automatic close due to error."),e.ws_address=t,e.ws=new WebSocket(t),i()},on_status_change:()=>{},session_id:0,ongoing_pings:0,last_pong_timestamp:0,last_ping:0,ping_sum:0,ping_count:0,get_avg_ping:()=>e.ping_sum/Math.max(e.ping_count,1),ping_server(){e.ongoing_pings++,e.api.send_ping(Date.now())}},r=Math.floor(Math.random()*1e5);e.session_id=Number(sessionStorage.getItem(x)||r),sessionStorage.setItem(x,e.session_id.toString()),e.api.receive_ping=t=>{e.api.send_pong(t,Date.now())},e.api.receive_pong=(t,o)=>{const c=Date.now(),f=c-t;e.ongoing_pings--,e.last_ping=f,e.last_pong_timestamp=c,e.ping_sum+=f,e.ping_count++};function i(){if(!e.ws){console.error("[Websocket] Cannot listen to WebSocket client. One has not been made made.");return}e.ws.onmessage=t=>{console.debug("[WebSocket] Message: ",t.data),e.api.handle_packet(t.data)},e.ws.onopen=t=>{console.log("[WebSocket] Opened"),e.status="Connected",e.is_connected=!0,e.on_status_change&&e.on_status_change(),e.api.send_session(e.session_id)},e.ws.onclose=t=>{console.log("[WebSocket] Closed: ",{code:t.code,reason:t.reason,was_clean:t.wasClean}),e.status="Disconnected",e.is_connected=!1,e.on_status_change&&e.on_status_change()},e.ws.onerror=t=>{console.error("[WebSocket] Error: ",t),e.status="Error: "+t.toString(),e.is_connected=!1,e.on_status_change&&e.on_status_change(),e.auto_reconnect&&e.connect(e.ws_address)}}return e}function X(n,e){return n*n+e*e}function Y(n,e){return Math.sqrt(n*n+e*e)}function D(n,e,r,i){const t=r-n,o=i-e;return X(t,o)}function Z(n,e,r){const i=Y(n,e),t=Math.min(i,r)/i;return[n*t,e*t]}function H(n,e){return Math.atan2(e,n)}function Q(n,e){return[Math.cos(n)*e,Math.sin(n)*e]}function C(n,e,r){const i=(r==null?void 0:r.label)||"",t=(r==null?void 0:r.center_x)||0,o=(r==null?void 0:r.center_y)||0,c=(r==null?void 0:r.radius)||3,f=.5;let l=0,_=!1,p=!1;const k={client:n,sync(a){n.is_connected&&(!a&&p==_||(p=_,n.api.send_input_btn(e,p)))},down(a,M,w){_||D(t,o,a,M)<=c*c&&(_=!0,l=w,k.sync(!1))},up(a,M,w){_&&w==l&&(_=!1,k.sync(!1))},render(a){a.translate(t,o),a.beginPath(),a.ellipse(0,0,c,c,0,0,7),_&&a.fill(),a.lineWidth=f,a.stroke(),_&&(a.globalCompositeOperation="destination-out"),a.font=`bold ${c}px Bespoke Sans`,a.textAlign="center",a.textBaseline="middle",a.fillText(i,0,0),a.globalCompositeOperation="source-over"}};return k}function V(n,e,r){const i=(r==null?void 0:r.radius)||4,t=(r==null?void 0:r.padding)||1,o=.5,c=1,f=3,l=.5,_=(r==null?void 0:r.label)||"",p=8,k=2;let a=!1,M=0,w=(r==null?void 0:r.center_x)||0,P=(r==null?void 0:r.center_y)||0,g=0,h=0,I=0,L=0;const W={client:n,sync(s){if(!n.is_connected)return;let m=H(g,h),b=Y(g,h);const T=p/(2*Math.PI);m=Math.round(m*T)/T,b=Math.round(b*k)/k;let[$,q]=Q(m,b);!s&&$==I&&q==L||(I=$,L=q,n.api.send_input_joy(e,I,L))},down(s,m,b){a||(D(w,P,s,m)<=(i+t)*(i+t)&&(a=!0,M=b),W.sync(!1))},move(s,m,b){if(!a||b!=M)return;g=(s-w)/i,h=(m-P)/i;const T=Z(g,h,1);g=T[0],h=T[1]},up(s,m,b){a&&b==M&&(a=!1,g=0,h=0,W.sync(!1))},render(s){s.translate(w,P),s.lineCap="round",s.beginPath(),s.ellipse(0,0,i+t,i+t,0,0,7),s.lineWidth=o,s.stroke(),s.beginPath(),s.ellipse(g*i,h*i,f+l,f+l,0,0,7),s.globalCompositeOperation="destination-out",s.fill(),s.globalCompositeOperation="source-over",s.beginPath(),s.moveTo(0,0),s.lineTo(g*i,h*i),s.lineWidth=c,s.stroke(),s.beginPath(),s.ellipse(g*i,h*i,f,f,0,0,7),s.fill(),s.font=`bold ${f}px Bespoke Sans`,s.textAlign="center",s.textBaseline="middle",s.globalCompositeOperation="destination-out",s.fillText(_,g*i,h*i),s.globalCompositeOperation="source-over"}};return W}function ee(n,e,r){const i=(r==null?void 0:r.center_x)||0,t=(r==null?void 0:r.center_y)||0;let o=0,c=!1;return{client:n,down(l,_,p){c||D(i,t,l,_)<=4&&(c=!0,o=p)},up(l,_,p){c&&p==o&&(c=!1,e())},render(l){l.translate(i,t),l.beginPath(),c&&l.scale(.9,.9),l.moveTo(-1,-.5),l.lineTo(1,-.5),l.moveTo(-1,0),l.lineTo(1,0),l.moveTo(-1,.5),l.lineTo(1,.5),l.lineWidth=.25,l.stroke()}}}function ne(n){function e(t){var o=JSON.stringify(t);n(o)}function r(t){return Math.round(t*100)/100}const i={send_packet:n,handle_packet(t){const o=JSON.parse(t);if(o&&o._)switch(o._){case"ping":i.receive_ping(o.sts);break;case"pong":i.receive_pong(o.sts,o.rts);break;case"sync":i.receive_sync(o.id);break;case"sync_all":i.receive_sync_all();break;case"layout":i.receive_layout(o.id);break;case"alert":i.receive_alert(o.title,o.body);break;case"banner":i.receive_banner(o.text);break;case"clear_banner":i.receive_clear_banner();break}},receive_ping(t){},receive_pong(t,o){},receive_sync(t){},receive_sync_all(){},receive_layout(t){},receive_alert(t,o){},receive_banner(t){},receive_clear_banner(){},send_ping(t){e({_:"ping",sts:t})},send_pong(t,o){e({_:"pong",sts:t,rts:o})},send_input_btn(t,o){e({_:"input",id:t,d:o})},send_input_axis(t,o){e({_:"input",id:t,v:r(o)})},send_input_joy(t,o,c){e({_:"input",id:t,x:r(o),y:r(c)})},send_name(t){e({_:"name",name:t})},send_session(t){e({_:"session",sid:t})},send_layout_ready(t){e({_:"layout_ready",id:t})}};return i}const te=ne,d=F(te);d.on_status_change=B;d.connect(`ws://${window.location.hostname}:8081`);const z=document.getElementById("canvas"),u=z.getContext("2d"),N=document.getElementById("menu");let y=!1,v=0,O=0;function R(n,e){return n=n/A,e=e/A,[n,e]}function E(){return window.devicePixelRatio*A}setInterval(()=>{d.is_connected&&(d.ongoing_pings>0||d.is_connected&&d.ping_server())},U);setInterval(()=>{if(d.is_connected)for(const n of S)n.sync(!1)},1e3/K);G(z,()=>{v=u.canvas.width/E(),O=u.canvas.height/E(),S=[ee(d,()=>{y=!0,j()},{center_x:v-2,center_y:2}),C(d,"a",{label:"A",center_x:v-4,center_y:O-9}),C(d,"b",{label:"B",center_x:v-9,center_y:O-4}),C(d,"x",{label:"X",center_x:v-9,center_y:O-4-10}),C(d,"y",{label:"Y",center_x:v-4-10,center_y:O-9}),V(d,"l",{label:"L",radius:4,padding:1,center_x:8,center_y:O-8})],B()});let S=[];function B(){u.resetTransform(),u.clearRect(0,0,u.canvas.width,u.canvas.height),u.scale(E(),E()),u.fillStyle="white",u.strokeStyle="white";for(const n of S)n.render&&(u.save(),n.render(u),u.restore());u.save(),re(),u.restore()}function re(){let n=d.status;d.is_connected&&(n=`${Math.round(d.last_ping)}ms (${Math.round(d.get_avg_ping())}ms)`,u.globalAlpha=.25),u.font="bold 1px sans-serif",u.textAlign="center",u.textBaseline="top",u.fillText(n,v/2,1,v*.9)}function j(){y?(N.classList.add("open"),z.classList.add("open")):(N.classList.remove("open"),z.classList.remove("open"))}function ie(n,e,r){if(y){n<N.clientWidth&&(y=!1,j());return}[n,e]=R(n,e);for(const i of S)i.down&&i.down(n,e,r);for(const i of S)i.move&&i.move(n,e,r);B()}function oe(n,e,r){if([n,e]=R(n,e),!y)for(const i of S)i.move&&i.move(n,e,r);B()}function se(n,e,r){if([n,e]=R(n,e),!y)for(const i of S)i.up&&i.up(n,e,r);B()}window.addEventListener("pointerdown",n=>{n.preventDefault(),ie(n.x,n.y,n.pointerId)});window.addEventListener("pointerup",n=>{n.preventDefault(),se(n.x,n.y,n.pointerId)});window.addEventListener("pointermove",n=>{n.preventDefault(),oe(n.x,n.y,n.pointerId)});z.addEventListener("touchstart",n=>n.preventDefault());y=!0;j();