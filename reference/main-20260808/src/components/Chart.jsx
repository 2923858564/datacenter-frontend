import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
export default function Chart({
  option,
  height = 300
}) {
  const ref = useRef(null);
  const key = JSON.stringify(option);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <div ref={ref} style={{
    height,
    width: "100%"
  }} />;
}
