import { C, Ka, Lr, Ls, Ss, Va, Xa, Ya, Zi, ft, is, ks, ss, ws, za } from "../runtime/application.js";

export default function AppShell() {
  const W = ft(t => t.theme),
    F = W === "light" ? Ss : ks;
  return C.jsx(Zi, {
    client: Ka,
    children: C.jsx(is, {
      theme: F,
      locale: ws,
      children: C.jsx(ss, {
        children: C.jsxs(Lr, {
          className: "h-screen flex flex-col",
          children: [C.jsx(za, {}), C.jsxs(Lr, {
            className: "flex-1 overflow-hidden",
            children: [C.jsx(Va, {}), C.jsx(Ya, {
              className: "flex-1 overflow-auto p-6",
              style: {
                background: W === "light" ? "#F0F2F5" : "#141414"
              },
              children: C.jsx(Xa, {
                children: C.jsx(Ls, {})
              })
            })]
          })]
        })
      })
    })
  });
}
