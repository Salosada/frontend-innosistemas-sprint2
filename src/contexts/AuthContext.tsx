﻿'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserInfo, AuthContextType, LoginRequest, TokenResponse } from '@/types';
import { AuthService } from '@/services/auth';
import { setCookie, deleteCookie, getCookie } from '@/utils/cookies';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    if (user?.email) {
      AuthService.logout(user.email).catch(console.error);
    }
    
    setUser(null);
    setToken(null);
    deleteCookie('auth_token');
    deleteCookie('refresh_token');
    deleteCookie('auth_role'); // Limpieza adicional por si existiera
    deleteCookie('user_info');
  }, [user?.email]);

  useEffect(() => {
    const storedToken = getCookie('auth_token');
    
    if (storedToken) {
      setToken(storedToken);
      try {
        const userInfoCookie = getCookie('user_info');
        if (userInfoCookie && userInfoCookie !== 'undefined') {
          const userInfo = JSON.parse(userInfoCookie);
          // Validación robusta para asegurar que userInfo cumple con la interfaz UserInfo
          if (typeof userInfo.id === 'string' && typeof userInfo.email === 'string' &&
              typeof userInfo.name === 'string' && typeof userInfo.role === 'string' &&
              Array.isArray(userInfo.permissions)) {
            setUser(userInfo);
          } else {
            console.error('Información de usuario incompleta o malformada en la cookie, cerrando sesión.');
            logout(); // Cerrar sesión si la información de usuario en la cookie es incompleta o malformada
          }
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
        logout();
      }
    }
    else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []); // Se ejecuta solo una vez al montar el componente

  const login = async (credentials: LoginRequest): Promise<UserInfo> => {
    try {
      setIsLoading(true);
      const response: TokenResponse = await AuthService.login(credentials);
      
      setToken(response.accessToken);
      setCookie('auth_token', response.accessToken, response.expiresIn);
      setCookie('refresh_token', response.refreshToken, 7 * 24 * 60 * 60);
      
      // Obtener información real del usuario desde el backend
      try {
        const userInfo = await AuthService.getUserInfo();
        console.log('User info from backend:', userInfo);
        console.log('Role from backend:', userInfo.role);
        
        // Mapear roles de la base de datos a roles del frontend
        const mapRole = (role: string) => {
          if (!role) return 'user';
          
          const roleLower = role.toLowerCase();
          if (roleLower.includes('admin') || role === 'Administrador') return 'admin';
          if (roleLower.includes('profesor') || role === 'Profesor') return 'professor';
          if (roleLower.includes('estudiante') || role === 'Estudiante') return 'student';
          
          return role; // Mantener el rol original si no hay mapeo
        };
        
        const fullUserInfo: UserInfo = {
          id: userInfo.id, // Añadido el ID del usuario
          email: userInfo.email || credentials.email,
          name: userInfo.nameUser || credentials.email.split('@')[0], // Corregido a nameUser
          role: mapRole(userInfo.role) || 'user',
          permissions: userInfo.permissions || []
        };
        
        console.log('Final user info:', fullUserInfo);
        setUser(fullUserInfo);
        setCookie('user_info', JSON.stringify(fullUserInfo), response.expiresIn);
        return fullUserInfo;
      } catch (userInfoError) {
        console.error('Error getting user info:', userInfoError);
        
        // Fallback: información básica del usuario
        const basicUserInfo: UserInfo = {
          id: 'fallback-user-id', // Añadido un ID de fallback
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'user',
          permissions: []
        };
        
        setUser(basicUserInfo);
        setCookie('user_info', JSON.stringify(basicUserInfo), response.expiresIn);
        return basicUserInfo;
      }
    } catch (error) {
      console.error('Error during login:', error);
      
      // Mejorar el manejo de errores - re-lanzar con mensaje más descriptivo
      if (error instanceof Error) {
        // Si el error ya tiene un mensaje útil, mantenerlo
        if (error.message.includes('Credenciales incorrectas') || 
            error.message.includes('conexión') ||
            error.message.includes('servidor')) {
          throw error;
        }
        // Si es un error genérico, mejorarlo
        else {
          throw new Error('Error al iniciar sesión. Verifique sus credenciales e intente nuevamente.');
        }
      } else {
        throw new Error('Error inesperado al iniciar sesión. Intente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = getCookie('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response: TokenResponse = await AuthService.refreshToken(refreshTokenValue);
      
      setToken(response.accessToken);
      
      // Mantener la información de usuario existente o crear una básica
      const currentUser = user || {
        id: 'unknown-user-id', // Añadir un ID de fallback
        email: 'unknown@example.com',
        name: 'User',
        role: 'user',
        permissions: []
      };
      
      setUser(currentUser);
      
      setCookie('auth_token', response.accessToken, response.expiresIn);
      setCookie('refresh_token', response.refreshToken, 7 * 24 * 60 * 60);
      setCookie('user_info', JSON.stringify(currentUser), response.expiresIn);
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
