// Importar hooks de React para efectos, referencias y estado
import { useEffect, useRef, useState } from 'react';

// Componente que renderiza un fondo animado con ondas interactivas
export default function WaveBackground() {
  // Referencia al elemento canvas HTML donde se dibujan las ondas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Referencia para rastrear la posición del mouse (x, y)
  const mouseRef = useRef({ x: -1, y: -1 });
  // Referencia para almacenar el ID de la animación
  const animRef = useRef<number>(0);
  // Estado para saber si el mouse está sobre el canvas
  const [hovered, setHovered] = useState(false);

  // Hook de efecto que se ejecuta al montar el componente
  useEffect(() => {
    // Obtener el elemento canvas desde la referencia
    const canvas = canvasRef.current;
    // Si no existe el canvas, salir
    if (!canvas) return;
    // Obtener el contexto 2D del canvas para poder dibujar
    const ctx = canvas.getContext('2d');
    // Si no existe el contexto, salir
    if (!ctx) return;

    // Variables para almacenar las dimensiones del canvas
    let width = 0;
    let height = 0;
    // Variable de tiempo para animar las ondas
    let t = 0;

    // Función para ajustar el tamaño del canvas al tamaño de la ventana
    const resize = () => {
      // Establecer el ancho del canvas al ancho de la ventana
      width = canvas.width = window.innerWidth;
      // Establecer la altura del canvas a la altura de la ventana
      height = canvas.height = window.innerHeight;
    };
    // Ejecutar resize al inicio
    resize();
    // Escuchar eventos de cambio de tamaño de ventana
    window.addEventListener('resize', resize);

    // Número de ondas a dibujar
    const WAVE_COUNT = 8;

    // Función principal de dibujo que se ejecuta en cada frame
    const draw = () => {
      // Limpiar todo el canvas antes de dibujar el nuevo frame
      ctx.clearRect(0, 0, width, height);

      // Obtener la posición X del mouse desde la referencia
      const mx = mouseRef.current.x;
      // Obtener la posición Y del mouse desde la referencia
      const my = mouseRef.current.y;
      // Verificar si el mouse está dentro del canvas (coordenadas válidas)
      const isHovering = mx >= 0 && my >= 0;

      // Establecer color de fondo negro profundo
      ctx.fillStyle = '#050505';
      // Dibujar el rectángulo de fondo que cubre todo el canvas
      ctx.fillRect(0, 0, width, height);

      // Bucle para dibujar cada una de las ondas
      for (let i = 0; i < WAVE_COUNT; i++) {
        // Calcular el progreso de la onda actual (de 0 a 1)
        const progress = i / (WAVE_COUNT - 1); // 0..1
        // Calcular la posición vertical base de la onda (entre 25% y 75% de la altura)
        const yBase = height * (0.25 + progress * 0.5);
        // Calcular la amplitud de la onda (altura de la ondulación)
        const amp = 38 + i * 6;
        // Calcular la frecuencia de la onda (qué tan apretadas están las ondulaciones)
        const freq = 0.0018 + i * 0.0003;
        // Calcular la velocidad de movimiento de la onda
        const speed = 0.004 + i * 0.0008;
        // Calcular el desfase de fase para animar la onda
        const phase = t * speed + i * 0.7;

        // Variable para almacenar el factor de brillo basado en proximidad del mouse
        let glowFactor = 0;
        // Si el mouse está sobre el canvas
        if (isHovering) {
          // Calcular la distancia vertical entre el mouse y la onda
          const dist = Math.abs(my - yBase);
          // Calcular el factor de brillo inversamente proporcional a la distancia
          glowFactor = Math.max(0, 1 - dist / 160);
        }

        // Calcular la luminosidad base de la onda (cada onda más clara)
        const baseL = 14 + i * 2;
        // Calcular el componente rojo (gris base + amarillo al hacer hover)
        const r = Math.round(baseL * 2.2 + glowFactor * 210);
        // Calcular el componente verde (gris base + amarillo al hacer hover)
        const g = Math.round(baseL * 2.2 + glowFactor * 165);
        // Calcular el componente azul (se mantiene bajo para lograr amarillo)
        const b = Math.round(baseL * 2.2 + glowFactor * 0);
        // Calcular la transparencia de la onda (aumenta con hover)
        const alpha = 0.45 + i * 0.05 + glowFactor * 0.35;

        // Iniciar un nuevo trazo para dibujar la onda
        ctx.beginPath();
        // Mover el punto de inicio al borde izquierdo en la posición base
        ctx.moveTo(0, yBase);

        // Bucle para dibujar cada punto de la onda a lo ancho del canvas
        for (let x = 0; x <= width; x += 4) {
          // Variable para el efecto de deformación por el mouse
          let mouseWarp = 0;
          // Si el mouse está sobre el canvas
          if (isHovering) {
            // Calcular la distancia horizontal entre el punto actual y el mouse
            const dx = x - mx;
            // Calcular el efecto de elevación de la onda cerca del cursor (distribución gaussiana)
            mouseWarp = glowFactor * 22 * Math.exp(-dx * dx / (2 * 12000));
          }
          // Calcular la posición Y del punto usando funciones seno combinadas para crear ondulación compleja
          const y = yBase + Math.sin(x * freq + phase) * amp
                          + Math.sin(x * freq * 1.7 + phase * 0.6) * (amp * 0.4)
                          - mouseWarp;
          // Agregar el punto calculado al trazo de la onda
          ctx.lineTo(x, y);
        }

        // Establecer el color del trazo usando los valores RGB calculados
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        // Establecer el grosor de la línea (aumenta con hover)
        ctx.lineWidth = 1.2 + glowFactor * 1.8;
        // Establecer el color de la sombra si hay efecto de brillo
        ctx.shadowColor = glowFactor > 0.1
          ? `rgba(212,170,0,${glowFactor * 0.6})`
          : 'transparent';
        // Establecer el desenfoque de la sombra
        ctx.shadowBlur = glowFactor * 18;
        // Dibujar el trazo de la onda
        ctx.stroke();
        // Resetear el desenfoque de sombra
        ctx.shadowBlur = 0;
      }

      // Incrementar la variable de tiempo para animar
      t++;
      // Solicitar el siguiente frame de animación
      animRef.current = requestAnimationFrame(draw);
    };

    // Iniciar el loop de animación
    animRef.current = requestAnimationFrame(draw);

    // Función de limpieza que se ejecuta al desmontar el componente
    return () => {
      // Cancelar la animación
      cancelAnimationFrame(animRef.current);
      // Remover el listener de resize
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Función que se ejecuta cuando el mouse se mueve sobre el canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Obtener las dimensiones y posición del canvas en la ventana
    const rect = canvasRef.current?.getBoundingClientRect();
    // Si no se obtiene el rectángulo, salir
    if (!rect) return;
    // Actualizar la referencia de posición del mouse con coordenadas relativas al canvas
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // Actualizar el estado de hover a verdadero
    setHovered(true);
  };

  // Función que se ejecuta cuando el mouse sale del canvas
  const handleMouseLeave = () => {
    // Resetear la posición del mouse a valores inválidos
    mouseRef.current = { x: -1, y: -1 };
    // Actualizar el estado de hover a falso
    setHovered(false);
  };

  // Retornar el elemento canvas con sus propiedades y eventos
  return (
    <canvas
      // Asignar la referencia al canvas
      ref={canvasRef}
      // Agregar manejador de movimiento del mouse
      onMouseMove={handleMouseMove}
      // Agregar manejador de salida del mouse
      onMouseLeave={handleMouseLeave}
      // Clases de Tailwind: posición fija, cubrir toda la pantalla, permitir eventos del mouse
      className="fixed inset-0 w-full h-full pointer-events-auto"
      // Estilos inline
      style={{
        // Z-index 0 para que esté detrás de otros elementos
        zIndex: 0,
        // Cambiar cursor a cruz cuando está en hover, por defecto normal
        cursor: hovered ? 'crosshair' : 'default',
      }}
    />
  );
}
