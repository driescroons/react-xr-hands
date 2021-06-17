import ReactDOM from 'react-dom'
import React from 'react'
import { VRCanvas } from '@react-three/xr'
import './styles.css'
import { Hands } from './Hands'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { BoxBufferGeometry, MeshBasicMaterial } from 'three'

// Oculus Browser with #webxr-hands flag enabled
function App() {
  return (
    <VRCanvas
      onCreated={(args) => {
        args.gl.setClearColor('grey')
        void document.body.appendChild(VRButton.createButton(args.gl))
      }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <mesh geometry={new BoxBufferGeometry(0.1, 0.1, 0.1)} material={new MeshBasicMaterial({ color: 'red' })} position={[0, 0, -2]} />
      {/* <DefaultXRControllers /> */}
      {/* <Hands /> */}
      <Hands />
    </VRCanvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
