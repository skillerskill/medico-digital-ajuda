
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "A consulta online foi extremamente conveniente. Consegui falar com um médico rapidamente e resolver meu problema sem sair de casa.",
    name: "Ana Silva",
    role: "Paciente",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    rating: 5,
  },
  {
    quote: "Estava viajando e precisei de uma consulta urgente. O atendimento foi rápido e profissional, resolvendo meu problema imediatamente.",
    name: "Carlos Mendes",
    role: "Paciente",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    quote: "Como mãe de duas crianças pequenas, essa plataforma tem sido uma salvação. Consigo consultar pediatras a qualquer hora sem estresse.",
    name: "Patrícia Almeida",
    role: "Paciente",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            O que nossos pacientes dizem
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Histórias reais de pacientes que transformaram sua experiência de saúde com nossa plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
