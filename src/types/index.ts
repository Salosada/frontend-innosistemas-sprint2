﻿﻿﻿﻿﻿﻿﻿// Tipos para el sistema Innosistemas - Adaptados al backend Java Spring Boot

// Tipos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string; // Asumiendo que todos los usuarios logueados tienen un ID
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
  courseIds?: string[]; // Añadido para que UserInfo pueda contener los cursos del estudiante
}

export interface LoggedInStudent extends UserInfo {
  courseIds: string[]; // Para cuando sabemos que el usuario es un estudiante y tiene courseIds
}

export interface Permission {
  namePermission: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  email: string;
}

// Entidades principales
export interface UserDto {
  email: string;
  nameUser: string;
}

export interface UserWithRoleDto {
  id: string; // Asumiendo que el backend proporciona un ID para UserWithRoleDto
  email: string;
  nameUser: string;
  createdAt?: string; // Añadido para la fecha de creación del usuario
  role: string;
}

export interface CreateUserDto {
  email: string;
  nameUser: string;
  password: string;
  roleId?: number; // Añadido para que coincida con el payload de registro
}

export interface CourseDto {
  idCourse: number;
  nameCourse: string;
}

export interface TeamDto {
  idTeam: number;
  nameTeam: string;
  projectId: number;
}

export interface TeamShowDto {
  idTeam: number;
  nameTeam: string;
  projectId: number;
  projectName: string;
  courseId: number;
  students: UserDto[];
}

export interface ProjectDto {
  id: number;
  name: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  status?: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

// Tipos para formularios
export interface CreateTeamForm {
  nameTeam: string;
  projectId: number;
}

export interface CreateCourseForm {
  nameCourse: string;
  semester: number;
  status: boolean;
}

export interface CreateProjectForm {
  nameProject: string;
  descriptions: string;
  courseId: number;
}

// Tipos para autenticación y contexto
export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Aliases para compatibilidad con el código existente
export type AuthResponse = TokenResponse;
export type LoginPayload = LoginRequest;
export type RegisterPayload = CreateUserDto;

// Constantes para cursos de ingeniería de software
export const SOFTWARE_ENGINEERING_COURSES = [
  {
    idCourse: 1,
    nameCourse: "Fundamentos de Programación",
    description: "Curso introductorio a la programación y lógica de algoritmos.",
    semester: 1,
    status: true,
    professor: "Profesor A",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 2,
    nameCourse: "Estructuras de Datos",
    description: "Estudio de estructuras de datos fundamentales y su aplicación.",
    semester: 2,
    status: true,
    professor: "Profesor B",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 3,
    nameCourse: "Algoritmos y Complejidad",
    description: "Análisis de algoritmos y su complejidad computacional.",
    semester: 3,
    status: true,
    professor: "Profesor C",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 4,
    nameCourse: "Ingeniería de Software I",
    description: "Principios y prácticas de la ingeniería de software.",
    semester: 4,
    status: true,
    professor: "Profesor D",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 5,
    nameCourse: "Bases de Datos",
    description: "Diseño y gestión de sistemas de bases de datos.",
    semester: 4,
    status: true,
    professor: "Profesor E",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 6,
    nameCourse: "Ingeniería de Software II",
    description: "Temas avanzados en ingeniería de software y gestión de proyectos.",
    semester: 5,
    status: true,
    professor: "Profesor F",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 7,
    nameCourse: "Arquitectura de Software",
    description: "Diseño de arquitecturas de software robustas y escalables.",
    semester: 6,
    status: true,
    professor: "Profesor G",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  },
  {
    idCourse: 8,
    nameCourse: "Proyecto de Grado",
    description: "Desarrollo de un proyecto de software completo.",
    semester: 8,
    status: true,
    professor: "Profesor H",
    minTeamSize: 2,
    maxTeamSize: 3,
    isActive: true
  }
] as const;

// Tipos adicionales para el frontend
export interface Student {
  id: string;
  name: string;
  email: string;
  skills?: string[];
  role?: 'student' | 'admin';
  courseIds?: string[];
  currentTeams?: { [courseId: string]: string };
}

export interface Team {
  id: string;
  name: string;
  courseId: string;
  creatorId: string;
  projectId: string;
  members: Student[];
  status?: 'forming' | 'active' | 'completed' | 'incomplete';
  createdAt: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'team_assignment' | 'deadline_reminder' | 'team_invitation' | 'team_removal' | 'team_dissolved';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  teamId: string;
  courseId: string;
  actionRequired?: boolean;
}
