import * as ecs from '@8thwall/ecs'
import {ensureFont, FONT_FAMILY} from './fonts'

// Úvodní výzva k naskenování atlasu jako HTML (DOM) overlay – podporuje českou diakritiku.
// Použití: přidej komponentu "scan-prompt" na libovolnou entitu (např. Camera).
// Dokud není nalezen žádný image target, výzva je vidět; po nalezení se skryje.

const TITLE = 'Naskenuj stránku atlasu'
const SUBTITLE = 'Zamiř kamerou na mapu Zvíkova nebo Frymburku'

ecs.registerComponent({
  name: 'scan-prompt',
  add: (world, component) => {
    ensureFont()
    const found = new Set<string>()
    let alive = true

    const box = document.createElement('div')
    box.setAttribute('data-scan-prompt', '')
    box.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:12%',
      'transform:translateX(-50%)',
      'width:min(90vw,460px)',
      'padding:16px 20px',
      'box-sizing:border-box',
      'text-align:center',
      'color:#ffffff',
      'background:rgba(59,58,92,0.65)',
      'border-radius:16px',
      `font-family:${FONT_FAMILY}`,
      'pointer-events:none',
      'z-index:10',
      'transition:opacity 0.3s ease',
    ].join(';')

    const title = document.createElement('div')
    title.textContent = TITLE
    title.style.cssText = 'font-size:30px;font-weight:700;line-height:1.2'

    const sub = document.createElement('div')
    sub.textContent = SUBTITLE
    sub.style.cssText = 'font-size:18px;font-weight:400;line-height:1.4;margin-top:6px;opacity:0.9'

    box.appendChild(title)
    box.appendChild(sub)
    document.body.appendChild(box)

    const update = () => {
      box.style.opacity = found.size > 0 ? '0' : '1'
    }

    const nameOf = (event: {data?: unknown}) =>
      String((event.data as {name?: string} | undefined)?.name || '')

    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
      if (!alive) return
      found.add(nameOf(event))
      update()
    })
    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, (event) => {
      if (!alive) return
      found.delete(nameOf(event))
      update()
    })

    update()
  },
  remove: () => {
    // odstranění prvku při zrušení komponenty
    document.querySelectorAll('body > div[data-scan-prompt]').forEach(el => el.remove())
  },
})