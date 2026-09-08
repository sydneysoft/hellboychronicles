(() => {
  const targetElement = target => target instanceof Element ? target : target?.parentElement;
  const protectedArea = target => Boolean(targetElement(target)?.closest('.reader, dialog'));
  const watermarkText = '@HELLBOYCHRONICLES · J MIJAIL';
  const makeWatermark = className => {
    const layer = document.createElement('div');
    layer.className = className;
    layer.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 8; index += 1) {
      const stamp = document.createElement('span');
      stamp.textContent = watermarkText;
      layer.appendChild(stamp);
    }
    return layer;
  };

  document.querySelectorAll('.comic-page').forEach(page => {
    page.querySelectorAll('img').forEach(image => {
      image.draggable = false;
      image.setAttribute('oncontextmenu', 'return false');
    });
    page.appendChild(makeWatermark('copy-watermark'));
  });

  const dialog = document.querySelector('dialog');
  if (dialog) dialog.appendChild(makeWatermark('lightbox-watermark'));

  const shield = document.createElement('div');
  shield.className = 'privacy-shield';
  shield.setAttribute('aria-hidden', 'true');
  shield.innerHTML = '<strong>PROTECTED EDITION</strong><span>@HELLBOYCHRONICLES</span>';
  document.body.appendChild(shield);

  document.addEventListener('contextmenu', event => {
    if (protectedArea(event.target)) event.preventDefault();
  });
  document.addEventListener('dragstart', event => {
    if (protectedArea(event.target)) event.preventDefault();
  });
  document.addEventListener('selectstart', event => {
    if (protectedArea(event.target)) event.preventDefault();
  });
  document.addEventListener('copy', event => {
    const selection = getSelection();
    if (protectedArea(event.target) || protectedArea(selection?.anchorNode)) event.preventDefault();
  });
  document.addEventListener('keydown', event => {
    const shortcut = event.ctrlKey || event.metaKey;
    if (shortcut && ['p', 's', 'u'].includes(event.key.toLowerCase())) event.preventDefault();
  });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('content-obscured', document.hidden);
  });
  addEventListener('pagehide', () => document.body.classList.add('content-obscured'));
  addEventListener('pageshow', () => document.body.classList.remove('content-obscured'));
  addEventListener('beforeprint', () => document.body.classList.add('print-blocked'));
  addEventListener('afterprint', () => document.body.classList.remove('print-blocked'));
})();
