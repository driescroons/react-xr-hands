import { Group, Mesh, MeshBasicMaterial, Object3D, XRHandedness, XRInputSource } from 'three'
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

const modelCache = new Map<XRHandedness, Object3D>()
class HandModel extends Object3D {
  controller: Group
  bones: Object3D[] = []

  inputSource: XRInputSource
  path: string

  constructor(controller: Group, inputSource: XRInputSource) {
    super()

    this.controller = controller
    this.inputSource = inputSource

    if (modelCache.has(this.inputSource.handedness)) {
      const object = modelCache.get(this.inputSource.handedness)
      this.init(object!)
    } else {
      const loader = new GLTFLoader()
      loader.setPath(DEFAULT_HAND_PROFILE_PATH)
      console.log('GONNA LOAD SOME SHIT')
      loader.load(`${this.inputSource.handedness}.glb`, (gltf) => {
        const object = gltf.scene.children[0]
        modelCache.set(this.inputSource.handedness, object)
        this.init(object)
      })
    }
  }

  init(object: Object3D) {
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
