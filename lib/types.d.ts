export type Classe = {
  codClass: number;
  nomClass: string;
  nbreEtud: number;
  matieres: Matiere[];
}

export type Student = {
  id: number;
  codClass: number;
  nom: string;
  prenom: string;
  dateNais: string;
}

export type Matiere = {
  codMat: number;
  intMat: string;
  description: string;
}