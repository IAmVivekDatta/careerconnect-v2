import { useForm } from "react-hook-form";
import NeonButton from "../../components/atoms/NeonButton";
import api from "../../lib/axios";
import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface AdminLoginValues {
  email: string;
  password: string;
}

const AdminLoginPage = () => {
  const { register, handleSubmit } = useForm<AdminLoginValues>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    const { data } = await api.post("/auth/login", values);
    if (data.user.role !== "admin") {
      throw new Error("Not authorized");
    }
    setAuth({ user: data.user, token: data.token });
    navigate("/admin/dashboard");
  });

  return (
    <main className="grid min-h-screen place-items-center bg-bgDark px-6 py-12 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-6 rounded-lg bg-surface/80 p-8 shadow-neon">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-neonMagenta">Admin Login</h1>
          <p className="text-sm text-muted">Secure access to moderation and analytics.</p>
        </header>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <NeonButton type="submit" className="w-full justify-center bg-neonMagenta/20">
          Enter Console
        </NeonButton>
      </form>
    </main>
  );
};

export default AdminLoginPage;
