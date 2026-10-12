import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "./api.js";

const SUB_FACTOR = 1;

const AuthContext = createContext(null);

function readUser() {
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
  const [pkg, setPkg] = useState("whole");
  const [dateMode, setDateMode] = useState("today");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem("dc_token");
      sessionStorage.removeItem("dc_user");
      setToken("");
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    api
      .me()
      .then((u) => {
        setUser(u);
        sessionStorage.setItem("dc_user", JSON.stringify(u));
      })
      .catch(() => {
        // 仅清内存态：401 由 api.js 的 onUnauthorized 统一清 sessionStorage。
        // 这里若清 sessionStorage，登录成功后的页面跳转会中断 in-flight /me，
        // catch 会把刚写入的 token 删掉，导致新页面被踢回登录页。
        setToken("");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, [token]);

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
        token, user, ready, login, logout, hasPerm, hasAny,
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
