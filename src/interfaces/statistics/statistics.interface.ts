export interface IVariacionResumen {
  justicia: {
    con: number;
    sin: number;
  };
  delito: {
    con: number;
    sin: number;
  };
}

export interface IResumenPorTipo{
  justicia: {
    conDetenido: number;
    sinDetenido: number;
  };
  delito: {
    conDetenido: number;
    sinDetenido: number;
  };
}

export interface IResumenPorSemana{
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
  semana_inicio: string;
  semana_fin: string;
}

export interface IResumenPorMes{
  labels: string[];
  year: number;
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];

}