import { Bt, C, Ji, dcDigitalAssetsPage, yn } from "../runtime/application.js";

export default /* DIGITAL_ASSETS_PATCH_END */

/* DIGITAL_ASSETS_MODULE_END */function AssetsPage() {
  const route = Ji();
  if (route.pathname === "/assets" && new URLSearchParams(route.search).get("view") === "digital") return C.jsx(dcDigitalAssetsPage, {});
  return C.jsx(Bt, {
    icon: C.jsx(yn, {}),
    title: "资产总览看板",
    subTitle: "暂无真实数据"
  });
}
