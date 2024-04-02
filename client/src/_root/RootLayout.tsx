import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <section className="flex flex-1 h-[calc(80vh-12rem)]">
        <Outlet />
      </section>
    </div>
  );
};

export default RootLayout;
