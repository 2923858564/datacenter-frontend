import React, { createContext, useContext, useEffect, useState } from "react";
import { SUB_FACTOR } from "./data.js";
import { api, setUnauthorizedHandler } from "./api.js";
const AuthContext = createContext(null);
function readUser() {
  try {
    return JSON.parse(localStorage.getItem("dc_user") || "null");
  } catch {
    return null;
  }
}
export function ProtoProvider({
  children
}) {
  const [token, setToken] = useState(() => localStorage.getItem("dc_token") || "");
  const [user, setUser] = useState(readUser);
  const [ready, setReady] = useState(false);
  const [pkg, setPkg] = useState("whole");
  const [dateMode, setDateMode] = useState("today");
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem("dc_token");
      localStorage.removeItem("dc_user");
      setToken("");
      setUser(null);
    });
  }, []);
  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    api.me().then(u => {
      setUser(u);
      localStorage.setItem("dc_user", JSON.stringify(u));
    }).catch(() => {
      localStorage.removeItem("dc_token");
      localStorage.removeItem("dc_user");
      setToken("");
      setUser(null);
    }).finally(() => setReady(true));
  }, [token]);
  const login = async (username, password) => {
    const res = await api.login(username, password);
    localStorage.setItem("dc_token", res.token);
    localStorage.setItem("dc_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };
  const logout = () => {
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    setToken("");
    setUser(null);
  };
  const hasPerm = code => !!user && (user.is_super || (user.perms || []).includes("*") || (user.perms || []).includes(code));
  const hasAny = codes => !!user && codes.some(hasPerm);
  const role = user ? {
    id: (user.roles && user.roles[0] ? user.roles[0].code : "user").toLowerCase(),
    name: user.roles && user.roles[0] ? user.roles[0].name : user.name,
    scope: user.scope,
    pkg: user.scope === "all"
  } : null;
  const canPkg = !!role && role.pkg;
  const isSub = !canPkg || pkg === "sub";
  const scale = isSub ? SUB_FACTOR : 1;
  return <AuthContext.Provider value={{
    token,
    user,
    ready,
    login,
    logout,
    hasPerm,
    hasAny,
    role,
    pkg,
    setPkg,
    dateMode,
    setDateMode,
    canPkg,
    isSub,
    scale
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useProto() {
  return useContext(AuthContext);
}
