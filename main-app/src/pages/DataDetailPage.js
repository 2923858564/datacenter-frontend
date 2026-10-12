import { C, Ji, dcDataDetailPage, dcRoleRecordsPage } from "../runtime/application.js";

export default function DataDetailPage() {
  const route = Ji();
  if (route.pathname === "/integration/role") return C.jsx(dcRoleRecordsPage, {});
  const views = {
    "/integration": ["recharge", "充值记录"],
    "/integration/active": ["active", "活跃明细"],
    "/integration/registration": ["registration", "注册明细"],
    "/integration/inactive": ["inactive", "流失预警"]
  };
  const [eventType, title] = views[route.pathname] || views["/integration"];
  return C.jsx(dcDataDetailPage, {
    eventType,
    title
  }, eventType);
}
