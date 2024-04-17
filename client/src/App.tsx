import { Route, Routes } from "react-router-dom";
import RootLayout from "./_root/RootLayout";
import { Home } from "./_root/pages";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <main className="flex">
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
      <Toaster expand={false} position="top-right" richColors closeButton className="" />
    </main>
  );
}
