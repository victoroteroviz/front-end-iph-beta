/**
 * Configuración centralizada de Chart.js
 *
 * Este archivo registra todos los componentes y plugins de Chart.js
 * una sola vez para evitar duplicaciones y problemas de renderizado.
 *
 * @important Solo importar este archivo una vez en el punto de entrada
 * de la aplicación para evitar registros duplicados.
 */

import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar todos los componentes y plugins de Chart.js una sola vez
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

export { ChartJS };