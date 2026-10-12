import { Bt, C, jr } from "../runtime/application.js";

export default function FinanceCostPage() {
  return C.jsx(Bt, {
    icon: C.jsx(jr, {}),
    title: "全维度成本台账",
    subTitle: "成本分类管理、趋势分析与预算对比将在后续版本实现"
  });
}
