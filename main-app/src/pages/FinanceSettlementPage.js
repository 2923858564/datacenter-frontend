import { Bt, C, Sr } from "../runtime/application.js";

export default function FinanceSettlementPage() {
  return C.jsx(Bt, {
    icon: C.jsx(Sr, {}),
    title: "渠道结算对账",
    subTitle: "结算单管理、数据对比与状态流转将在后续版本实现"
  });
}
