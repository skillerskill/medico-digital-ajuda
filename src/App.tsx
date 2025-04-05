
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Cliente de consulta para React Query
const queryClient = new QueryClient();

// Componente de carregamento para usar durante o carregamento preguiçoso
const PageSkeleton = () => (
  <div className="container mx-auto p-4">
    <Skeleton className="h-12 w-full mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

// Componente de roteamento dinâmico
const DynamicPage = () => {
  // Obtém o caminho atual da URL
  const pathname = window.location.pathname;
  const path = pathname === '/' ? 'Index' : pathname.substring(1);
  
  try {
    // Tenta carregar o componente da página dinamicamente
    const PageComponent = lazy(() => {
      // Tenta com inicial maiúscula (padrão para componentes)
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
      
      try {
        return import(`./pages/${formattedPath}.tsx`)
          .catch(() => import(`./pages/${formattedPath}.jsx`))
          .catch(() => {
            console.error(`Página não encontrada: ${formattedPath}`);
            return import('./pages/NotFound');
          });
      } catch (error) {
        console.error(`Erro ao carregar página: ${error}`);
        return import('./pages/NotFound');
      }
    });

    return (
      <Suspense fallback={<PageSkeleton />}>
        <PageComponent />
      </Suspense>
    );
  } catch (error) {
    console.error(`Erro ao renderizar página: ${error}`);
    return <Navigate to="/not-found" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota dinâmica que tenta carregar qualquer página com base na URL */}
          <Route path="/*" element={<DynamicPage />} />
          {/* Rota de fallback para página não encontrada */}
          <Route path="/not-found" element={lazy(() => import('./pages/NotFound'))} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
