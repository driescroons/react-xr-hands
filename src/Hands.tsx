import { useXR, XR, XREvent } from '@react-three/xr'
import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HandModel } from './HandModel'
import {
  BoxBufferGeometry,
  Euler,
  Group,
  Matrix3,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  XRControllerEventType,
  XRInputSource,
  XRSession
} from 'three'
import { OculusHandModel } from 'three/examples/jsm/webxr/OculusHandModel'

export function Hands() {
  const { gl, scene } = useThree()
  const { controllers, player, isPresenting } = useXR()

  // const hands = useRef<HandModel[]>([]);
  const [hands, setHands] = useState<HandModel[]>([])
  const [handTracking, setHandTracking] = useState<boolean | null>(null)

  useEffect(() => {
    // we nativally get the controllers before the connected event is thrown
    // based on this event, we'll load the models for them.

    // check if we have a hand for each controller
    if (!controllers.every((c) => hands.find((h) => h.inputSource.handedness === c.inputSource.handedness))) {
      const newHands: HandModel[] = []
      controllers.map((c, index) => {
        // if we switch to hands, we need to switch the input controller of the hand model
        // only check if controller input source does not exist on hands yet
        const model = new HandModel(c.controller, c.inputSource)

        model.addEventListener('connected', () => {
          console.log('DETECTED')
        })

        model.addEventListener('disconnected', () => {
          console.log('UNDETECTED')
        })

        newHands.push(model)

        // model.rotateX(Math.PI / 2)
        // model.rotateY(((index === 0 ? -1 : 1) * Math.PI) / 2)

        // c.controller.add(model)

        // TEMPORARY. REMOVE THIS AND SHOW IN RENDER METHOD
        // scene.add(model)
      })

      setHands(newHands)
    }

    // const controller1 = gl.xr.getController(0)
    // controller1.add(new HandModel(controller1))

    // const controller2 = gl.xr.getController(1)
    // controller2.add(new HandModel(controller2))

    // controllers.map((c) => {
    //   c.controller.add(new HandModel(c.controller))
    //   c.controller.add(new Mesh(new BoxBufferGeometry(0.1, 0.1, 0.1)))
    // })

    // const controller1 = gl.xr.getController(0)
    // controller1.add(new HandModel(controller1))
    // // scene.add(controller1)

    // const controller2 = gl.xr.getController(1)
    // controller2.add(new HandModel(controller2))
    // // scene.add(controller2)

    // const hand1 = gl.xr.getHand(0)
    // hand1.add(new HandModel(hand1))
    // // scene.add(hand1)
    // hands.current.push(hand1)

    // // // @ts-ignore
    // const hand2 = gl.xr.getHand(1)
    // hand2.add(new HandModel(hand2))
    // // scene.add(hand2)
    // hands.current.push(hand2)
    // // }

    // console.log(session)
    // }
    // debugger
    // if (Object.values((session as XRSession).inputSources).some((source) => source.hand === null)) {
    //   setHandTracking(false)
    // } else {
    //   setHandTracking(true)
    // }
    // }
    // get devices from session
    // console.log(gl.xr.getSession(), controllers)
  }, [controllers])

  // https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Inputs#enumerating_input_sources
  useEffect(() => {
    console.log('registered')
    const session = gl.xr.getSession()
    session?.addEventListener('inputsourceschange', (event) => {
      console.log(event)
    })

    return () => {}
  }, [isPresenting])

  // useEffect(() => {
  //   console.log('gl state refreshed')

  // }, [gl, scene])

  // WE CAN DO THIS WITH EVENT LISTENER
  // useFrame(() => {
  //   const session = gl.xr.getSession()
  //   // console.log(session?.inputSources)
  //   if (session && (session as XRSession)?.inputSources.some((source) => source.hand)) {
  //     // check for isPresenting?
  //     // console.log('got active session')
  //     // console.log(session)
  //     // console.log('hand trackng enabled')
  //     setHandTracking(true)
  //   } else {
  //     setHandTracking(false)
  //   }
  // })

  useEffect(() => {
    console.log(handTracking)
    if (handTracking) {
      // controllers.map((c, index) => {
      //   c.controller.remove(hands[index])
      // })

      hands.map((hand, index) => {
        // for some reason the indexes are inverted, meaning that the hand gets drawn all funky
        // How do we fix this?
        hand.controller = gl.xr.getHand(1 - index)
      })

      // remove from controller

      // add to hands group
    } else {
      hands.map((hand, index) => {
        // for some reason the indexes are inverted, meaning that the hand gets drawn all funky
        // How do we fix this?
        hand.controller = gl.xr.getHand(1 - index)
        hand.children[0].position.set(0, 0, 0)
        hand.children[0].rotation.set(0, 0, 0)
      })

      // remove from hands group
      // add to controller group
    }

    setHands([...hands])
  }, [handTracking])

  // useEffect(() => {
  //   if (handTracking) {
  //     controllers.forEach((c) => (c.controller.visible = false))
  //     hands.current.map((h) => (h.visible = true))
  //   } else {
  //     controllers.forEach((c) => (c.controller.visible = true))
  //     hands.current.map((h) => (h.visible = false))
  //   }
  // }, [handTracking])

  // console.log(hands)

  // we DO NOT want to render the hands in the cntroller entity
  // since these get hidden (?) when hands show up
  // <primitive object={c.controller} key={index}>
  //   {/* <mesh geometry={new BoxBufferGeometry(0.1, 0.1, 0.1)} material={new MeshBasicMaterial({ color: 'red' })} /> */}
  // </primitive>

  return (
    <primitive object={player}>
      {controllers.map((controller, index) => {
        // if not hand tracking
        const hand = hands.find((h) => h.inputSource.handedness === controller.inputSource.handedness)
        console.log(controller.inputSource.handedness, controller.controller, hand, handTracking)
        return (
          <>
            <primitive object={controller.controller} dispose={null}>
              {/* if not hand tracking render the following */}
              {/* <group rotation={[Math.PI / 2, 0, 0]}> */}
              {!handTracking && hand && <primitive object={hand} dispose={null} />}
              {/* </group> */}
              {/* additional stuff that needs to be hidden when palms are upside down (extra ui stuff) */}
              <mesh name={`uiblock${controller.inputSource.handedness}`}>
                <boxBufferGeometry args={[0.1, 0.1, 0.1]} />
              </mesh>
            </primitive>
            {handTracking && hand && <primitive object={hand} dispose={null} />}
          </>
        )
      })}
    </primitive>
  )
}
