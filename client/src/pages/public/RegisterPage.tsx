import { useForm } from 'react-hook-form';
import type { AxiosError } from 'axios';
import NeonButton from '../../components/atoms/NeonButton';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/atoms/Toast';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import LiquidEther from '@/components/LiquidEther';

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'alumni';
  inviteCode?: string;
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({
    defaultValues: {
      role: 'student'
    }
  });
  const navigate = useNavigate();
  const { push } = useToast();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.post('/auth/register', values);
      push({ message: 'Registered, please login', type: 'success' });
      navigate('/login');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ?? error.message ?? 'Registration failed';
      push({ message, type: 'error' });
    }
  });

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-bgDark px-6 py-12 text-white">
      <div className="absolute inset-0">
        <LiquidEther
          style={{
            width: '100%',
            height: '100%',
            filter: 'saturate(1.25) contrast(1.08)',
            background:
              'radial-gradient(circle at 20% 20%, rgba(82,39,255,0.45), transparent 55%), radial-gradient(circle at 80% 30%, rgba(255,159,252,0.35), transparent 60%), #050217'
          }}
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          className="pointer-events-none"
          autoDemo
          autoSpeed={0.45}
          autoIntensity={2}
          mouseForce={18}
          cursorSize={90}
          isViscous
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050217]/10 via-transparent to-[#050217]/60" />
      </div>
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-xl space-y-6 rounded-lg bg-surface/80/90 p-8 shadow-neon backdrop-blur"
      >
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted">
            Choose your role to personalize the experience.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Invalid email'
                }
              })}
              type="email"
              className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
              required
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' }
            })}
            type="password"
            className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
            required
          />
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              {...register('role')}
              className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Invite Code (optional)
            </label>
            <input
              {...register('inviteCode')}
              className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
        <NeonButton type="submit" className="w-full justify-center">
          Register
        </NeonButton>
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted">Or continue with</p>
          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>
      </form>
    </main>
  );
};

export default RegisterPage;
