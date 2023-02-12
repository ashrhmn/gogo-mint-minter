import { AxiosError } from "axios";

export const handleError = (error: any | never) => {
  if (error instanceof AxiosError) throw new Error(error.message);
  if (typeof error === "string") throw new Error(error);
  throw new Error(error as any);
};
