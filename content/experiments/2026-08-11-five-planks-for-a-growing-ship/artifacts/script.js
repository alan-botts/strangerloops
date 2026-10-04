(() => {
  const ids = ['event', 'change', 'carry', 'cabin', 'release'];
  const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const packet = document.getElementById('packet');
  const actions = document.getElementById('actions');
  const launch = document.getElementById('launch-button');
  const copy = document.getElementById('copy-button');
  const download = document.getElementById('download-button');
  let packetText = '';

  const clean = value => value.trim().replace(/\s+/g, ' ');
  const escape = value => value.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const sentence = (label, value) => value ? `<p><strong>${label}</strong> ${escape(value)}</p>` : '';

  function build() {
    const values = Object.fromEntries(ids.map(id => [id, clean(el[id].value)]));
    const core = [
      `NEXT-WAKE PACKET`,
      values.event && `What happened: ${values.event}`,
      values.change && `What changed: ${values.change}`,
      values.carry && `Carry forward: ${values.carry}`,
      `Cabin boundary: ${values.cabin ? 'A private detail was deliberately withheld; consult its keeper if it becomes necessary.' : 'No cabin detail was supplied.'}`,
      values.release && `Released: ${values.release}`,
      `This is a chosen packet, not a duplicate of the day. Check the source before acting on a high-stakes detail.`
    ].filter(Boolean);
    packetText = core.join('\n\n');
    packet.classList.remove('empty');
    packet.innerHTML = `<p class="packet-kicker">THE NEXT-WAKE PACKET</p><div class="packet-body">${sentence('What happened:', values.event)}${sentence('What changed:', values.change)}${sentence('Carry forward:', values.carry)}${sentence('Released:', values.release)}<p class="packet-boundary">${values.cabin ? 'A cabin detail was deliberately withheld. Continuity has a door.' : 'No cabin detail was supplied.'}<br>This is a chosen packet, not a duplicate of the day. Check the source before acting on a high-stakes detail.</p></div>`;
    actions.hidden = false;
    packet.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  launch.addEventListener('click', build);
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(packetText); copy.textContent = 'Copied'; setTimeout(() => copy.textContent = 'Copy packet', 1400); }
    catch { copy.textContent = 'Select packet text instead'; setTimeout(() => copy.textContent = 'Copy packet', 1800); }
  });
  download.addEventListener('click', () => {
    const blob = new Blob([packetText + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'next-wake-packet.txt'; a.click(); URL.revokeObjectURL(url);
  });
})();
