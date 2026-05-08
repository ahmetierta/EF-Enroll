import { createContext } from "react";
import { authService } from "../services/authService";
import { clearAuth, saveAuth } from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    saveAuth(res.data.user);
    return res.data;
  };

  const registerStudent = async (studentData) => {
    const res = await authService.registerStudent(studentData);
    return res.data;
  };

  const registerProfessor = async (professorData) => {
    const res = await authService.registerProfessor(professorData);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{ login, logout, registerStudent, registerProfessor }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
