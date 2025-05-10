import { Outlet } from "react-router-dom";
import Navigation from "./navigation";

const Layout = ({children}) => {
    return ( 
        <div className="max-w-md mx-auto">


            <main>
                <Outlet/>
            </main>
            <Navigation/>
        </div>
     );
}
 
export default Layout;