import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import LoaderSkeleton from "../molecules/LoaderSkeleton";
import PostCard from "../molecules/PostCard";
import { Post } from "../../types";

const FeedList = () => {
  const { data, isLoading } = useQuery<{ data: Post[] }>({
    queryKey: ["feed"],
    queryFn: async () => {
      const response = await api.get("/posts", { params: { limit: 20 } });
      return response.data;
    }
  });

  if (isLoading) {
    return <LoaderSkeleton lines={4} />;
  }

  return (
    <div className="space-y-4">
      {data?.data?.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default FeedList;
