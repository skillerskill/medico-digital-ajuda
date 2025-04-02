
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Video, FileText, Calendar, MessageCircle, Shield } from "lucide-react";

const features = [
  {
    title: "Consultas por Vídeo",
    description: "Conecte-se com médicos em tempo real para consultas por vídeo de alta qualidade.",
    icon: Video,
  },
  {
    title: "Disponível 24/7",
    description: "Acesse atendimento médico a qualquer hora do dia ou da noite, todos os dias da semana.",
    icon: Clock,
  },
  {
    title: "Prescrições Digitais",
    description: "Receba prescrições digitais diretamente no aplicativo após sua consulta.",
    icon: FileText,
  },
  {
    title: "Agendamento Fácil",
    description: "Agende consultas em minutos com nosso sistema intuitivo de marcação.",
    icon: Calendar,
  },
  {
    title: "Acompanhamento Contínuo",
    description: "Mantenha-se em contato com seu médico para acompanhamento e dúvidas.",
    icon: MessageCircle,
  },
  {
    title: "Dados Seguros",
    description: "Seus registros médicos e informações pessoais são protegidos com criptografia avançada.",
    icon: Shield,
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Por que escolher nossa plataforma?
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos uma experiência completa de assistência médica digital para cuidar da sua saúde com conveniência e qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
