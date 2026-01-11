// Servicio para funcionalidades del Dashboard
import { apiService, isLocalMode } from './apiService';
import { authService } from './authService';

// Frases motivacionales por defecto para modo local
const DEFAULT_QUOTES = [
  "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito. Si amas lo que haces, tendrás éxito.",
  "No cuentes los días, haz que los días cuenten.",
  "La única forma de hacer un gran trabajo es amar lo que haces.",
  "El futuro pertenece a aquellos que creen en la belleza de sus sueños.",
  "No esperes. El tiempo nunca será el justo.",
  "El dinero es solo una herramienta. Te llevará a donde desees, pero no te reemplazará como conductor.",
  "La riqueza consiste mucho más en disfrutar lo que se tiene que en poseer muchas cosas.",
  "El éxito es ir de fracaso en fracaso sin perder el entusiasmo.",
  "Tu actitud, no tu aptitud, determinará tu altitud.",
  "El único modo de hacer un gran trabajo es amar lo que haces.",
  "La disciplina es el puente entre las metas y los logros.",
  "No se trata de tener tiempo, se trata de hacer tiempo.",
  "La inversión en conocimiento paga el mejor interés.",
  "El éxito no es definitivo, el fracaso no es fatal: es el coraje para continuar lo que cuenta.",
  "La única manera de predecir el futuro es crearlo.",
  "No busques el momento perfecto, toma el momento y hazlo perfecto.",
  "El crecimiento personal requiere salir de tu zona de confort.",
  "La excelencia no es un destino, es un viaje continuo.",
  "Cada experto fue una vez un principiante.",
  "El fracaso es simplemente la oportunidad de comenzar de nuevo, esta vez de forma más inteligente.",
  "La diferencia entre lo ordinario y lo extraordinario es ese pequeño extra.",
  "No te detengas cuando estés cansado, detente cuando hayas terminado.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "La mejor inversión que puedes hacer es en ti mismo.",
  "El dinero es un servidor excelente, pero un amo terrible.",
  "La riqueza no consiste en tener grandes posesiones, sino en tener pocas necesidades.",
  "No trabajes por dinero, haz que el dinero trabaje para ti.",
  "La educación financiera es más valiosa que el dinero mismo.",
  "El éxito requiere sacrificio, dedicación y trabajo duro.",
  "Tu red de contactos es tu patrimonio neto."
];

class DashboardService {
  /**
   * Obtener frase motivacional del día
   * En modo local: selecciona una frase aleatoria basada en el día
   * En modo producción: consulta la API para obtener la tarea del día del proyecto "Crecimiento profesional"
   */
  async getDailyQuote(): Promise<string> {
    if (isLocalMode()) {
      return this.getLocalQuote();
    } else {
      return this.getApiQuote();
    }
  }

  /**
   * Obtener frase local (modo mock)
   * Usa el día del año para seleccionar una frase consistente cada día
   */
  private getLocalQuote(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Seleccionar frase basada en el día del año (mismo día = misma frase)
    const index = dayOfYear % DEFAULT_QUOTES.length;
    return DEFAULT_QUOTES[index];
  }

  /**
   * Obtener frase desde la API
   * Busca tarea del proyecto "Crecimiento profesional" asignada al usuario actual para hoy
   */
  private async getApiQuote(): Promise<string> {
    try {
      const response = await apiService.getDailyQuote();
      
      if (response.success && response.data) {
        // Si la respuesta tiene una propiedad 'quote' directamente
        if (typeof response.data === 'object' && 'quote' in response.data) {
          return (response.data as any).quote;
        }
        
        // Si la respuesta es un array de tareas, tomar la primera
        const dataAny = response.data as any;
        if (Array.isArray(dataAny) && dataAny.length > 0) {
          const task = dataAny[0];
          // La frase puede estar en title, observations o un campo específico
          return task.observations || task.title || this.getLocalQuote();
        }
        
        // Si response.data es un objeto con una propiedad data (paginación)
        if (typeof dataAny === 'object' && 'data' in dataAny) {
          if (Array.isArray(dataAny.data) && dataAny.data.length > 0) {
            const task = dataAny.data[0];
            return task.observations || task.title || this.getLocalQuote();
          }
        }
      }
      
      // Si no hay frase en la API, usar una local como fallback
      return this.getLocalQuote();
    } catch (error) {
      console.error('Error al obtener frase del día desde API:', error);
      // Fallback a frase local en caso de error
      return this.getLocalQuote();
    }
  }

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser() {
    return authService.getCurrentUser();
  }
}

// Exportar instancia única del servicio
export const dashboardService = new DashboardService();
