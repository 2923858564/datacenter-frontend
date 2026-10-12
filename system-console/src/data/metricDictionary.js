const pending = "【待你确认】";
const reg = "注册明细：MySQL web_reg；快照模式 reg（统一注册数据）";
const pay = "充值明细：MySQL web_recharge；快照模式 recharge（实付金额 pay_amount）";
const both = `${reg}；${pay}`;
const active = "项目活跃快照 active_scope_hourly_snapshot；全局活跃快照 active_hourly_snapshot；源登录数据 ods_reg_es、ods_role_sdk2025 等";
const refresh = `随注册、充值数据发布更新；计划每小时刷新。实际最近成功时间${pending}，以对应看板数据更新时间为准`;
const day = "按注册时间、支付时间归属业务日；今日卡片截至最近整点，昨日全天与昨日同期分别展示";
const range = "按查询起止日期内的业务时间统计，含起止日期；今日数据受对应页面整点截止规则限制";
const zero = "有效范围内无记录时计数为 0；0 不代表采集完整，数据缺失需结合数据源状态判断";
const moneyNull = "现有计算将空实付金额按 0 累加；金额为 0 不代表源数据完整";
const ratioNull = "分母为 0 或缺失时返回空值，页面显示 --；不等于 0%";
const owner = "";

function entry(id, group, name, definition, formula, grain, time, unit, nullMeaning, source, overrides = {}) {
  return { id, group, name, definition, formula, grain, time, unit, nullMeaning, source, refresh,
    refreshKind: overrides.refresh ? "source" : "business", ...overrides, owner };
}

