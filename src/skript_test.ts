// This is a component file. You can use this file to define a custom component for your project.
// This component will appear as a custom component in the editor.

import * as ecs from '@8thwall/ecs'  // This is how you access the ecs library.

ecs.registerComponent({
  name: 'skript_test',
  schema: {
    // V editoru přetáhni do tohoto pole entitu (model), kterou chceš zapínat/vypínat.
    targetModel: ecs.eid,
  },
  // schemaDefaults: {
  // },
  // data: {
  // },
  add: (world, component) => {
    // Tato komponenta se přidá na entitu, která funguje jako tlačítko
    // (musí mít Collider/Trigger nebo Screen Touch, aby 'click' fungoval).
    world.events.addListener(component.eid, 'click', () => {
      const target = component.schema.targetModel

      if (!target) {
        console.warn('skript_test: není nastavený targetModel v schema')
        return
      }

      if (ecs.Hidden.has(world, target)) {
        // Model je skrytý -> zobrazíme ho
        ecs.Hidden.remove(world, target)
      } else {
        // Model je viditelný -> skryjeme ho
        ecs.Hidden.set(world, target, {})
      }
    })
  },
  // tick: (world, component) => {
  // },
  // remove: (world, component) => {
  // },
  // stateMachine: ({world, eid, schemaAttribute, dataAttribute}) => {
  //   ecs.defineState('default').initial()
  // },
})