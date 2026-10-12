import { Bt, C, vn } from "../runtime/application.js";

export default function FinanceRoiPage() {
  return C.jsx(Bt, {
    icon: C.jsx(vn, {}),
    title: "ROI & 经营利润核算",
    subTitle: "按项目/渠道/活动维度的ROI分析将在后续版本实现"
  });
}
