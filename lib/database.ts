// database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Classe, Matiere, Student } from './types';

const apiUrl = "http://192.168.137.43:8081";



export async function login(email: string, password: string) {

  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  }).then(response => response.json());

  if (response) {
    AsyncStorage.setItem('loggedin', "true");
    return true;
  }
  return false;

}

export function logout() {
  AsyncStorage.removeItem('loggedin');
}

export async function isLoggedIn(): Promise<boolean> {

  const value = await AsyncStorage.getItem('loggedin');

  return value === "true";

}


// Classes operations
export async function getClasses(): Promise<Classe[]> {

  const response = await fetch(`${apiUrl}/class/all`).then(response => response.json());

  return response;

}

export async function addClass(nomClass: string, nbreEtud: number) {

  const newClass = {
    nomClass,
    nbreEtud
  }

  await fetch(`${apiUrl}/class/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newClass)
  }).then(response => response.json());

}

export async function updateClass(codClass: number, nomClass: string, nbreEtud: number) {

  const updatedClass = {
    codClass,
    nomClass,
    nbreEtud
  }

  await fetch(`${apiUrl}/class/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedClass)
  }).then(response => response.json());

}

export async function deleteClass(codClass: number) {

  await fetch(`${apiUrl}/class/delete/${codClass}`, {
    method: 'DELETE'
  }).then(response => response.json());

}


export async function addStudent(codClass: number, nom: string, prenom: string, dateNais: string) {

  const newStudent = {
    classe: {
      codClass
    },
    nom,
    prenom,
    dateNais
  }

  await fetch(`${apiUrl}/etudiant/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newStudent)
  }).then(response => response.json());

}

export async function updateStudent(id: number, codClass: number, nom: string, prenom: string, dateNais: string) {

  const updatedStudent = {
    id,
    classe: {
      codClass
    },
    nom,
    prenom,
    dateNais
  }

  console.log("update: ", updatedStudent);

  await fetch(`${apiUrl}/etudiant/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedStudent)
  }).then(response => response.json());

}

export async function deleteStudent(id: number) {

  await fetch(`${apiUrl}/etudiant/delete/${id}`, {
    method: 'DELETE'
  }).then(response => response.json());

}

export async function getClassById(codClass: number): Promise<Classe | null> {

  const response = await fetch(`${apiUrl}/class/${codClass}`).then(response => response.json());

  return response;

}

export async function getStudentsByClass(codClass: number): Promise<Student[]> {

  const response = await fetch(`${apiUrl}/etudiant/byClass/${codClass}`).then(response => response.json());

  console.log(response);

  return response;

}

export async function getMatieres(): Promise<Matiere[]> {

  const response = await fetch(`${apiUrl}/matiere/all`).then(response => response.json());

  return response;

}

export async function addMatiere(intMat: string, description: string) {

  const newMatiere = {
    intMat,
    description
  }

  await fetch(`${apiUrl}/matiere/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newMatiere)
  }).then(response => response.json());

}

export async function updateMatiere(codMat: number, intMat: string, description: string) {

  const updatedMatiere = {
    codMat,
    intMat,
    description
  }

  await fetch(`${apiUrl}/matiere/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedMatiere)
  }).then(response => response.json());

}

export async function deleteMatiere(codMat: number) {

  await fetch(`${apiUrl}/matiere/delete/${codMat}`, {
    method: 'DELETE'
  })

}


export async function addMatiereToClass(codClass: number, codMat: number) {

  const newMatiereToClass = {
    classe: {
      codClass
    },
    matiere: {
      codMat
    }
  }

  await fetch(`${apiUrl}/matiere/addToClasse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newMatiereToClass)
  }).then(response => response.json());

}

export async function removeMatiereFromClass(codClass: number, codMat: number) {

  await fetch(`${apiUrl}/matiere/deleteFromClasse/${codClass}/${codMat}`, {
    method: 'DELETE'
  })

}