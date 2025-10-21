import PostComposer from "../components/organisms/PostComposer";
import FeedList from "../components/organisms/FeedList";
import RightSidebar from "../components/organisms/RightSidebar";

const FeedPage = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)]">
      <div className="space-y-6">
        <PostComposer />
        <FeedList />
      </div>
      <RightSidebar />
    </div>
  );
};

export default FeedPage;
