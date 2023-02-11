import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = ({ msg }: { msg?: string }) => {
  const error: any = useRouteError();
  console.error(error);
  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error?.statusText || error?.message || msg}</i>
      </p>
    </div>
  );
};

export default ErrorPage;
