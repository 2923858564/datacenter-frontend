import { Bt, C, sa } from "../runtime/application.js";

export default function PersonnelTasksPage() {
  return C.jsx(Bt, {
    icon: C.jsx(sa, {}),
    title: "任务派发 & 进度管控",
    subTitle: "任务看板、分配与进度跟踪将在后续版本实现"
  });
}
