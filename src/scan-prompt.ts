import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'scan-prompt',
  add: (world, component) => {
    const found = new Set<string>()

    const update = () => {
      try {
        if (ecs.Ui.has(world, component.eid)) {
          ecs.Ui.set(world, component.eid, {display: found.size > 0 ? 'none' : 'flex'})
        }
      } catch (err) {
        console.error('scan-prompt', err)
      }
    }

    const nameOf = (event: {data?: unknown}) =>
      String((event.data as {name?: string} | undefined)?.name || '')

    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_FOUND, (event) => {
      found.add(nameOf(event))
      update()
    })
    world.events.addListener(world.events.globalId, ecs.events.REALITY_IMAGE_LOST, (event) => {
      found.delete(nameOf(event))
      update()
    })

    update()
  },
})