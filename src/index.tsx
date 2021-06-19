import './styles.css'

import { OrbitControls } from '@react-three/drei'
import { VRCanvas, Hands } from '@react-three/xr'
import React from 'react'
import ReactDOM from 'react-dom'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'

import { DefaultHandControllers } from './DefaultHandControllers'

import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom'

// Oculus Browser with #webxr-hands flag enabled
function HandControllersExample() {
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

function HandsExample() {
  return (
    <VRCanvas
      onCreated={(args) => {
        args.gl.setClearColor('grey')
        void document.body.appendChild(VRButton.createButton(args.gl))
      }}>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Hands />
    </VRCanvas>
  )
}

ReactDOM.render(
  <Router>
    <nav>
      <ul>
        <li>
          <Link to="/hands">Hands</Link>
        </li>
        <li>
          <Link to="/default-hand-controllers">Default Hand Controllers</Link>
        </li>
      </ul>
    </nav>
    <Route path="/default-hand-controllers">
      <HandControllersExample />
    </Route>
    <Route path="/hands">
      <HandsExample />
    </Route>
    <Route path="/">
      <Redirect to="/hands" />
    </Route>
  </Router>,
  document.getElementById('root')
)
