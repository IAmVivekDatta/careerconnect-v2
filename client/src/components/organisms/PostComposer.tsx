import { useForm } from "react-hook-form";
import NeonButton from "../atoms/NeonButton";
import useAuthStore from "../../store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { useToast } from "../atoms/Toast";

type FormValues = {
  content: string;
};

const PostComposer = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.post("/posts", values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  });

  const { push } = useToast();

  const onSubmit = handleSubmit((values) => {
    if (!token) return push({ message: 'Please login to post', type: 'error' });
    if (!values.content || values.content.trim().length === 0) {
      return push({ message: 'Content is required', type: 'error' });
    }
    mutation.mutate(values, {
      onSuccess: () => push({ message: 'Posted', type: 'success' }),
      onError: () => push({ message: 'Failed to post', type: 'error' })
    });
  });

  return (
    <form onSubmit={onSubmit} className="neon-border space-y-4 rounded-lg bg-surface/80 p-4">
      <textarea
        {...register("content", { required: 'Content is required' })}
        rows={3}
        placeholder="Share an update with the community"
        className="w-full resize-none rounded bg-transparent text-sm outline-none"
      />
      {errors.content && <p className="text-xs text-red-400">{errors.content.message}</p>}
      <div className="flex justify-end">
        <NeonButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Posting..." : "Post"}
        </NeonButton>
      </div>
    </form>
  );
};

export default PostComposer;
