import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login"; // Ensure yeh path sahi ho
import AppRoutes from "./routes/AppRoutes"; // Ya aapke saare protected routes

function App() {
  return (
    <>
      <Routes>
        {/* Login page bina Layout ke khulega */}
        <Route path="/login" element={<Login />} />

        {/* Baaki saare pages Layout ke andar rahenge */}
        <Route path="/*" element={
          <Layout>
            <AppRoutes />
          </Layout>
        } />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;