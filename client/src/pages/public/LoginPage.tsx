import { useForm } from "react-hook-form";
import NeonButton from "../../components/atoms/NeonButton";
import useAuthStore from "../../store/useAuthStore";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/atoms/Toast";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

interface LoginValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { push } = useToast();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { data } = await api.post("/auth/login", values);
      setAuth({ user: data.user, token: data.token });
      push({ message: 'Logged in', type: 'success' });
      navigate("/feed");
    } catch (err: any) {
      push({ message: err?.response?.data?.message ?? 'Login failed', type: 'error' });
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-bgDark px-6 py-12 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-6 rounded-lg bg-surface/80 p-8 shadow-neon">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted">Log in to stay connected with the community.</p>
        </header>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email", { required: 'Email is required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' } })}
            type="email"
            className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white outline-none"
            required
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            {...register("password", { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
            type="password"
            className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white outline-none"
            required
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <NeonButton type="submit" className="w-full justify-center">
          Login
        </NeonButton>
        <div className="text-center">
          <p className="text-sm text-muted">Or</p>
          <GoogleSignInButton />
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
