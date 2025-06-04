import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/home";
import Layout from "./components/layout";
import Setting from "./pages/settings";
import CreateAccount from "./pages/getStarted";
import GenerateNewWallet from "./pages/generateNewWallet";
import ImportWallet from "./pages/importWallet";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(

      <Route path="/">
        <Route index element={<Navigate to="/get-started" replace />} />
        <Route path="get-started" element={<CreateAccount />} />
        <Route
          path="generate-new-wallet"
          exact
          element={<GenerateNewWallet />}
        />
        <Route path="import-wallet" exact element={<ImportWallet />} />

      <Route path="/" >
        <Route path="get-started" element={<CreateAccount/>} />
            <Route path='generate-new-wallet' exact element={<GenerteNewWallet />} />


        <Route element={<Layout />}>
          <Route path="home" exact element={<HomePage />} />
        </Route>
      </Route>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
