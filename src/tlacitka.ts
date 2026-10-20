import * as ecs from '@8thwall/ecs'

const HIGHLIGHT_COLOR = '#26408C'
const ORIG_COLOR = '#7894E8'

// popisky tlačítek podle území
const LABELS = {
  fry: ['rok 1826', 'rok 1952', 'rok 2026', 'prehrada\nLipno'],
  zvi: ['rok 1830', 'rok 1952', 'rok 2026', 'prehrada\nOrlik'],
}

type Territory = 'fry' | 'zvi'

ecs.registerComponent({
  name: 'period-switcher',
  schema: {
    // jedna sada tlačítek (rodiče) + jejich Text potomci
    button1: ecs.eid, button2: ecs.eid, button3: ecs.eid, button4: ecs.eid,
    label1: ecs.eid, label2: ecs.eid, label3: ecs.eid, label4: ecs.eid,

    // modely Frymburku
    fryModel1: ecs.eid, fryModel2: ecs.eid, fryModel3: ecs.eid, fryRiver: ecs.eid,
    // modely Zvíkova
    zviModel1: ecs.eid, zviModel2: ecs.eid, zviModel3: ecs.eid, zviRiver: ecs.eid,
  },

  add: (world, component) => {
    const s = component.schema
    console.log('period-switcher v8 add', component.eid)

    const buttons = [s.button1, s.button2, s.button3, s.button4]
    const labels = [s.label1, s.label2, s.label3, s.label4]
    const models = {
      fry: {periods: [s.fryModel1, s.fryModel2, s.fryModel3], river: s.fryRiver},
      zvi: {periods: [s.zviModel1, s.zviModel2, s.zviModel3], river: s.zviRiver},
    }

    // stav každého území: vybrané období (0-2) a zda je zapnutá řeka
    const state = {
      fry: {period: 0, river: false},
      zvi: {period: 0, river: false},
    }
    let active: Territory | null = null

    const hide = (e: ecs.Eid) => {
      try {
        if (e && !ecs.Hidden.has(world, e)) ecs.Hidden.set(world, e, {})
      } catch (err) { console.error(err) }
    }
    const show = (e: ecs.Eid) => {
      try {
        if (e && ecs.Hidden.has(world, e)) ecs.Hidden.remove(world, e)
      } catch (err) { console.error(err) }
    }
    const color = (e: ecs.Eid, c: string) => {
      try { if (e && ecs.Ui.has(world, e)) ecs.Ui.set(world, e, {background: c}) } catch (err) { console.error(err) }
    }
    const text = (e: ecs.Eid, t: string) => {
      try { if (e && ecs.Ui.has(world, e)) ecs.Ui.set(world, e, {text: t}) } catch (err) { console.error(err) }
    }

    // promítne stav území do modelů
    const applyModels = (t: Territory) => {
      const m = models[t]
      m.periods.forEach((e, i) => (i === state[t].period ? show(e) : hide(e)))
      if (state[t].river) show(m.river); else hide(m.river)
    }

    // promítne stav aktivního území do tlačítek
    const applyButtons = () => {
      if (!active) return
      const st = state[active]
      ;[0, 1, 2].forEach((i) => color(buttons[i], i === st.period ? HIGHLIGHT_COLOR : ORIG_COLOR))
      color(buttons[3], st.river ? HIGHLIGHT_COLOR : ORIG_COLOR)
      LABELS[active].forEach((t, i) => text(labels[i], t))
    }

    // start: výchozí stav obou území (období 1, řeka vypnutá)
    applyModels('fry')
    applyModels('zvi')

    const on = (target: ecs.Eid, fn: () => void) => {
      if (!target) return
      world.events.addListener(target, 'click', () => {
        console.log('klik', target, 'aktivní:', active)
        if (active) fn()
      })
    }

    on(s.button1, () => { state[active!].period = 0; applyModels(active!); applyButtons() })
    on(s.button2, () => { state[active!].period = 1; applyModels(active!); applyButtons() })
    on(s.button3, () => { state[active!].period = 2; applyModels(active!); applyButtons() })
    on(s.button4, () => { state[active!].river = !state[active!].river; applyModels(active!); applyButtons() })

    // které území je v záběru
    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
      const name = String((event.data as {name?: string} | undefined)?.name || '').toLowerCase()
      console.log('image found:', name)
      if (name.includes('zvikov') || name.includes('zvíkov')) active = 'zvi'
      else if (name.includes('frymburk')) active = 'fry'
      else return
      applyButtons()
    })
  },
})