// server/app.py: day_metrics、game_ranking、game_detail、period_summary。
export const metrics = [
  entry("workOrderPlayerRecharge", "工单管理", "玩家累计充值金额", "工单关联玩家在同一平台、同一小号下的累计实付充值，与用户池累计充值口径一致；不是单笔充值，也不是跨平台全账号累充", "同平台小号充值明细实付金额合计与源表提供的累计充值取较大有效值；重复资料不重复求和", "平台 × 小号UID", "截至资料最近读取时已发布的数据，不按工单创建日期截断", "元", "未关联玩家或来源无累计金额时为未知，不能按零充值评星", "用户池注册账号关联；registered_account_source、recharge、角色关系表", { refresh: "关联玩家或点击工单详情的刷新玩家资料时更新；详情显示资料更新时间", aliases: "工单 玩家 累充 星级 SABCD" }),
  entry("newAcct", "核心看板·单日", "新账号数", "业务日内新增注册的去重账号数量", "注册明细按统一用户标识去重计数", "业务日 × 当前授权范围；可按项目细分", day, "个账号", zero, reg, { aliases: "newAcct na 注册数" }),
  entry("newPayAcct", "核心看板·单日", "新账号付费数", "业务日内注册且在同一业务日付费的账号数量", "注册账号集合与付费账号集合取交集，按平台＋账号名去重计数", "业务日 × 项目 × 当前授权范围", day, "个账号", zero, both, { aliases: "newPayAcct payNew np" }),
  entry("newPayAmt", "核心看板·单日", "新账号付费总额", "当日新注册账号在当日产生的实付金额合计", "汇总当日充值中平台＋账号名属于当日注册集合的实付金额", "业务日 × 项目 × 当前授权范围", day, "元", moneyNull, both, { aliases: "newPayAmt payNewAmt npa" }),
  entry("newPayRate", "核心看板·单日", "新账号付费率", "当日新注册账号中的付费账号占比", "新账号付费数 ÷ 新账号数 × 100%", "业务日 × 项目 × 当前授权范围", day, "%", ratioNull, both, { aliases: "newPayRate payNewRate npr" }),
  entry("payAcct", "核心看板·单日", "账号付费数", "当日发生付费的去重账号数量，包含新老账号", "充值明细按平台＋账号名去重计数", "业务日 × 项目 × 当前授权范围", day, "个账号", zero, pay, { aliases: "payAcct pc" }),
  entry("payCnt", "核心看板·单日", "付费次数", "当前范围的充值明细记录数", "统计充值明细记录条数", "业务日 × 项目 × 当前授权范围", day, "笔", zero, pay, { aliases: "payCnt 订单数" }),
  entry("payAmt", "核心看板·单日", "账号付费总额", "当日新老账号实付金额合计", "汇总充值明细实付金额，保留 2 位小数", "业务日 × 项目 × 当前授权范围", day, "元", moneyNull, pay, { aliases: "payAmt pa 充值金额 流水" }),
  entry("active", "核心看板·单日", "活跃账号数", "所选业务日当前范围的活跃账号数量", "读取当前范围活跃数据；项目排行今日取项目活跃数与新注册数的较大值", "业务日 × 项目／授权范围", "今日取当前整点；昨日同期取昨日相同整点；历史报表取当日最后快照", "个账号", "无对应范围快照时为空；多日项目排行暂不提供区间活跃账号数", active, { refresh: `按小时生成活跃快照；实际最近快照时间${pending}`, aliases: "active ac" }),
  entry("payRate", "核心看板·单日", "付费率", "付费账号占活跃账号的比例", "账号付费数 ÷ 活跃账号数 × 100%", "业务日 × 项目 × 当前授权范围", "分子、分母使用同一业务日；活跃按该页面快照口径", "%", ratioNull, `${pay}；${active}`, { aliases: "payRate pr" }),
  entry("arpu", "核心看板·单日", "每活跃账号平均收入", "每个活跃账号对应的平均实付金额", "账号付费总额 ÷ 活跃账号数，保留 2 位小数", "业务日 × 项目 × 当前授权范围", "同一业务日付费与活跃；多日排行无区间活跃时为空", "元/账号", "活跃数为 0 或缺失时为空，不使用注册数替代", `${pay}；${active}`, { aliases: "ARPU arpu ap" }),
  entry("arppu", "核心看板·单日", "每付费账号平均收入", "每个付费账号对应的平均实付金额", "账号付费总额 ÷ 账号付费数，保留 2 位小数", "业务日 × 项目 × 当前授权范围", day, "元/账号", "付费账号数为 0 时为空", pay, { aliases: "ARPPU arppu app" }),
  entry("monthReg", "核心看板·月累计", "当月注册账号总数", "本月开始至所选日期累计注册的去重账号数", "月内注册明细按统一用户标识去重计数", "自然月 × 项目／授权范围", "当月 1 日至所选日期，按注册业务日期", "个账号", zero, reg),
  entry("monthPay", "核心看板·月累计", "当月付费总额", "本月开始至所选日期累计实付金额", "汇总当月充值明细的实付金额", "自然月 × 项目／授权范围", "当月 1 日至所选日期，按支付业务日期", "元", moneyNull, pay),
  entry("periodReg", "区间汇总", "区间注册账号数", "查询期间内去重注册账号数", "区间注册明细按统一用户标识去重计数", "查询区间 × 授权范围", range, "个账号", zero, reg),
  entry("periodNewPay", "区间汇总", "区间新账号付费数", "查询期间注册且在期间内付费的账号数", "区间注册与付费集合按平台＋账号名取交集计数", "查询区间 × 授权范围", "注册和付费均在查询区间，可发生在不同日期", "个账号", zero, both),
  entry("periodNewAmt", "区间汇总", "区间新账号付费总额", "区间新注册账号在区间内产生的实付合计", "汇总区间充值中属于区间注册集合的实付金额", "查询区间 × 授权范围", range, "元", moneyNull, both),
  entry("periodPayAcct", "区间汇总", "区间付费账号数", "区间内发生付费的去重账号数量", "区间充值按平台＋账号名去重；同账号跨日只计一次", "查询区间 × 授权范围", range, "个账号", zero, pay),
  entry("periodArpu", "区间汇总", "每新注册账号平均收入", "区间汇总接口中的 ARPU，分母为新注册账号数", "区间新账号付费总额 ÷ 区间注册账号数", "查询区间 × 授权范围", range, "元/账号", "区间注册账号数为 0 时为空", both, { aliases: "ARPU period-summary arpu" }),
  entry("cumulativeRate", "区间汇总", "累计付费率", "区间汇总接口返回的截至结束日累计付费与注册账号之比", "累计付费账号数（平台＋账号名）÷ 累计注册账号数（平台＋用户标识）× 100%", "截至结束日累计；当前区间汇总调用使用全量注册充值集合", "累计至查询结束日，不以区间开始日截断", "%", "无累计注册或比值超过 100% 时为空", both, { aliases: "cumulative_pay_rate payRate period-summary" }),
  entry("dailySummaryPaid", "项目详情·日报汇总", "日报汇总付费账号数", "项目详情日报各日付费账号数之和", "逐日付费账号数相加；同账号在不同日期可重复计入", "项目 × 日报覆盖日期", "日报展示的各业务日", "账号日", zero, pay),
  entry("dailySummaryActive", "项目详情·日报汇总", "日报汇总活跃账号数", "项目详情日报已知活跃数的逐日合计", "将有值日期的活跃账号数相加", "项目 × 日报覆盖日期", "日报各业务日；历史日取当日最后快照", "账号日", "全部日期缺失时为空；部分日期缺失时仅汇总已知日期，不能视作完整区间活跃", active, { refresh: `随活跃快照更新；实际最近快照时间${pending}` }),
];

