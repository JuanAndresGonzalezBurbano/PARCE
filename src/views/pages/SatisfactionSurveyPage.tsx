import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

export default function SatisfactionSurveyPage() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({
    speed: 0,
    attention: 0,
    solution: 0,
    timing: 0,
    service: 0,
  });

  const questions = [
    { id: 'speed', text: '1. Como calificaria la rapidez del servicio' },
    { id: 'attention', text: '2. El personal fue amable con la atencion?' },
    { id: 'solution', text: '3.El mecanico soluciono el problema?' },
    { id: 'timing', text: '4. El servicio llego en el tiempo esperado?' },
    { id: 'service', text: '5. Como calificaria la atencion recibida?' },
  ];

  const handleRating = (questionId: string, rating: number) => {
    setRatings({ ...ratings, [questionId]: rating });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Gracias por tu opinión!');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="card p-8 space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Encuesta de Satisfaccion al cliente
              </h1>
              <p className="text-gray-400">Tu opinión nos ayuda a mejorar</p>
            </div>

            {/* Survey Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <p className="text-white font-medium">{question.text}</p>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(question.id, star)}
                        className="group transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= ratings[question.id as keyof typeof ratings]
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-600 group-hover:text-gray-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                ENVIAR
              </motion.button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
