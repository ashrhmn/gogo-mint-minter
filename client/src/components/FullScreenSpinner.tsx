import React from "react";
import Spinner from "./Spinner";

const FullScreenSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 w-full h-[100vh] flex justify-center items-center scale-150">
      <Spinner />
    </div>
  );
};

export default FullScreenSpinner;
