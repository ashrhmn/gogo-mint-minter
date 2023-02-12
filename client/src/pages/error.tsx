import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = ({ msg }: { msg?: string }) => {
  const error: any = useRouteError();
  console.error(error);
  return (
    <div className="flex h-[100vh] flex-col justify-center items-center">
      <h1 className="text-7xl">Oops!</h1>
      <p className="text-4xl my-4">Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error?.statusText || error?.message || msg}</i>
      </p>
    </div>
  );
};

export default ErrorPage;
