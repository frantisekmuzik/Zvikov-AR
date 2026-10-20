import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'territory-switcher',
  schema: {
    frymburkRoot: ecs.eid,   // Root_Frymburk
    zvikovRoot: ecs.eid,     // Root_Zvikov
  },
  add: (world, component) => {
    const s = component.schema
    console.log('territory-switcher v6 start', {fry: s.frymburkRoot, zvi: s.zvikovRoot})

    // projde entitu a všechny její potomky
    const walk = (root: ecs.Eid, fn: (e: ecs.Eid) => void) => {
      fn(root)
      for (const child of world.getChildren(root)) walk(child, fn)
    }

    const setUi = (e: ecs.Eid, active: boolean) => {
      try {
        if (ecs.Ui.has(world, e)) {
          ecs.Ui.set(world, e, {
            display: active ? '' : 'none',
            ignoreRaycast: !active,
          })
        }
      } catch (err) {
        console.error('territory-switcher: UI', e, err)
      }
    }

    const disable = (root: ecs.Eid) => {
      if (!root) return
      walk(root, (e) => setUi(e, false))
      if (!ecs.Disabled.has(world, root)) ecs.Disabled.set(world, root, {})
      console.log('disabled', root, ecs.Disabled.has(world, root))
    }
    const enable = (root: ecs.Eid) => {
      if (!root) return
      if (ecs.Disabled.has(world, root)) ecs.Disabled.remove(world, root)
      walk(root, (e) => setUi(e, true))
      console.log('enabled', root, !ecs.Disabled.has(world, root))
    }

    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
      const name = String((event.data as {name?: string} | undefined)?.name || '').toLowerCase()
      console.log('image found:', name)

      if (name.includes('zvikov') || name.includes('zvíkov')) {
        disable(s.frymburkRoot)
        enable(s.zvikovRoot)
      } else if (name.includes('frymburk')) {
        disable(s.zvikovRoot)
        enable(s.frymburkRoot)
      }
    })
  },
})