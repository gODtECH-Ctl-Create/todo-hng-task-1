const loader = document.querySelector('#app-loader');
const MINIMUM_VISIBLE_MS = 650;
const loaderStartedAt = performance.now();

function revealApplication() {
  const elapsed = performance.now() - loaderStartedAt;
  const remaining = Math.max(0, MINIMUM_VISIBLE_MS - elapsed);

  window.setTimeout(() => {
    document.body.classList.remove('app-loading');
    document.body.classList.add('app-ready');

    if (!loader) return;

    loader.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => loader.remove(), 320);
  }, remaining);
}

if (document.readyState === 'complete') {
  revealApplication();
} else {
  window.addEventListener('load', revealApplication, { once: true });
}
