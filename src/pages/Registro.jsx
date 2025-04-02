
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchApi, validateCPF } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

const Registro = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const formatCPF = (value) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
    
    // Aplica a máscara de CPF: XXX.XXX.XXX-XX
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    } else if (numericValue.length <= 9) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
    }
  };

  const formatPhone = (value) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
    
    // Aplica a máscara de telefone: (XX) XXXXX-XXXX
    if (numericValue.length <= 2) {
      return numericValue.length ? `(${numericValue}` : "";
    } else if (numericValue.length <= 7) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    } else {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
    }
  };

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setFormData({
      ...formData,
      cpf: formattedCPF,
    });
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({
      ...formData,
      phone: formattedPhone,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return false;
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email inválido.");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return false;
    }
    
    // Remover formatação para validar o CPF
    const cpfNumerico = formData.cpf.replace(/\D/g, "");
    if (!validateCPF(cpfNumerico)) {
      setError("CPF inválido.");
      return false;
    }
    
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
      setError("Telefone inválido.");
      return false;
    }
    
    if (!formData.acceptTerms) {
      setError("Você precisa aceitar os termos de uso e política de privacidade.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Remover formatação antes de enviar ao servidor
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf.replace(/\D/g, ""),
        phone: formData.phone.replace(/\D/g, ""),
      };

      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo(a) ao MedicoDigital!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || "Falha ao criar conta. Tente novamente.");
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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Crie sua conta</h1>
            <p className="mt-2 text-gray-600">
              Preencha o formulário para começar
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="123.456.789-00"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    maxLength={15}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="acceptTerms" 
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => 
                  setFormData({...formData, acceptTerms: checked})
                }
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-gray-600"
              >
                Concordo com os{" "}
                <Link to="/termos" className="text-primary hover:underline">
                  termos de uso
                </Link>{" "}
                e{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  política de privacidade
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Já possui uma conta? </span>
              <Link to="/login" className="font-medium text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Registro;
