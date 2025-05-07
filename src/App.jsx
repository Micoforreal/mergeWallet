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

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        {/* Redirect root to get-started */}
        <Route index element={<HomePage />} />
        
        {/* Get Started page */}
        {/* <Route path="get-started" element={<GetStarted />} /> */}
        
        {/* Main app routes with shared layout */}
         {/* <Route element={<RootLayout />}> */}
          {/* <Route path="home" element={<HomePage />} />
          <Route path="gang" element={<Gang />} />
          <Route path="casino" element={<Casino />} />
          <Route path="earn" element={<Earn />} />
          <Route path="meme" element={<Meme />} />  */}
        {/* </Route> */}
        
        {/* Standalone pages */}
        {/* <Route path="leaderboard" element={<LeaderBoard />} />
        <Route path="account" element={<Account />} />
        <Route path="settings" element={<Settings />} /> */}
      </Route>
    )
  );
  return (
    <>
    
      <RouterProvider router={router} />
      {/* <Toaster position="top-center" reverseOrder={false} /> */}
    </>
  )
}

export default App
