(() => {
  const status = document.getElementById('draft-status');
  const clock = document.getElementById('colombo-time');
  const updateClock = () => clock.textContent = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Colombo',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()) + ' +05:30';
  updateClock(); setInterval(updateClock,60000);
  const templates = [...document.querySelectorAll('.tab-content')];
  const key = 'sd-hub-draft-v2';
  const plainText = element => [...element.childNodes].map(node => node.nodeType === 3 ? node.textContent.replace(/\s+/g,' ') : node.nodeName === 'BR' ? '\n' : plainText(node)).join('').trim();
  let dirty = false;
  const notify = (message) => { if (typeof showToast === 'function') showToast(message); };
  document.getElementById('save-draft').addEventListener('click', () => {
    try {
      // Store editable text and rows, never executable markup.
      const draft = templates.map(panel => ({id:panel.id, groups:[...panel.querySelectorAll('#invoice-tbody,#prop-tasks-tbody,#agreement-clauses,#agenda-tbody')].map(group=>({id:group.id,count:group.children.length})),fields:[...panel.querySelectorAll('[contenteditable=true]')].map(plainText)}));
      localStorage.setItem(key,JSON.stringify(draft)); dirty=false;
      status.textContent='DRAFT SAVED / THIS BROWSER'; notify('Draft saved in this browser.');
    } catch { notify('Browser storage is unavailable. Please export your document.'); }
  });
  document.getElementById('restore-draft').addEventListener('click', () => {
    try {
      const raw=localStorage.getItem(key); if(!raw){notify('No saved draft in this browser yet.');return;}
      if(dirty && !confirm('Replace current edits with the saved draft?')) return;
      const saved=JSON.parse(raw);
      const addButtons={'invoice-tbody':'btn-add-invoice-row','prop-tasks-tbody':'btn-add-proposal-row','agreement-clauses':'btn-add-clause-row','agenda-tbody':'btn-add-agenda-row'};
      saved.forEach(item=>{
        const panel=templates.find(t=>t.id===item.id); if(!panel)return;
        item.groups.forEach(g=>{const group=document.getElementById(g.id); if(!group||!panel.contains(group))return;const count=Math.max(0,Math.min(500,g.count));while(group.children.length>count)group.lastElementChild.remove();while(group.children.length<count)document.getElementById(addButtons[g.id]).click();});
        panel.querySelectorAll('[contenteditable=true]').forEach((el,i)=>{if(typeof item.fields[i]==='string')el.innerText=item.fields[i];});
      });
      dirty=false;status.textContent='SAVED DRAFT RESTORED';notify('Saved draft restored.');
    }catch {notify('Unable to restore this draft.');}
  });
  document.getElementById('print-document').addEventListener('click',()=>window.print());
  document.getElementById('templates').addEventListener('input',e=>{if(e.target.isContentEditable){dirty=true;status.textContent='UNSAVED EDITS / SAVE DRAFT TO KEEP';}});
  document.querySelectorAll('[id^="btn-add-"]').forEach(button=>button.addEventListener('click',()=>{dirty=true;status.textContent='UNSAVED EDITS / SAVE DRAFT TO KEEP';}));
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  // Match the original manual totals workflow; quantities and totals remain editable.
  document.querySelectorAll('.tab-btn').forEach(button=>{button.setAttribute('role','tab');button.setAttribute('aria-controls',button.dataset.target);button.addEventListener('click',()=>{document.querySelectorAll('.tab-btn').forEach(b=>b.setAttribute('aria-selected',String(b===button)));});button.setAttribute('aria-selected',String(button.classList.contains('tab-active')));});
  document.getElementById('tab-container').setAttribute('role','tablist');
  templates.forEach(panel=>panel.setAttribute('role','tabpanel'));
})();

