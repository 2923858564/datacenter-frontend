import { C, Jt, Ke, Mr, Vt, Yr, __API__, bn, cr, fetch, ft, us, xt } from "../runtime/application.js";

export default function MainLoginPage() {
  const W = Jt(),
    F = ft(s => s.setUser),
    P = ft(s => s.setPermissions),
    [t, v] = Ke.useState(!1),
    [y] = cr.useForm(),
    u = async s => {
      v(!0);
      try {
        const z = await fetch(__API__ + "/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(s)
          }),
          j = await z.json();
        if (!z.ok) throw new Error(j && j.detail || "登录失败");
        localStorage.setItem("sso_token", j.token);
        F(j.user);
        P(Object.fromEntries((j.user.perms || []).map(n => [n, !0])));
        Yr.success("欢迎回来，" + (j.user.name || j.user.username));
        W("/", {
          replace: !0
        });
      } catch (e) {
        Yr.error(e && e.message || "账号或密码错误，请联系管理员");
      } finally {
        v(!1);
      }
    };
  return C.jsxs("div", {
    className: "flex h-screen relative overflow-hidden",
    style: {
      background: "linear-gradient(135deg, #0A1628 0%, #1B3A5C 40%, #1677FF 100%)"
    },
    children: [C.jsx("div", {
      className: "absolute inset-0 opacity-10 pointer-events-none",
      style: {
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "30px 30px"
      }
    }), C.jsx("div", {
      className: "flex-1 flex items-center justify-end relative z-10 pr-16",
      children: C.jsxs("div", {
        className: "flex flex-col items-center",
        children: [C.jsx("img", {
          src: "/logo.png",
          alt: "聚玩经营数据中台",
          className: "w-72 h-auto mb-6 drop-shadow-2xl"
        }), C.jsx("h1", {
          className: "text-3xl font-bold text-white tracking-wider",
          children: "聚玩经营数据中台"
        }), C.jsx("p", {
          className: "text-blue-200 mt-3 text-sm tracking-wide",
          children: "数据驱动经营 · 智能赋能决策"
        })]
      })
    }), C.jsx("div", {
      className: "flex-1 flex items-center justify-start relative z-10 pl-16",
      style: {
        marginTop: "-58px"
      },
      children: C.jsxs(Vt, {
        style: {
          width: 400
        },
        className: "shadow-lg",
        children: [C.jsx("h2", {
          className: "text-xl font-semibold mb-1 text-center",
          children: "账号登录"
        }), C.jsx("p", {
          className: "text-xs text-gray-400 mb-6 text-center",
          children: "账号由管理员创建并分配，请联系管理员获取"
        }), C.jsxs(cr, {
          form: y,
          onFinish: u,
          size: "large",
          children: [C.jsx(cr.Item, {
            name: "username",
            rules: [{
              required: !0,
              message: "请输入账号"
            }],
            children: C.jsx(Mr, {
              prefix: C.jsx(bn, {}),
              placeholder: "请输入账号",
              autoComplete: "username"
            })
          }), C.jsx(cr.Item, {
            name: "password",
            rules: [{
              required: !0,
              message: "请输入密码"
            }],
            children: C.jsx(Mr.Password, {
              prefix: C.jsx(us, {}),
              placeholder: "请输入密码",
              autoComplete: "current-password"
            })
          }), C.jsx(cr.Item, {
            className: "mb-0",
            children: C.jsx(xt, {
              type: "primary",
              htmlType: "submit",
              block: !0,
              loading: t,
              children: "登 录"
            })
          })]
        }), C.jsx("div", {
          className: "mt-4 text-xs text-gray-400 text-center",
          children: "没有账号？请联系系统管理员申请开通"
        })]
      })
    })]
  });
}