// server/sdk_game_analysis.py: _read_ranking、_summary、_cards。
const sdkSource = "996 游戏数据排行导出表（Excel 文件）；明细读取对应列，未保存为本模块数据库事实表";
const sdkRefresh = `随最新游戏排行导出文件更新，同日使用最后写入文件；实际最近文件更新时间${pending}`;
const sdkRows = [
  ["new_accounts", "新账号数", "导出表记录的新账号数量", "明细取「新账号数」列；无原汇总行时将各游戏新账号数相加", "个账号"],
  ["new_paid_accounts", "新账号付费数", "导出表记录的新账号付费数量", "明细取「新账号付费数」列；无原汇总行时按游戏求和", "个账号"],
  ["new_paid_amount", "新账号付费总额", "导出表记录的新账号付费金额", "明细取「新账号付费总额」列；无原汇总行时按游戏求和", "元"],
  ["new_paid_rate", "新账号付费率", "导出表的新账号付费占比", "明细取源比例；补算汇总 = 新账号付费数 ÷ 新账号数 × 100%", "%"],
  ["active_accounts", "活跃账号数", "导出表记录的活跃账号数量", "明细取「活跃账号数」列；补算汇总为各游戏相加，跨游戏不额外去重", "个账号"],
  ["paid_accounts", "账号付费数", "导出表记录的付费账号数量", "明细取「账号付费数」列；补算汇总按游戏相加", "个账号"],
  ["paid_times", "付费次数", "导出表记录的付费笔数", "明细取「付费次数」列；补算汇总按游戏相加", "笔"],
  ["paid_amount", "账号付费总额", "导出表记录的付费金额", "明细取「账号付费总额」列；补算汇总按游戏相加", "元"],
  ["paid_rate", "付费率", "导出表记录的付费比例", "明细取源比例；补算汇总 = 账号付费数 ÷ 活跃账号数 × 100%", "%"],
  ["arpu", "每活跃账号平均收入", "导出表的 ARPU", "明细取源 ARPU；补算汇总 = 账号付费总额 ÷ 活跃账号数", "元/账号"],
  ["arppu", "每付费账号平均收入", "导出表的 ARPPU", "明细取源 ARPPU；补算汇总 = 账号付费总额 ÷ 账号付费数", "元/账号"],
];
metrics.push(...sdkRows.map(([key, name, definition, formula, unit]) => entry(`sdk_${key}`, "商务·996游戏分析", name, definition, formula,
  "数据日 × 游戏；汇总按导出表或游戏合计", "按文件名标记的数据日；指定日期无文件时选之前最近日期，无更早文件时选最早可用日期", unit,
  unit === "%" || unit === "元/账号" ? "源空值、-、--、非数字保留为空；补算时分母为 0 也为空" : "源空值、-、--、非数字按 0 读取；0 可能表示源缺失", sdkSource,
  { aliases: key, refresh: sdkRefresh })));

// server/channel_detail_v9/service.py: promoter_summary。
const channelGrain = "查询区间 × 平台 × 推广账号 × 包体 × 项目";
const channelRows = [
  ["new_account_count", "新账号数", "渠道推广账号当前范围内的注册账号数", "注册明细按平台＋用户标识去重；标识缺失时使用账号名", "个账号", reg],
  ["new_paid_count", "新账号付费数", "当前范围内注册且付费的账号数", "按平台＋账号名求区间注册与付费集合交集，忽略空账号名", "个账号", both],
  ["new_paid_amount", "新账号付费总额", "当前范围内新注册账号的实付合计", "汇总区间付费中平台＋账号名属于区间注册集合的金额", "元", both],
  ["registration_count", "当期注册账号总数", "查询期间内注册账号总数，与同页新账号数同口径", "注册明细按平台＋用户标识（缺失时账号名）去重", "个账号", reg],
  ["paid_count", "账号付费数", "当前范围内发生付费的账号数", "按平台＋非空账号名去重计数", "个账号", pay],
  ["paid_amount", "账号付费总额", "当前范围内充值实付金额合计", "汇总归入当前渠道、项目、包体和推广账号的实付金额", "元", pay],
  ["period_paid_amount", "当期付费总额", "查询期间实付总额，与同页账号付费总额同口径", "汇总当前查询范围的实付金额", "元", pay],
  ["recharge_order_count", "充值订单数", "当前范围内充值事实记录数", "统计归入当前范围的充值记录条数", "笔", pay],
  ["recharge_rate", "新账号充值率", "查询期间注册账号中的充值账号占比", "新账号付费数 ÷ 当期注册账号总数 × 100%", "%", both],
];
metrics.push(...channelRows.map(([key, name, definition, formula, unit, source]) => entry(`channel_${key}`, "渠道·推广账号详情", name, definition, formula,
  channelGrain, "注册按注册日期、充值按支付日期，包含查询起止日；注册与充值可发生在区间内不同日期", unit,
  unit === "%" ? ratioNull : unit === "元" ? moneyNull : zero, `${source}；按渠道映射和用户授权范围过滤`, { aliases: key })));
metrics.push(entry("channel_active", "渠道·推广账号详情", "活跃账号数", "渠道推广账号详情的活跃指标", "当前数据源未提供，接口返回空值", channelGrain, "查询区间", "个账号", "空值表示数据源尚不可用，不代表无活跃", `活跃来源表${pending}`, { refresh: `数据源未接入，实际刷新时间${pending}` }));
