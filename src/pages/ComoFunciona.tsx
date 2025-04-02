
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Monitor, VideoIcon, Calendar, MessageCircle } from "lucide-react";

const ComoFunciona = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-accent py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-6">Como Funciona Nossa Plataforma</h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Descubra como é simples e seguro receber atendimento médico online através da nossa plataforma.
              </p>
            </div>
          </div>
        </section>

        <HowItWorks />

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Vantagens do Atendimento Online</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Nossa plataforma proporciona uma experiência completa de cuidados médicos digitais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Acessibilidade</h3>
                <p className="text-gray-600">
                  Acesse médicos de qualquer lugar, usando seu computador ou smartphone.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Consultas por Vídeo</h3>
                <p className="text-gray-600">
                  Interação em tempo real com médicos através de vídeo de alta qualidade.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Flexibilidade</h3>
                <p className="text-gray-600">
                  Escolha horários convenientes que se encaixem na sua agenda.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Acompanhamento</h3>
                <p className="text-gray-600">
                  Receba acompanhamento contínuo e tire dúvidas após a consulta.
                </p>
              </div>
            </div>

            <div className="mt-16 bg-accent rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h3 className="text-2xl font-bold mb-4">Perguntas Frequentes</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        As consultas online são seguras?
                      </h4>
                      <p className="ml-7 text-gray-600">
                        Sim, utilizamos criptografia avançada para garantir a privacidade e segurança das suas consultas.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        Posso receber prescrições médicas online?
                      </h4>
                      <p className="ml-7 text-gray-600">
                        Sim, nossos médicos podem emitir prescrições digitais que você receberá por e-mail.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        Preciso de equipamentos especiais para a consulta?
                      </h4>
                      <p className="ml-7 text-gray-600">
                        Apenas um dispositivo com câmera e microfone, como smartphone, tablet ou computador.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/3 text-center">
                  <Link to="/faq" className="text-primary hover:underline block mb-4">
                    Ver todas as perguntas frequentes
                  </Link>
                  <Link to="/consulta" className="inline-block">
                    <Button className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90">
                      Agendar Consulta
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComoFunciona;
