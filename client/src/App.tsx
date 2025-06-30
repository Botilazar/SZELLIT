import { Route, Routes, BrowserRouter } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import SignInPage from "./Components/SignInPage/SignInPage";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import BrowsingPage from "./Components/BrowsingPage/BrowsingPage";
import Footer from "./Components/Footer/Footer";
import RegisterPage from "./Components/RegisterPage/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="*" element={<WelcomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<SignInPage />} />
            <Route path="/items" element={<BrowsingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
