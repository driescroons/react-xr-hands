import { useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import React, { useEffect, useRef, useState } from 'react'
import { BoxBufferGeometry, Mesh } from 'three'

import { HandModel } from './HandModel'

export function Hands() {
  const { gl, scene } = useThree()
  const { controllers, player, isPresenting, isHandTracking } = useXR()

  const [models, setModels] = useState<HandModel[]>([])

  useEffect(() => {
    if (models.length === 0) {
      const handModels: HandModel[] = []
      controllers.map((c) => {
        c.controller.add(new Mesh(new BoxBufferGeometry(0.1, 0.1, 0.1)))
        handModels.push(new HandModel(c.controller, c.inputSource))
      })
      setModels(handModels)
    }
  }, [controllers])

  useEffect(() => {
    if (models.length === controllers.length) {
      controllers.map((c, index) => {
        let model = models[index]
        if (isHandTracking) {
          c.controller.remove(model)
          model = new HandModel(c.hand, c.inputSource)
          c.hand.add(model)
        } else {
          c.hand.remove(model)
          model = new HandModel(c.controller, c.inputSource)
          c.controller.add(model)
        }
      })
    }
  }, [controllers, isHandTracking, models])

  return null
}
