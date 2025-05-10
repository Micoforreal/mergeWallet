import { Home, Repeat, Settings, ShoppingBag } from "lucide-react";

const Navigation = () => {
  const navLink = [
    { name: "home", logo: <Home /> },
    { name: "home", logo: <Repeat /> },
    { name: "home", logo: <ShoppingBag /> },
    { name: "home", logo: <Settings /> },



  ];

  return (
    <>
      <section className="relative w-full">
        <div className=" border-2 w-full max-w-[640px] h-[80px] flex justify-center items-center fixed bottom-0 left-1/2 -translate-x-1/2 z-30">
          <nav className="flex items-center justify-between  w-full space-x  px-6 py-2 rounded-full ">
          {navLink.map((item, index)=>(
            <div key={index}>
                <div className="">{item.logo}</div>
            </div>
          ))}
          </nav>
        </div>
      </section>
    </>
  );
};

export default Navigation;
