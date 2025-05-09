import { Outlet } from "react-router-dom";
import Navigation from "./navigation";

const Layout = ({children}) => {
    return ( 
        <div>


            <main>
                <Outlet/>
            </main>
            <Navigation/>
        </div>
     );
}
 
export default Layout;