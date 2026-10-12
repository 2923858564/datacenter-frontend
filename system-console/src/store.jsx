import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "./api.js";

const SUB_FACTOR = 1;

const AuthContext = createContext(null);

function readUser() {
  if (!sessionStorage.getItem("dc_token")) return null;
  try {
    return JSON.parse(sessionStorage.getItem("dc_user") || "null");
  } catch {
    return null;
  }
}

export function ProtoProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("dc_token") || "");
  const [user, setUser] = useState(readUser);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authAttempt, setAuthAttempt] = useState(0);
  const [pkg, setPkg] = useState("whole");
  const [dateMode, setDateMode] = useState("today");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem("dc_token");
      sessionStorage.removeItem("dc_user");
      setToken("");
      setUser(null);
      setAuthError("");
    });
  }, []);

  useEffect(() => {
    let active = true;
    setAuthError("");
    if (!token) {
      setReady(true);
      return;
    }
    setReady(false);
    api
      .me()
      .then((u) => {
        if (!active) return;
        setUser(u);
        sessionStorage.setItem("dc_user", JSON.stringify(u));
        window.dispatchEvent(new CustomEvent("dc:identity-ready", { detail: u }));
      })
      .catch((error) => {
        if (!active || error.status === 401) return;
        setAuthError(error.message || "身份验证失败，请重试");
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [token, authAttempt]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    sessionStorage.setItem("dc_token", res.token);
    sessionStorage.setItem("dc_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // 服务端不可达时仍清理本标签页；会话会在过期后自然失效。
    }
    sessionStorage.removeItem("dc_token");
    sessionStorage.removeItem("dc_user");
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    setToken("");
    setUser(null);
  };

  const hasPerm = (code) =>
    !!user && (user.is_super || (user.perms || []).includes("*") || (user.perms || []).includes(code));
  const hasAny = (codes) => !!user && codes.some(hasPerm);

  const role = user
    ? {
        id: (user.roles && user.roles[0] ? user.roles[0].code : "user").toLowerCase(),
        name: user.roles && user.roles[0] ? user.roles[0].name : user.name,
        scope: user.scope,
        pkg: user.scope === "all",
      }
    : null;
  const canPkg = !!role && role.pkg;
  const isSub = !canPkg || pkg === "sub";
  const scale = isSub ? SUB_FACTOR : 1;

  return (
    <AuthContext.Provider
      value={{
        token, user, ready, authError, retryAuth: () => setAuthAttempt((value) => value + 1), login, logout, hasPerm, hasAny,
        role, pkg, setPkg, dateMode, setDateMode, canPkg, isSub, scale,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useProto() {
  return useContext(AuthContext);
}
