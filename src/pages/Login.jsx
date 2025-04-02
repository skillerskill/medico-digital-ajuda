
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchApi } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) de volta!",
      });
      
      // Redirecionar baseado no papel do usuário
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else if (response.user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message || "Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-accent px-4 py-12">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Bem-vindo de volta</h1>
            <p className="mt-2 text-gray-600">
              Entre com sua conta para acessar o sistema
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/recuperar-senha" className="text-sm font-medium text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Ainda não tem uma conta? </span>
              <Link to="/registro" className="font-medium text-primary hover:underline">
                Registre-se agora
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
