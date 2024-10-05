import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Homepage from "./pages/Homepage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
