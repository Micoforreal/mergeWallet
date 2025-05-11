import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import './App.css'
import HomePage from './pages/home';
import Layout from './components/layout';
import Setting from './pages/settings';
import CreateAccount from './pages/createAccount';
import GenerteNewWallet from './pages/generateNewWallet';

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" >
        <Route path="get-started" element={<CreateAccount/>} />
            <Route path='generate-new-wallet' exact element={<GenerteNewWallet />} />

        
           <Route element={<Layout />}>
        <Route path='home' exact element={<HomePage />} />
           </Route>
          </Route>
    )
  );
  return (
    <>
    
      <RouterProvider router={router} />
     </>
  )
}

export default App
