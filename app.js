(() => {
  const $ = id => document.getElementById(id);
  const gate=$('gate'), vault=$('vault'), form=$('unlock-form'), input=$('passphrase'), unlock=$('unlock'), error=$('unlock-error');
  const grid=$('idea-grid'), search=$('search'), statusFilter=$('status-filter'), empty=$('empty-state'), dialog=$('idea-dialog'), detail=$('dialog-content');
  const enc=new TextEncoder(), dec=new TextDecoder(); let ideas=[], category='All';
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categoryClass=c=>c==='AI / ML'?'ai':String(c||'').toLowerCase();

  async function decrypt(passphrase) {
    const c=window.VAULT_CIPHER;
    if(!c) throw Error('Encrypted archive is missing');
    const base=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(c.salt),iterations:c.iterations,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
    const compressed=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(c.nonce),additionalData:enc.encode(c.aad)},key,bytes(c.ciphertext));
    const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const plain=await new Response(stream).arrayBuffer();
    const parsed=JSON.parse(dec.decode(plain));
    if(!Array.isArray(parsed)) throw Error('Invalid archive');
    return parsed;
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault(); error.hidden=true; unlock.disabled=true; unlock.textContent='Unlocking…';
    try { ideas=await decrypt(input.value); input.value=''; gate.hidden=true; vault.hidden=false; render(); }
    catch(_) { error.hidden=false; input.select(); }
    finally { unlock.disabled=false; unlock.textContent='Unlock ↗'; }
  });

  function card(i){return `<article class="idea-card" tabindex="0" role="button" data-id="${esc(i.id)}" aria-label="Open ${esc(i.title)}">
    <div class="card-top"><span class="category ${categoryClass(i.category)}"><span class="category-mark">${esc(i.icon)}</span>${esc(i.category)}</span><span class="status">${esc(i.status)}</span></div>
    <h3 class="card-title">${esc(i.title)}</h3><p class="card-summary">${esc(i.summary)}</p>
    <div class="tag-list">${(i.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="card-bottom"><span>${esc(i.id)} · ${esc(i.captured)}</span><span class="open">Explore idea ↗</span></div></article>`;}
  function render(){
    const q=search.value.trim().toLowerCase(), st=statusFilter.value;
    const matches=ideas.filter(i=>[i.title,i.summary,i.problem,i.category,...(i.tags||[]),...(i.users||[])].join(' ').toLowerCase().includes(q)&&(category==='All'||i.category===category)&&(st==='All'||i.status===st));
    grid.innerHTML=matches.map(card).join(''); empty.hidden=matches.length>0; grid.hidden=matches.length===0;
    $('idea-count').textContent=String(ideas.length).padStart(2,'0'); $('all-count').textContent=ideas.length; $('result-count').textContent=String(matches.length).padStart(2,'0');
  }
  function openIdea(id){
    const i=ideas.find(x=>x.id===id); if(!i)return;
    const section=(title,body)=>`<section class="dialog-section"><h3>${esc(title)}</h3>${Array.isArray(body)?(body.length?`<ul>${body.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>None recorded yet.</p>'):`<p>${esc(body||'Not recorded yet.')}</p>`}</section>`;
    detail.innerHTML=`<p class="dialog-kicker">${esc(i.id)} / ${esc(i.category)} / ${esc(i.status)}</p><h2 class="dialog-title">${esc(i.title)}</h2><p class="dialog-summary">${esc(i.summary)}</p><span class="confidence">${esc(i.confidence)}</span>
      ${section('Problem / opportunity',i.problem)}${section('Potential users',i.users)}${section('Potential utility',i.utility)}${section('Existing alternatives',i.alternatives)}${section('Assumptions to test',i.assumptions)}${section('Risks and failure modes',i.risks)}${section('Validation experiments',i.experiments)}
      <section class="dialog-section"><h3>Evidence and sources</h3><p>${i.evidence?.length?i.evidence.map(e=>esc(e.title||e.url)).join('<br>'):'No external validation research is recorded yet. Treat claims above as hypotheses, not findings.'}</p></section>${section('Next action',i.next)}`;
    if(typeof dialog.showModal==='function')dialog.showModal();
  }
  $('filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;category=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render();});
  search.addEventListener('input',render); statusFilter.addEventListener('change',render);
  grid.addEventListener('click',e=>{const c=e.target.closest('[data-id]');if(c)openIdea(c.dataset.id);});
  grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-id]')){e.preventDefault();openIdea(e.target.dataset.id);}});
  $('dialog-close').addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  $('clear-filters').addEventListener('click',()=>{search.value='';statusFilter.value='All';category='All';document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter==='All'));render();});
  $('lock-again').addEventListener('click',()=>{ideas=[];grid.innerHTML='';vault.hidden=true;gate.hidden=false;input.value='';error.hidden=true;input.focus();});
})();