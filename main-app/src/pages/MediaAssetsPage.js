import { Bt, C, Xn } from "../runtime/application.js";

export default function MediaAssetsPage() {
  return C.jsx(Bt, {
    icon: C.jsx(Xn, {}),
    title: "短视频图文素材库",
    subTitle: "素材网格展示、标签筛选与效果关联将在后续版本实现"
  });
}
