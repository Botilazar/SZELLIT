import "./SignInPage.css";

const SignInPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold">Sign in</h2>
        <p className="text-center text-gray-400">
          or{" "}
          <a href="#" className="text-blue-400 hover:underline">
            make a new account
          </a>
        </p>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="****"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                className="mr-2 bg-gray-700 border-gray-600 rounded"
              />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-400 hover:underline">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-400"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
