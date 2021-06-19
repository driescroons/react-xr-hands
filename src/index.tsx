import './styles.css'

import { OrbitControls } from '@react-three/drei'
import { VRCanvas } from '@react-three/xr'
import React from 'react'
import ReactDOM from 'react-dom'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'

import { DefaultHandControllers } from './DefaultHandControllers'

// Oculus Browser with #webxr-hands flag enabled
function App() {
  return (
    <VRCanvas
      onCreated={(args) => {
        args.gl.setClearColor('grey')
        void document.body.appendChild(VRButton.createButton(args.gl))
      }}>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <DefaultHandControllers />
    </VRCanvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
