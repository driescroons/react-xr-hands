import { useXR } from '@react-three/xr'
import React, { useEffect, useRef, useState } from 'react'
import { BoxBufferGeometry, Mesh } from 'three'

import { HandModel } from './HandModel'

export function DefaultHandControllers() {
  const { controllers, isHandTracking } = useXR()

  const models = useRef<HandModel[]>([])

  useEffect(() => {
    if (models.current.length === 0) {
      const handModels: HandModel[] = []
      controllers.map((c) => {
        c.controller.add(new Mesh(new BoxBufferGeometry(0.1, 0.1, 0.1)))
        handModels.push(new HandModel(c.controller, c.inputSource))
      })
      models.current = handModels
    }
  }, [controllers])

  useEffect(() => {
    // fix this firing twice when going in vr mode
    if (models.current.length === controllers.length) {
      controllers.forEach((c, index) => {
        let model = models.current[index]
        if (isHandTracking) {
          c.controller.remove(model)
          model.controller = c.hand
          model.load()
          c.hand.add(model)
        } else {
          c.hand.remove(model)
          model.controller = c.controller
          model.load()
          c.controller.add(model)
        }
        models.current[index] = model
      })
    }
  }, [controllers, isHandTracking])

  return null
}
