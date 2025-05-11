import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";
import HomePage from "./pages/home";
import Layout from "./components/layout";
import Setting from "./pages/settings";
import CreateAccount from "./pages/createAccount";
import GenerateNewWallet from "./pages/generateNewWallet";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route index element={<Navigate to="/create-account" replace />} />
        <Route path="create-account" element={<CreateAccount />} />
        <Route
          path="generate-new-wallet"
          exact
          element={<GenerateNewWallet />}
        />

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
