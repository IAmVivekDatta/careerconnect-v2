import { Post } from "../../types";
import Avatar from "../atoms/Avatar";

const PostCard = ({ post }: { post: Post }) => {
  return (
    <article className="neon-border space-y-3 rounded-lg bg-surface/80 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={post.author.profilePicture} alt={post.author.name} />
        <div>
          <p className="text-sm font-semibold">{post.author.name}</p>
          <p className="text-xs text-muted">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm text-white/90">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post attachment" className="max-h-72 w-full rounded-lg object-cover" />
      )}
      <div className="flex items-center gap-4 text-xs text-muted">
        <span>{post.likes.length} likes</span>
      </div>
    </article>
  );
};

export default PostCard;
