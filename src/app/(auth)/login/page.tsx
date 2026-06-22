"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/estabelecimento/demo-establishment";
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Infinity Comanda AI" className="h-8 w-auto" />
          <span className="text-xl font-display font-bold text-white">Infinity Comanda AI</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-bold text-white leading-tight">
            Transforme cada mesa em uma experiência única
          </h1>
          <p className="text-white/80 text-lg">
            QR Code na mesa, IA para pedidos, PIX instantâneo.
            Tudo que você precisa para vender mais.
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/60 text-sm">
          <span>+500 restaurantes</span><span>•</span><span>+50.000 pedidos/mês</span><span>•</span><span>99.9% uptime</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="Infinity Comanda AI" className="h-8 w-auto" />
            <span className="text-xl font-display font-bold">Infinity Comanda AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400">Entre para acessar seu painel administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-error/10 text-error text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-700 focus:border-primary focus:outline-none placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-surface-700 focus:border-primary focus:outline-none placeholder:text-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="bg-surface-700 border-surface-600" />
                Lembrar-me
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </p>

          <div className="mt-8 p-4 bg-surface border border-surface-700">
            <p className="text-xs text-gray-500 mb-2">Demo credentials:</p>
            <p className="text-sm">Email: admin@demo.com</p>
            <p className="text-sm">Senha: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}