import { C, Xr, dcV3Mount } from "../runtime/application.js";

export default function ChannelPage() {
  const ref = Xr.useRef(null);
  Xr.useEffect(() => dcV3Mount(ref.current), []);
  return C.jsx('div', {
    className: 'dc-proto-bridge',
    ref: ref
  });
}
