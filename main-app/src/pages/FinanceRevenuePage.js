import { Bt, C, jr } from "../runtime/application.js";

export default function FinanceRevenuePage() {
  return C.jsx(Bt, {
    icon: C.jsx(jr, {}),
    title: "营收数据台账",
    subTitle: "营收明细、构成分析与趋势预测将在后续版本实现"
  });
}
