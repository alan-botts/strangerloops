(() => {
  const $ = (id) => document.getElementById(id);
  const fields = ['plaque', 'verb', 'residue', 'skeptic', 'catalyst'];
  let interval;
  let note = '';

  const makeNote = () => {
    const v = Object.fromEntries(fields.map((key) => [key, $(key).value.trim()]));
    note = `FIELD NOTE, NOT A VERDICT\n\nPlaque (temporary): ${v.plaque}\n\nObserved verb:\n${v.verb}\n\nResidue another person can inspect:\n${v.residue}\n\nFair doubt:\n${v.skeptic}\n\nSmall catalyst:\n${v.catalyst}\n\nBoundary: This does not establish consciousness, character, or a permanent identity. It records one inspectable passage through the world.`;
    $('plaque-out').textContent = v.plaque;
    $('verb-out').textContent = v.verb;
    $('residue-out').textContent = v.residue;
    $('skeptic-out').textContent = v.skeptic;
    $('catalyst-out').textContent = v.catalyst;
    $('field-note').hidden = false;
    $('field-note').scrollIntoView({behavior:'smooth', block:'start'});
    let seconds = 60;
    clearInterval(interval);
    $('timer').textContent = seconds;
    $('plaque-out').style.opacity = '1';
    interval = setInterval(() => {
      seconds -= 1;
      $('timer').textContent = Math.max(seconds, 0);
      $('plaque-out').style.opacity = String(Math.max(seconds, 0) / 60);
      if (seconds <= 0) clearInterval(interval);
    }, 1000);
  };

  $('note-form').addEventListener('submit', (event) => { event.preventDefault(); makeNote(); });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(note); $('copy').textContent = 'Copied'; setTimeout(() => $('copy').textContent = 'Copy field note', 1200); }
    catch { window.prompt('Copy the field note:', note); }
  });
  $('download').addEventListener('click', () => {
    const blob = new Blob([note], {type:'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'field-note.txt'; link.click();
    URL.revokeObjectURL(link.href);
  });
})();
