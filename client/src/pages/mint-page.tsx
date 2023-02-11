import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getProjectByUid } from "../services/project.service";
import ErrorPage from "./error";
import FullScreenSpinner from "../components/FullScreenSpinner";
import { AxiosError } from "axios";

const MintPage = () => {
  const { uid } = useParams();

  const { data, status, error } = useQuery({
    queryKey: ["project", uid || ""],
    queryFn: () => getProjectByUid(uid || ""),
    enabled: !!uid,
  });

  console.log(data);

  if (!uid) throw new Error("Invalid UID");
  if (status === "error")
    throw new Error(
      error instanceof AxiosError ? error.message : (error as any)
    );
  if (status === "loading") return <FullScreenSpinner />;

  return <div>MintPhgyfage</div>;
};

export default MintPage;
