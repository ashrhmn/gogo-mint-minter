import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/home";
import About from "./pages/about";
import RootLayout from "./layouts/root";
import ErrorPage from "./pages/error";
import MintPage from "./pages/mint-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/mint/:uid",
          element: <MintPage />,
        },
      ],
    },
  ]);

  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
