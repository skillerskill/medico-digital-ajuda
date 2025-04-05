
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const specialties = [
  {
    name: "Clínica Geral",
    description: "Consultas de rotina, sintomas gerais e orientações de saúde.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    name: "Pediatria",
    description: "Atendimento especializado para bebês, crianças e adolescentes.",
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  },
  {
    name: "Dermatologia",
    description: "Cuidados com a pele, cabelo e unhas, diagnóstico de condições dermatológicas.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    name: "Psicologia",
    description: "Suporte para saúde mental, ansiedade, depressão e outros transtornos psicológicos.",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    name: "Cardiologia",
    description: "Diagnóstico e tratamento de doenças do coração e sistema circulatório.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    name: "Endocrinologia",
    description: "Tratamento de distúrbios hormonais, diabetes e problemas metabólicos.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
  },
  {
    name: "Nutrição",
    description: "Orientação alimentar, planos nutricionais e tratamento de transtornos alimentares.",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  },
  {
    name: "Neurologia",
    description: "Diagnóstico e tratamento de doenças do sistema nervoso.",
    image: "https://images.unsplash.com/photo-1559757175-7b21671636f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
  },
];

const Especialidades = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-accent py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-center mb-8">Nossas Especialidades</h1>
            <p className="text-lg text-center max-w-3xl mx-auto mb-12">
              Oferecemos atendimento online com médicos especialistas em diversas áreas da saúde para garantir o cuidado completo que você merece.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialties.map((specialty, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-lg">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={specialty.image} 
                      alt={specialty.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold mb-2">{specialty.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{specialty.description}</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to={`/especialidade/${specialty.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        Ver médicos
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Especialidades;
