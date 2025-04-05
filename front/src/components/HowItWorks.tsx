
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    title: "Crie sua conta",
    description: "Registre-se em nossa plataforma em menos de 2 minutos, sem burocracia.",
  },
  {
    title: "Escolha a especialidade",
    description: "Encontre o especialista ideal para suas necessidades médicas.",
  },
  {
    title: "Agende sua consulta",
    description: "Escolha a data e horário que melhor se adequam à sua rotina.",
  },
  {
    title: "Consulta online",
    description: "Conecte-se com o médico por vídeo, sem precisar sair de casa.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Como Funciona
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Atendimento médico digital em quatro passos simples.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>
          
          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-center">
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:order-2 md:pl-12'}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center my-4 md:my-0 z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:order-2 md:pl-12' : 'md:pr-12'} hidden md:block`}>
                  {/* Spacer div for alternating layout */}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 bg-accent rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Comece sua jornada de saúde digital hoje</h3>
          <p className="text-lg text-gray-700 mb-6">Mais de 10.000 pacientes já confiam em nossa plataforma</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span>Médicos certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span>Consultas 100% seguras</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span>Atendimento 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-primary h-5 w-5" />
              <span>Satisfação garantida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
