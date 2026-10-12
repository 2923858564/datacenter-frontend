(function () {
  "use strict";
  var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token");
  function showMessage(text) {
    document.body.textContent = text;
    document.documentElement.removeAttribute("data-paid-auth");
  }
  if (!token) {
    location.replace("/login");
    return;
  }
  fetch("/api/v1/auth/me", { headers: { Authorization: "Bearer " + token } })
    .then(function (response) {
      if (response.status === 401) {
        location.replace("/login");
        return null;
      }
      if (!response.ok) throw new Error("AUTH_REQUEST_FAILED");
      return response.json();
    })
    .then(function (body) {
      if (!body) return;
      var user = body.user || {};
      var permissions = Array.isArray(user.perms) ? user.perms : [];
      if (user.is_super || permissions.indexOf("*") >= 0 || permissions.indexOf("integration:registered_accounts") >= 0) {
        document.documentElement.removeAttribute("data-paid-auth");
      } else {
        showMessage("暂无付费用户看板访问权限");
      }
    })
    .catch(function () { showMessage("权限校验失败，请刷新重试"); });
})();
