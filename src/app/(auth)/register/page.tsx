"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ChefHat, Mail, Lock, User, Building, ArrowRight, Check, Phone } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    restaurantName: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError("Por favor, preencha todos os campos");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          restaurantName: formData.restaurantName,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Conta criada, mas falha no login. Tente entrar manualmente.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar com o servidor");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Infinity Comanda AI" className="h-8 w-auto" />
          <span className="text-xl font-display font-bold text-white">Infinity Comanda AI</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Comece a vender mais hoje
          </h1>
          <div className="space-y-4">
            {[
              "Setup em 5 minutos",
              "QR Code automático",
              "IA para pedidos",
              "PIX integrado",
              "Cozinha conectada",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">
          14 dias grátis • Sem cartão de crédito
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <img src="/logo.png" alt="Infinity Comanda AI" className="h-8 w-auto" />
              <span className="text-xl font-display font-bold">Infinity Comanda AI</span>
            </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {step === 1 ? "Criar sua conta" : "Configurar restaurante"}
            </h2>
            <p className="text-gray-400">
              {step === 1
                ? "Insira seus dados pessoais"
                : "Configure seu estabelecimento"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "gradient-primary text-white" : "bg-surface text-gray-400"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? "gradient-primary" : "bg-surface"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "gradient-primary text-white" : "bg-surface text-gray-400"
              }`}
            >
              2
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nome do restaurante
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleChange}
                      placeholder="Ex: Bar & Restaurante Central"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repita a senha"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-surface border border-surface-600 focus:border-primary focus:outline-none placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-lg bg-surface text-white font-medium hover:bg-surface-600 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Criar Conta</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}