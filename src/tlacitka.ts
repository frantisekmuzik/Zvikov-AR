import * as ecs from '@8thwall/ecs'
import {ensureFont, FONT_FAMILY} from './fonts'

// Tlačítka jako HTML (DOM) prvky: česká diakritika a přesné vycentrování textu.
// Komponenta "period-switcher" zůstává na Camera. Tlačítka a texty ve Studiu už nejsou potřeba.

const HIGHLIGHT_COLOR = '#26408C'
const ORIG_COLOR = '#7894E8'

const LABELS = {
  fry: ['rok 1826', 'rok 1952', 'rok 2026', 'přehrada\nLipno'],
  zvi: ['rok 1830', 'rok 1952', 'rok 2026', 'přehrada\nOrlík'],
}

type Territory = 'fry' | 'zvi'

ecs.registerComponent({
  name: 'period-switcher',
  schema: {
    // modely Frymburku
    fryModel1: ecs.eid, fryModel2: ecs.eid, fryModel3: ecs.eid, fryRiver: ecs.eid,
    // modely Zvíkova
    zviModel1: ecs.eid, zviModel2: ecs.eid, zviModel3: ecs.eid, zviRiver: ecs.eid,
  },

  add: (world, component) => {
    const s = component.schema
    console.log('period-switcher v10 (DOM) add', component.eid)
    ensureFont()

    const models = {
      fry: {periods: [s.fryModel1, s.fryModel2, s.fryModel3], river: s.fryRiver},
      zvi: {periods: [s.zviModel1, s.zviModel2, s.zviModel3], river: s.zviRiver},
    }
    const state = {
      fry: {period: 0, river: false},
      zvi: {period: 0, river: false},
    }
    let active: Territory | null = null

    const hide = (e: ecs.Eid) => {
      try { if (e && !ecs.Hidden.has(world, e)) ecs.Hidden.set(world, e, {}) } catch (err) { console.error(err) }
    }
    const show = (e: ecs.Eid) => {
      try { if (e && ecs.Hidden.has(world, e)) ecs.Hidden.remove(world, e) } catch (err) { console.error(err) }
    }

    const applyModels = (t: Territory) => {
      const m = models[t]
      // nejdřív zobrazit vybraný model, pak skrýt ostatní (bez mezery)
      m.periods.forEach((e, i) => { if (i === state[t].period) show(e) })
      m.periods.forEach((e, i) => { if (i !== state[t].period) hide(e) })
      if (state[t].river) show(m.river); else hide(m.river)
    }

    // ---------- DOM ----------
    const BTN_CSS = [
      'display:flex', 'align-items:center', 'justify-content:center',
      'text-align:center', 'white-space:pre-line', 'box-sizing:border-box',
      'width:114px', 'height:56px', 'padding:0 6px', 'border:0', 'border-radius:10px',
      'color:#fff', `font:700 18px/1.2 ${FONT_FAMILY}`,
      'cursor:pointer', 'pointer-events:auto', 'touch-action:manipulation',
      '-webkit-tap-highlight-color:transparent', `background:${ORIG_COLOR}`, 'opacity:0.9',
    ].join(';')

    const root = document.createElement('div')
    root.setAttribute('data-period-switcher', '')
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:11;opacity:0;transition:opacity 0.3s ease'

    const bottom = document.createElement('div')
    bottom.style.cssText = [
      'position:absolute', 'left:0', 'right:0',
      'bottom:calc(50px + env(safe-area-inset-bottom, 0px))',
      'display:flex', 'justify-content:space-evenly', 'align-items:center',
      'padding:0 3%', 'pointer-events:none',
    ].join(';')

    const top = document.createElement('div')
    top.style.cssText = [
      'position:absolute', 'top:calc(50px + env(safe-area-inset-top, 0px))', 'right:10%',
      'pointer-events:none',
    ].join(';')

    const makeBtn = (parent: HTMLElement, onClick: () => void) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.style.cssText = BTN_CSS
      b.addEventListener('click', (ev) => { ev.stopPropagation(); if (active) onClick() })
      parent.appendChild(b)
      return b
    }

    const select = (i: number) => () => { state[active!].period = i; applyModels(active!); applyButtons() }
    const btns = [
      makeBtn(bottom, select(0)),
      makeBtn(bottom, select(1)),
      makeBtn(bottom, select(2)),
      makeBtn(top, () => { state[active!].river = !state[active!].river; applyModels(active!); applyButtons() }),
    ]
    root.appendChild(bottom)
    root.appendChild(top)
    document.body.appendChild(root)

    const applyButtons = () => {
      if (!active) { root.style.opacity = '0'; root.style.visibility = 'hidden'; return }
      root.style.visibility = 'visible'
      root.style.opacity = '1'
      const st = state[active]
      LABELS[active].forEach((t, i) => { btns[i].textContent = t })
      ;[0, 1, 2].forEach((i) => { btns[i].style.background = i === st.period ? HIGHLIGHT_COLOR : ORIG_COLOR })
      btns[3].style.background = st.river ? HIGHLIGHT_COLOR : ORIG_COLOR
    }

    applyModels('fry')
    applyModels('zvi')
    applyButtons()

    const nameOf = (event: {data?: unknown}) =>
      String((event.data as {name?: string} | undefined)?.name || '').toLowerCase()

    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
      const name = nameOf(event)
      console.log('image found:', name)
      if (name.includes('zvikov') || name.includes('zvíkov')) active = 'zvi'
      else if (name.includes('frymburk')) active = 'fry'
      else return
      applyButtons()
    })
    // po ztrátě targetu zůstanou tlačítka dál viditelná u posledního území (plynulé přepínání)
  },

  remove: () => {
    document.querySelectorAll('body > div[data-period-switcher]').forEach(el => el.remove())
  },
})