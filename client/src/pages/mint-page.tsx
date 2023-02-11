import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getProjectByUid } from "../services/project.service";
import ErrorPage from "./error";
import FullScreenSpinner from "../components/FullScreenSpinner";

const MintPage = () => {
  const { uid } = useParams();

  const { data, status } = useQuery({
    queryKey: ["project", uid || ""],
    queryFn: () => getProjectByUid(uid || ""),
    enabled: !!uid,
  });

  console.log(data);

  if (!uid) return <ErrorPage />;
  if (status === "loading") return <FullScreenSpinner />;

  return <div>MintPage</div>;
};

export default MintPage;
