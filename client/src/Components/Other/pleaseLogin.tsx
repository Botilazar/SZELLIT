// src/Components/PleaseLogin/PleaseLogin.tsx
import { useNavigate, useParams } from "react-router-dom";
import { FaUserLock } from "react-icons/fa";

const PleaseLogin = () => {
    const navigate = useNavigate();
    const { lng } = useParams()

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
            <FaUserLock className="text-6xl text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-2">You need to log in</h1>
            <p className="text-gray-500 mb-6">
                This page requires an account. Please log in to continue.
            </p>
            <button
                onClick={() => navigate(`/${lng}/login`)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
            >
                Go to Login
            </button>
        </div>
    );
};

export default PleaseLogin;
