import * as ecs from '@8thwall/ecs'

const HIGHLIGHT_COLOR = '#26408C'
const ORIG_COLOR = '#7894E8'   // výchozí barva tlačítek podle Inspectoru

// pro každou entitu s komponentou: aktuální "generace" posluchačů
const generation = new Map<ecs.Eid, number>()

ecs.registerComponent({
  name: 'period-switcher',
  schema: {
    button1: ecs.eid,
    button2: ecs.eid,
    button3: ecs.eid,
    button4: ecs.eid,

    model1: ecs.eid,
    model2: ecs.eid,
    model3: ecs.eid,
    model4: ecs.eid,
  },

  add: (world, component) => {
    const s = component.schema
    const myGen = (generation.get(component.eid) || 0) + 1
    generation.set(component.eid, myGen)
    const alive = () => generation.get(component.eid) === myGen

    console.log('period-switcher add', component.eid, 'gen', myGen)
    console.log('period-switcher refs', component.eid, {
      buttons: [s.button1, s.button2, s.button3, s.button4],
      models: [s.model1, s.model2, s.model3, s.model4],
    })

    const hide = (e: ecs.Eid) => {
      try {
        if (e && !ecs.Hidden.has(world, e)) ecs.Hidden.set(world, e, {})
      } catch (err) {
        console.error(err)
      }
    }
    const show = (e: ecs.Eid) => {
      try {
        if (e && ecs.Hidden.has(world, e)) ecs.Hidden.remove(world, e)
      } catch (err) {
        console.error(err)
      }
    }
    const color = (e: ecs.Eid, c: string) => {
      try {
        if (e && ecs.Ui.has(world, e)) ecs.Ui.set(world, e, {background: c})
      } catch (err) {
        console.error(err)
      }
    }

    // reset do výchozího stavu: období 1 viditelné, ostatní a řeka skryté
    show(s.model1)
    hide(s.model2)
    hide(s.model3)
    hide(s.model4)
    ;[s.button1, s.button2, s.button3, s.button4].forEach((b) => color(b, ORIG_COLOR))
    color(s.button1, HIGHLIGHT_COLOR)

    // zobrazí jedno období (1-3), ostatní skryje a obarví tlačítka
    const pick = (active: number) => {
      const models = [s.model1, s.model2, s.model3]
      const btns = [s.button1, s.button2, s.button3]
      models.forEach((m, i) => (i + 1 === active ? show(m) : hide(m)))
      btns.forEach((b, i) => color(b, i + 1 === active ? HIGHLIGHT_COLOR : ORIG_COLOR))
      console.log('pick', active, {
        hidden: models.map((m) => ecs.Hidden.has(world, m)),
      })
    }

    const on = (target: ecs.Eid, fn: () => void) => {
      if (!target) return
      world.events.addListener(target, 'click', () => {
        if (!alive()) return  // starý posluchač z dřívějšího spuštění
        console.log('klik', target)
        fn()
      })
    }

    on(s.button1, () => pick(1))
    on(s.button2, () => pick(2))
    on(s.button3, () => pick(3))

    // Tlačítko 4: nezávislý přepínač řeky
    on(s.button4, () => {
      if (ecs.Hidden.has(world, s.model4)) {
        show(s.model4)
        color(s.button4, HIGHLIGHT_COLOR)
      } else {
        hide(s.model4)
        color(s.button4, ORIG_COLOR)
      }
      console.log('river hidden:', ecs.Hidden.has(world, s.model4))
    })
  },
})