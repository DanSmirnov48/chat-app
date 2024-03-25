import { Route, Routes } from "react-router-dom";
import RootLayout from "./_root/RootLayout";
import { Home } from "./_root/pages";
import AuthLayout from "./_auth/AuthLayout";
import { SignIn, SignUp } from "./_auth/forms";

export default function App() {
  return (
    <main className="flex">
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Route>

        {/* Public Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </main>
  );
}
