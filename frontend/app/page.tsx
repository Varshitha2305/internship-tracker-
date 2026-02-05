"use client";

import { useRouter } from "next/navigation";
import { Lock, Mail, LayoutDashboard, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT: Branding / Vision (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-12 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-6 shadow-inner ring-1 ring-white/20">
            <LayoutDashboard className="w-10 h-10 text-indigo-200" />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Master Your Career <span className="text-indigo-200">Journey</span>
          </h1>
          <p className="text-lg text-indigo-100 opacity-90 leading-relaxed">
            Track applications, manage interviews, and land your dream role with the ultimate student dashboard.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* GOOGLE BUTTON */}
            {/* GOOGLE BUTTON */}
            <a
              href="http://localhost:5000/auth/google"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <FcGoogle className="w-6 h-6" />
              Sign in with Google
            </a>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-600">Password</label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Don't have an account? <a href="#" className="text-indigo-600 font-bold hover:underline">Sign up</a>
          </p>

        </div>
      </div>
    </main>
  );
}

// Google Icon Component
function FcGoogle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}
