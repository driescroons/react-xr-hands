import { Group, Mesh, MeshBasicMaterial, Object3D, XRInputSource } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { XRHandMeshModel } from 'three/examples/jsm/webxr/XRHandMeshModel'

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

class HandModel extends Object3D {
  // only for hand tracking
  // disable otherwise
  motionController: XRHandMeshModel | null
  controller: Group
  bones: Object3D[] = []

  inputSource: XRInputSource
  path: string

  connected: boolean = false

  constructor(controller: Group, inputSource: XRInputSource) {
    super()

    this.controller = controller
    this.motionController = null

    // controller.addEventListener('connected', (event) => {
    //   // console.log('controller connected')
    //   const inputSource = event.data

    // console.log(inputSource)

    // inputSource.hand &&
    // if (!this.connected) {
    this.inputSource = inputSource

    const loader = new GLTFLoader()
    loader.setPath(DEFAULT_HAND_PROFILE_PATH)
    loader.load(`${this.inputSource.handedness}.glb`, (gltf) => {
      const object = gltf.scene.children[0]
      super.add(object)

      const mesh = object.getObjectByProperty('type', 'SkinnedMesh')! as Mesh
      mesh.frustumCulled = false
      mesh.castShadow = true
      mesh.receiveShadow = true
      ;(mesh.material as any).side = 0 // Workaround: force FrontSide = 0

      XRHandJoints.forEach((jointName: string) => {
        const bone = object.getObjectByName(jointName)
        if (bone !== undefined) {
          ;(bone as any).jointName = jointName
        } else {
          console.log(`Couldn't find ${jointName} in ${this.inputSource.handedness} hand mesh`)
        }
        this.bones.push(bone!)
      })

      this.connected = true
    })

    // this.motionController = new XRHandMeshModel(this, this.controller, DEFAULT_HAND_PROFILE_PATH, this.inputSource.handedness)
    // }
    // })

    // controller.addEventListener('disconnected', () => {
    //   // what do we do here? do we remove the children if disconnected? no right?
    //   console.log('this will probably get thrown and you cant see anything onsc reen anymore since controller was disconnected')
    //   this.clear()
    //   // this.motionController = null
    // })
  }

  updateMatrixWorld(force: boolean) {
    super.updateMatrixWorld(force)

    // for no hand tracking, we can "record" the bones positions and set these afterwards based on controller state
    // in menu => pointing, in game => "grabbing mode"
    // console.log('trynna render', this.connected)
    // console.log(this.connected)
    // console.log(this.connected)
    if (this.connected) {
      const XRJoints = (this.controller as any).joints || []

      for (let i = 0; i < this.bones.length; i++) {
        const bone = this.bones[i]
        if (bone) {
          const XRJoint = XRJoints[(bone as any).jointName]
          if (XRJoint?.visible) {
            // console.log('visible')
            const position = XRJoint.position
            // console.log('bone updated')
            bone.position.copy(position)
            bone.quaternion.copy(XRJoint.quaternion)
            // bone.scale.setScalar( XRJoint.jointRadius || defaultRadius );
          }
        }
      }
    }
  }
}

export { HandModel }
