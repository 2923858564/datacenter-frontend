import { Bt, C, qn } from "../runtime/application.js";

export default function LegacyConfigPage() {
  return C.jsx(Bt, {
    icon: C.jsx(qn, {}),
    title: "系统全局配置",
    subTitle: "系统参数、预警规则与基础配置将在后续版本实现"
  });
}
