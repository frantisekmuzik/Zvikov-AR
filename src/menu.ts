import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'territory-switcher',
  schema: {
    menuRoot: ecs.eid,
    frymburkRoot: ecs.eid,
    zvikovRoot: ecs.eid,
    buttonFrymburk: ecs.eid,
    buttonZvikov: ecs.eid,
  },
  add: (world, component) => {
    const {menuRoot, frymburkRoot, zvikovRoot, buttonFrymburk, buttonZvikov} = component.schema

    const hide = (eid) => { if (eid && !ecs.Hidden.has(world, eid)) ecs.Hidden.set(world, eid, {}) }
    const show = (eid) => { if (eid && ecs.Hidden.has(world, eid)) ecs.Hidden.remove(world, eid) }

    // start: vidět jen menu
    hide(frymburkRoot)
    hide(zvikovRoot)

    world.events.addListener(buttonFrymburk, 'click', () => {
      hide(menuRoot); hide(zvikovRoot); show(frymburkRoot)
    })
    world.events.addListener(buttonZvikov, 'click', () => {
      hide(menuRoot); hide(frymburkRoot); show(zvikovRoot)
    })
  },
})