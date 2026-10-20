import * as ecs from '@8thwall/ecs'

// Postaví dvě UI tlačítka doprostřed obrazovky pod sebe.
ecs.registerComponent({
  name: 'center-buttons',
  schema: {
    buttonTop: ecs.eid,       // horní tlačítko
    buttonBottom: ecs.eid,    // dolní tlačítko
    width: ecs.f32,           // šířka tlačítka (display px)
    height: ecs.f32,          // výška tlačítka (display px)
    gap: ecs.f32,             // mezera mezi tlačítky
  },
  schemaDefaults: {
    width: 260,
    height: 70,
    gap: 20,
  },
  add: (world, component) => {
    const {buttonTop, buttonBottom, width, height, gap} = component.schema
    const total = height * 2 + gap           // celková výška skupiny

    const place = (eid, offsetY) => {
      if (!eid || !ecs.Ui.has(world, eid)) {
        console.warn('center-buttons: tlačítko chybí nebo nemá komponentu Ui')
        return
      }
      ecs.Ui.set(world, eid, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: String(width),
        height: String(height),
        marginLeft: String(-width / 2),      // vystředění vodorovně
        marginTop: String(offsetY),          // vystředění svisle
      })
    }

    place(buttonTop, -total / 2)
    place(buttonBottom, -total / 2 + height + gap)
  },
})