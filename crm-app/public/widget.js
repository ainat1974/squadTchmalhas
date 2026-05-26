/**
 * Techmalhas Webchat Widget — Shadow DOM launcher + iframe
 * Snippet: <script src="https://SEU-DOMINIO/widget.js" data-base="https://SEU-DOMINIO" defer></script>
 */
(function () {
  'use strict'

  const script = document.currentScript
  const BASE = (script && script.getAttribute('data-base')) || window.location.origin
  const POSITION = (script && script.getAttribute('data-position')) || 'right'
  const STORAGE_KEY = 'tm_webchat_panel_open'

  if (document.getElementById('tm-webchat-host')) return

  const host = document.createElement('div')
  host.id = 'tm-webchat-host'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = `
    :host { all: initial; }
    .tm-launcher {
      position: fixed;
      bottom: 24px;
      ${POSITION === 'left' ? 'left: 24px;' : 'right: 24px;'}
      z-index: 2147483646;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(145deg, #E8C547 0%, #C9A84C 100%);
      color: #1a1a1a;
      font-size: 22px;
      font-weight: 700;
      box-shadow: 0 4px 24px rgba(201, 168, 76, 0.45);
      transition: transform 0.2s ease;
    }
    .tm-launcher:hover { transform: scale(1.06); }
    .tm-panel {
      position: fixed;
      bottom: 96px;
      ${POSITION === 'left' ? 'left: 24px;' : 'right: 24px;'}
      z-index: 2147483645;
      width: min(400px, calc(100vw - 32px));
      height: min(560px, calc(100vh - 120px));
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.35);
      border: 1px solid rgba(201, 168, 76, 0.35);
      display: none;
    }
    .tm-panel.open { display: block; }
    .tm-panel iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #0f0f0f;
    }
  `
  shadow.appendChild(style)

  const launcher = document.createElement('button')
  launcher.className = 'tm-launcher'
  launcher.type = 'button'
  launcher.setAttribute('aria-label', 'Abrir chat Techmalhas')
  launcher.textContent = 'TM'

  const panel = document.createElement('div')
  panel.className = 'tm-panel'
  const iframe = document.createElement('iframe')
  iframe.title = 'Chat Techmalhas'
  iframe.allow = 'clipboard-write'
  panel.appendChild(iframe)

  shadow.appendChild(launcher)
  shadow.appendChild(panel)

  function buildEmbedUrl() {
    const pageUrl = encodeURIComponent(window.location.href)
    return `${BASE.replace(/\/$/, '')}/embed/chat?pageUrl=${pageUrl}`
  }

  function openPanel() {
    if (!iframe.src) iframe.src = buildEmbedUrl()
    panel.classList.add('open')
    try { sessionStorage.setItem(STORAGE_KEY, '1') } catch (_) {}
  }

  function closePanel() {
    panel.classList.remove('open')
    try { sessionStorage.removeItem(STORAGE_KEY) } catch (_) {}
  }

  launcher.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel()
    else openPanel()
  })

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.source !== 'techmalhas-chat') return
    if (event.data.type === 'close_panel') closePanel()
    if (event.data.type === 'session_started') openPanel()
  })

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') openPanel()
  } catch (_) {}
})()
