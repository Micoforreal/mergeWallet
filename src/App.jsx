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

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout/>}>
        <Route index element={<HomePage />} />
        {/* <Route path='setting' element={<Setting/>}/> */}

        
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
