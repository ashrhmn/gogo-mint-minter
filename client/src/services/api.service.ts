import { z, ZodError } from "zod";
import { ZodUtils } from "../utils/zod.utils";
import axios from "axios";

export interface iAxios<ParamObjectType, DataObjectType> {
  url: string;
  params?: ParamObjectType;
  data?: DataObjectType;
  method?: string;
  dataType?: string;
}

export const service = <
  Param extends z.ZodTypeAny,
  Response extends z.ZodTypeAny,
  Body extends z.ZodTypeAny
>(
  info: iAxios<z.infer<Param> | FormData, z.infer<Body>>,
  schemas?: {
    responseSchema?: Response;
    paramSchema?: Param;
    bodySchema?: Body;
  }
): Promise<z.infer<Response>> => {
  return new Promise((resolve, reject) => {
    const {
      url,
      params = {},
      data = {},
      method = "get",
      // dataType = "Json",
    } = info;

    if (
      !!schemas?.bodySchema &&
      ["post", "patch", "put"].includes(method.toLowerCase()) &&
      !ZodUtils.followsSchema(data, schemas.bodySchema)
    )
      reject("BodySchema does not match");

    if (
      !!schemas?.paramSchema &&
      !ZodUtils.followsSchema(params, schemas.paramSchema)
    )
      reject("ParamSchema does not match");

    const headers = {
      // Authorization: "Bearer " + AuthUtils.bearerToken(),
      // "Content-Type":
      //   dataType === "FormData"
      //     ? "multipart/form-data"
      //     : "application/json;charset=UTF-8",
    };

    // axiosInstance.withCredentials = true;
    axios
      .create({ baseURL: "/api" })
      .request({ method, url, data, headers, params })
      .then((response) => {
        resolve(
          !!schemas?.responseSchema
            ? schemas.responseSchema.parse(response.data)
            : response.data
        );
      })
      .catch((error) => {
        console.log(error);
        if (error instanceof ZodError) reject(error.flatten());
        else reject(error);
      });
  });
};
