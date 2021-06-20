import { useFrame } from '@react-three/fiber'
import { useXR, useXREvent, XREvent } from '@react-three/xr'
import React, { useEffect, useRef, useState } from 'react'
import { BoxBufferGeometry, Mesh } from 'three'

import { HandModel } from './HandModel'

export function DefaultHandControllers() {
  const { controllers, isHandTracking, isPresenting } = useXR()

  const models = useRef<HandModel[]>([])

  useEffect(() => {
    controllers.map((c) => {
      let model = models.current.find((model) => model.inputSource.handedness === c.inputSource.handedness)
      if (!model) {
        // c.controller.add(new Mesh(new BoxBufferGeometry(0.1, 0.1, 0.1)))
        models.current.push(new HandModel(c.controller, c.inputSource))
      }
    })
  }, [controllers])

  useEffect(() => {
    // fix this firing twice when going in vr mode
    if (isPresenting && models.current.length === controllers.length) {
      controllers.forEach((c, index) => {
        let model = models.current[index]
        if (isHandTracking) {
          model.load(c.hand, c.inputSource, isHandTracking)
        } else {
          model.load(c.controller, c.inputSource, isHandTracking)
        }
        models.current[index] = model
      })
    }
  }, [controllers, isHandTracking])

  useFrame(() => {
    if (isHandTracking) {
      // we'll be checking the distance here
      // if distance is small than threshold => "selectstart" event
      // we need to set a treshhold to "release" (bigger than selectstart threshold)
      // only when distance bigger, throw select end
      // if already selecting (store in state) => do not refire the selectstart event
      // same for selectend
    }
  })

  useXREvent('selectstart', (e: XREvent) => {
    console.log('started', e)
    // TEMP
    // models.current.map((model) => {
    // model.getJoints()
    // })

    const model = models.current.find((model) => model.inputSource.handedness === e.controller.inputSource.handedness)
    if (model) {
      model.setPose('pinch')
    }

    // const model = models.current.find(model => model.inputSource.handedness === e.controller.inputSource.handedness);
    // model.setPose(HandPose.idle);
  })

  useXREvent('selectend', (e: XREvent) => {
    console.log('ENDED', e)

    const model = models.current.find((model) => model.inputSource.handedness === e.controller.inputSource.handedness)
    if (model) {
      model.setPose('idle')
    }
    //     const model = models.current.find(model => model.inputSource.handedness === e.controller.inputSource.handedness);
    // model.setPose(HandPose.select);
  })

  return null
}
