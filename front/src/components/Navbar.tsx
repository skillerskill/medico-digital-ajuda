
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Login from "./../pages/Login";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary text-2xl font-bold">Sintomex</span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Início
            </Link>
            <Link to="/especialidades" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Especialidades
            </Link>
            <Link to="/como-funciona" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Como Funciona
            </Link>
            <Link to="/planos" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
              Planos
            </Link>
            <div className="ml-4 flex items-center">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="ml-2">
                <Link to="/registro">Registrar</Link>
              </Button>
            </div>
          </div>
          
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-accent focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/especialidades"
              className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Especialidades
            </Link>
            <Link
              to="/como-funciona"
              className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              to="/planos"
              className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Planos
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 space-x-3">
              <Button variant="ghost" asChild className="w-full justify-center">
                <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </Button>
              <Button asChild className="w-full justify-center">
                <Link to="/registro" onClick={() => setIsOpen(false)}>Registrar</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
