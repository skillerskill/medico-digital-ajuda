
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/utils";
import { Users, Plus, Trash, Edit, UserPlus } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    specialty: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token || user?.role !== "admin") {
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar essa página",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    loadDoctors();
  }, [navigate, toast]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await fetchApi("/admin/doctors", {
        method: "GET",
      });
      setDoctors(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de médicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    try {
      await fetchApi("/admin/doctors", {
        method: "POST",
        body: JSON.stringify(newDoctor),
      });
      
      toast({
        title: "Sucesso",
        description: "Médico adicionado com sucesso",
      });
      
      setAddDialogOpen(false);
      setNewDoctor({
        name: "",
        email: "",
        specialty: "",
        password: "",
      });
      loadDoctors();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o médico",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este médico?")) {
      try {
        await fetchApi(`/admin/doctors/${id}`, {
          method: "DELETE",
        });
        
        toast({
          title: "Sucesso",
          description: "Médico removido com sucesso",
        });
        
        loadDoctors();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o médico",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button onClick={() => navigate("/")}>Voltar para o site</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" /> Gerenciar Médicos
          </h2>
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Médico
          </Button>
        </div>

        {loading ? (
          <p className="text-center py-4">Carregando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.email}</TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhum médico encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog para adicionar médico */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Médico</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={newDoctor.name}
                onChange={handleInputChange}
                placeholder="Nome completo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newDoctor.email}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                name="specialty"
                value={newDoctor.specialty}
                onChange={handleInputChange}
                placeholder="Ex: Cardiologia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newDoctor.password}
                onChange={handleInputChange}
                placeholder="Senha para acesso"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDoctor}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
