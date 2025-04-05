
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
];

const Specialties = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Especialidades Médicas
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre especialistas qualificados em diversas áreas médicas para atender suas necessidades de saúde.
          </p>
        </div>

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
        
        <div className="text-center mt-12">
          <Button asChild>
            <Link to="/especialidades">Ver todas especialidades</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Specialties;
