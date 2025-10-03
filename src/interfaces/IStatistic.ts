export interface IStatisticCard {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  habilitado: boolean;
  color?: string;
  ruta?: string;
}
