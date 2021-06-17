import { useXR, XREvent } from '@react-three/xr'
import React, { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { HandModel } from './HandModel'
import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial, XRControllerEventType, XRInputSource, XRSession } from 'three'
import { OculusHandModel } from 'three/examples/jsm/webxr/OculusHandModel'

export function Hands() {
  const { gl, scene } = useThree()
  const { controllers, player } = useXR()

  // const hands = useRef<HandModel[]>([]);
  const [hands, setHands] = useState<HandModel[]>([])

  const [forceRefresh, setForceRefresh] = useState(false)

  const [handTracking, setHandTracking] = useState<boolean | null>(null)

  useEffect(() => {
    // console.log('controllers loop', controllers.length)
    // if (hands.current.length === 0 && controllers.length > 0) {
    // if (hands.current.length !== controllers.length) {
    //   controllers.map((c, index) => {
    //     // const hand = gl.xr.getHand(index)
    //     // const model = new HandModel(hand)
    //     // hand.add(model)

    //     // hands.current.push(hand)

    //     // scene.add(model)

    //     // // hand.dispatchEvent({ type: 'connected', data: c.inputSource, fake: true })

    //     // setForceRefresh(!forceRefresh)
    //     // // scene.add(hand)

    //     const hand = gl.xr.getController(index)
    //     const model = new OculusHandModel(hand)

    //     hand.add(model)

    //     hand.dispatchEvent({ type: 'connected', data: c.inputSource, fake: true })
    //     scene.add(hand)
    //   })
    // }?

    const session = gl.xr.getSession()!

    console.log('controller state changed. does this get rerun when we switch to hands?', controllers.length)

    // we nativally get the controllers before the connected event is thrown
    // based on this event, we'll load the models for them.

    const newHands: HandModel[] = []
    controllers.map((c, index) => {
      // if we switch to hands, we need to switch the input controller of the hand model
      // only check if controller input source does not exist on hands yet
      newHands.push(new HandModel(c.controller, c.inputSource))
    })

    setHands(newHands)

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

  useEffect(() => {
    console.log('gl state refreshed')
    const session = gl.xr.getSession()
    if (session) {
      // check for isPresenting?
      console.log('got active session')
      if (Object.values((session as XRSession).inputSources).some((source) => source.hand !== null)) {
        setHandTracking(true)
      } else {
        setHandTracking(false)
      }
    }
  }, [gl, scene])

  useEffect(() => {
    if (handTracking) {
      hands.map((hand, index) => {
        hand.controller = gl.xr.getHand(index)
      })
    } else {
      hands.map((hand, index) => {
        hand.controller = gl.xr.getController(index)
      })
    }
  }, [handTracking])

  console.log('RERENDER', controllers, hands)

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
    <>
      {controllers.map((controller, index) => {
        // if not hand tracking
        if (hands[index]) {
          return (
            <>
              <primitive object={controller.controller}>
                {/* if not hand tracking render the following */}
                <primitive object={hands[index]} fallback={null} />
                {/* additional stuff that needs to be hidden when palms are upside down (extra ui stuff) */}
                <mesh>
                  <boxBufferGeometry args={[0.1, 0.1, 0.1]} />
                </mesh>
              </primitive>
              {handTracking && (
                <primitive object={player}>
                  <primitive object={hands[index]} fallback={null} />
                </primitive>
              )}
            </>
          )
        }

        return null
        // hands.current[index] && <primitive object={hands.current[index]} fallback={null} />
      })}
    </>
  )

  // return (
  //   <mesh>
  //     <boxBufferGeometry args={[0.1, 0.1, 0.1]} />
  //   </mesh>
  // )

  // return null
}
