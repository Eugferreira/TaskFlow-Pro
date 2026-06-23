"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Requisitos de força de senha
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/', { replace: true });
    }
  }, [session, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Por favor, preencha todos os campos.');
      return;
    }

    // Validar força da senha apenas no cadastro
    if (isSignUp && !isPasswordStrong) {
      showError('A senha não atende a todos os requisitos de segurança.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          showSuccess('Cadastro realizado com sucesso!');
          navigate('/', { replace: true });
        } else {
          showSuccess('Cadastro realizado! Verifique seu e-mail para confirmação.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showSuccess('Bem-vindo de volta!');
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      showError(error.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-900 dark:bg-gray-900">
        {/* Logo / Header */}
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            TaskFlow Pro
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Crie sua conta gratuita agora' : 'Sua gestão inteligente de tarefas começa aqui'}
          </p>
        </div>

        {/* Formulário Nativo */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Endereço de e-mail
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl pl-10 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl pl-10 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Indicador de Força de Senha (apenas no cadastro) */}
          {isSignUp && password.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-2 dark:border-gray-800 dark:bg-gray-900/50">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Requisitos da senha:</p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordRequirements.minLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className={passwordRequirements.minLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"}>
                    Mínimo 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordRequirements.hasUppercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className={passwordRequirements.hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"}>
                    Letra maiúscula
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordRequirements.hasLowercase ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className={passwordRequirements.hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"}>
                    Letra minúscula
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  {passwordRequirements.hasNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className={passwordRequirements.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"}>
                    Pelo menos um número
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:col-span-2">
                  {passwordRequirements.hasSpecial ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className={passwordRequirements.hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"}>
                    Caractere especial (ex: @, #, $, !)
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (isSignUp && !isPasswordStrong)}
            className="w-full rounded-xl bg-indigo-600 py-6 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              <>
                Cadastrar <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Entrar <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Alternar entre Login e Cadastro */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setPassword(''); // Limpa a senha ao alternar
            }}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;