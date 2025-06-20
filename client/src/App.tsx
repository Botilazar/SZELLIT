import { Route, Routes, BrowserRouter } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import SignInPage from "./Components/SignInPage/SignInPage";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import BrowsingPage from "./Components/BrowsingPage/BrowsingPage";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="*" element={<WelcomePage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/items" element={<BrowsingPage />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
