import { Home, Repeat, Settings, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navLink = [
    { name: "home", logo: <Home /> , link:"/home"},
    { name: "home", logo: <Repeat /> , link:"/swap"},
    { name: "home", logo: <ShoppingBag /> , link:'/marketplace'},
    { name: "home", logo: <Settings /> , link:"/settings" },
  ];

  return (
    <>
      <section className="relativ  bg-primary top-0 w-full z-50">
        <div className=" border bg-white   w-full max-w-[640px] h-[70px] flex mt-10 justify-center items-center fixed  bottom-0 left-1/2 -translate-x-1/2 z-30">
          <nav className="flex items-center justify-between  w-full space-x  px-6 py-2 rounded-full ">
            {navLink.map((item, index) => (
              // <div key={index}>
                <NavLink
                key={index}
                  className={({ isActive }) =>
                    isActive ? "bg-[#000000] rounded-full  border-black w-10 h-10 flex justify-center items-center  text-gray-300 " : ""
                }
                to={item.link}
                >
                {item.logo}
                </NavLink>
              // </div>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
};

export default Navigation;
