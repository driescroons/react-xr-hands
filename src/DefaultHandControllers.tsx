import { useFrame, useThree } from '@react-three/fiber'
import { useXR, useXREvent, XREvent } from '@react-three/xr'
import React, { useEffect, useRef } from 'react'
import { BoxBufferGeometry, Euler, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, XRHandJoint } from 'three'

import { HandModel } from './HandModel'

export function DefaultHandControllers() {
  const { controllers, isHandTracking, isPresenting } = useXR()

  const models = useRef<HandModel[]>([])

  useEffect(() => {
    controllers.map((c) => {
      let model = models.current.find((model) => model.inputSource.handedness === c.inputSource.handedness)
      if (!model) {
        models.current.push(new HandModel(c.controller, c.inputSource))
      }
    })
  }, [controllers])

  useEffect(() => {
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
    const model = models.current.find((model) => model.inputSource.handedness === e.controller.inputSource.handedness)
    if (model) {
      model.setPose('pinch')
    }

    let joints = isHandTracking
      ? (e.controller.hand as any).joints
      : (e.controller.controller as any).children
          .find((child: Object3D) => child instanceof HandModel)
          .bones.reduce((obj: XRHandJoint, bone: Object3D) => {
            obj[(bone as any).jointName] = bone

            return obj
          }, {}) || {}

    const indexTip = joints['index-finger-tip']
    const thumbTip = joints['thumb-tip']
    const distance = indexTip.position.distanceTo(thumbTip.position)
    const position = indexTip.position.clone().add(thumbTip.position).multiplyScalar(0.5)

    // WORKS!!
    if (isHandTracking) {
      meshRef.current!.position.copy(position)
      meshRef.current!.quaternion.copy(e.controller.controller.getWorldQuaternion(new Quaternion()))
    } else {
      const newPosition = meshRef.current!.position.copy(position).applyEuler(new Euler(Math.PI / 2, -Math.PI / 2, 0))

      if (e.controller.inputSource.handedness === 'left') {
        newPosition.applyMatrix4(new Matrix4().makeScale(-1, 1, 1))
      }

      newPosition.applyMatrix4(e.controller.controller.matrixWorld)

      meshRef.current!.position.copy(newPosition)
    }
  })

  useXREvent('selectend', (e: XREvent) => {
    const model = models.current.find((model) => model.inputSource.handedness === e.controller.inputSource.handedness)
    if (model) {
      model.setPose('idle')
    }
  })

  const meshRef = useRef<Mesh>()

  const { scene } = useThree()

  return (
    <primitive object={scene}>
      <mesh ref={meshRef} geometry={new BoxBufferGeometry(0.02, 0.02, 0.02)} material={new MeshBasicMaterial({ color: 'green' })} />
    </primitive>
  )
}
