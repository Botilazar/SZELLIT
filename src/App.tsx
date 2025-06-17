import { Route, Routes, BrowserRouter } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import SignInPage from "./Components/SignInPage/SignInPage";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="*" element={<WelcomePage />} />
          <Route path="/login" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
