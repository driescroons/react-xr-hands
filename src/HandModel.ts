import { XRController } from '@react-three/xr'
import { Group, Matrix4, Mesh, Object3D, ObjectLoader, Quaternion, Vector2, Vector3, XRHandedness, XRInputSource } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { idlePose } from './poses/idle'
import { pinchPose } from './poses/pinch'
import { defaultPose } from './poses/default'

const DEFAULT_HAND_PROFILE_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/'

const TOUCH_RADIUS = 0.01
const POINTING_JOINT = 'index-finger-tip'

const XRHandJoints = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip'
]

export type XRPose = 'pinch' | 'idle' | 'default'

const poses: { [key in XRPose]: object } = {
  idle: idlePose,
  pinch: pinchPose,
  default: defaultPose
}

class HandModel extends Object3D {
  controller: Group
  bones: Object3D[] = []

  inputSource: XRInputSource
  path: string

  model: Object3D
  isHandTracking: boolean

  constructor(controller: Group, inputSource: XRInputSource) {
    super()

    this.controller = controller
    this.inputSource = inputSource
  }

  // onSelectStart = (e: Event & { data: XRInputSource; target: Group }) => {
  //   console.log(this.inputSource, this.uuid, e.data.handedness, e.target.uuid)
  //   if (this.inputSource.handedness === e.data.handedness) {
  //     console.log('eventje gelegd', e)
  //   }
  // }

  // if (!this.controller.hasEventListener('selectstart', this.onSelectStart)) {
  //   console.log('registered event', this.inputSource)
  //   this.controller.addEventListener('selectstart', this.onSelectStart)
  // }

  getJoints = () => {
    if (this.inputSource.handedness === 'right') {
      const joints = (this.controller as any).joints || {}
      // console.log(joints, this.inputSource)
      // console.log(JSON.stringify(joints))

      if (Object.keys(joints).length > 0) {
        const posDif = joints['wrist'].position

        console.log(posDif)

        const formatted = Object.keys(joints).reduce((obj, key) => {
          console.log(key, joints[key], joints[key].position)

          const joint = joints[key]
          obj[key] = {
            position: joint.position.clone().sub(posDif).toArray(),
            quaternion: joint.quaternion.toArray()
          }

          return obj
        }, {})

        console.log(JSON.stringify(formatted))

        // now mirror for the other hand
      }
    }
  }

  setPose(poseType: XRPose = 'idle') {
    if (!this.isHandTracking) {
      const pose = poses[poseType]
      // const posDif = new Vector3().fromArray(idle.wrist.position)
      for (let i = 0; i < this.bones.length; i++) {
        const bone = this.bones[i]
        if (bone) {
          const joint = pose[(bone as any).jointName]
          // console.log(posDif)

          // console.log(joint)
          // const XRJoint = ((this.controller as any)?.joints || [])[(bone as any).jointName]
          // if (XRJoint?.visible) {
          const position = joint.position
          bone.position.copy(new Vector3().fromArray(position))
          bone.quaternion.copy(new Quaternion().fromArray(joint.quaternion))

          // if (this.inputSource.handedness === 'left') {
          // bone.applyMatrix4(new Matrix4().makeScale(-1, 1, 1))

          // bone.scale.set(-1, 1, 1);
          // bone.quaternion.invert();
          // }

          // console.log(bone)
          // }
        }
      }
    }
  }

  load(controller: Group, inputSource: XRInputSource, isHandTracking: boolean) {
    this.controller.remove(this)

    this.controller = controller
    this.inputSource = inputSource
    this.isHandTracking = isHandTracking

    super.clear()
    const loader = new GLTFLoader()
    loader.setPath(DEFAULT_HAND_PROFILE_PATH)
    const fileHandedness = isHandTracking ? this.inputSource.handedness : 'right'
    loader.load(`${fileHandedness}.glb`, (gltf) => {
      this.model = gltf.scene.children[0]
      // const object = gltf.scene.children[0]
      super.add(this.model)

      const mesh = this.model.getObjectByProperty('type', 'SkinnedMesh')! as Mesh
      mesh.frustumCulled = false
      mesh.castShadow = true
      mesh.receiveShadow = true
      ;(mesh.material as any).side = 0 // Workaround: force FrontSide = 0

      this.bones = []
      XRHandJoints.forEach((jointName: string) => {
        const bone = this.model.getObjectByName(jointName)
        if (bone !== undefined) {
          ;(bone as any).jointName = jointName
        } else {
          console.log(`Couldn't find ${jointName} in ${this.inputSource.handedness} hand mesh`)
        }
        this.bones.push(bone!)
      })

      // const defaultPose = XRHandJoints.reduce((obj, joint) => {
      //   const bone = this.model.getObjectByName(joint)

      //   if (bone) {
      //     obj[joint] = {
      //       position: bone.position.toArray(),
      //       quaternion: bone.quaternion.toArray()
      //     }
      //   }

      //   return obj
      // }, {})

      // console.log(this.inputSource)
      // console.log(JSON.stringify(defaultPose))

      if (!isHandTracking) {
        this.setPose('idle')
        if (this.inputSource.handedness === 'left') {
          this.applyMatrix4(new Matrix4().makeScale(-1, 1, 1))
        }
      }

      this.controller.add(this)
    })
  }

  updateMatrixWorld(force: boolean) {
    super.updateMatrixWorld(force)

    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i]
      if (bone) {
        const XRJoint = ((this.controller as any)?.joints || [])[(bone as any).jointName]
        if (XRJoint?.visible) {
          const position = XRJoint.position
          bone.position.copy(position)
          bone.quaternion.copy(XRJoint.quaternion)
        }
      }
    }
  }
}

export { HandModel }
