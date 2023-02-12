import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/root";
import ErrorPage from "./pages/error";
import MintPage from "./pages/mint-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DAppProvider, DAppProviderProps } from "@usedapp/core";
import { Toaster } from "react-hot-toast";
import { RPC_URLS } from "./configs/app.config";

const App = () => {
  const router = createBrowserRouter([
    {
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/:uid",
          element: <MintPage />,
        },
      ],
    },
  ]);

  const client = new QueryClient();

  const config: DAppProviderProps["config"] = {
    readOnlyUrls: RPC_URLS as Record<number, string>,
  };

  return (
    <DAppProvider config={config}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </QueryClientProvider>
    </DAppProvider>
  );
};

export default App;
