(function () {
  "use strict";

  // 站内路由可能重复注入同一脚本；只允许第一份生效，避免重复样式/重复监听。
  if (window.__dcHeroRiskInstalled) return;
  window.__dcHeroRiskInstalled = true;
  var ROUTE = "/risk/quality";
  var ROOT_ID = "dc-hero-risk-root";
  var MENU_ID = "dc-hero-risk-menu";
  var TOP_ID = "dc-risk-module-menu";
  var STYLE_ID = "dc-hero-risk-prototype-style";
  var restoreEntryRoute = document.currentScript && document.currentScript.dataset.entryRoute === ROUTE;
  var now = new Date();
  var todayText = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  var yesterdayDate = new Date(now.getTime() - 86400000);
  var yesterdayText = yesterdayDate.getFullYear() + "-" + String(yesterdayDate.getMonth() + 1).padStart(2, "0") + "-" + String(yesterdayDate.getDate()).padStart(2, "0");
  var selectedPeriod = "yesterday";
  var selectedViolationPeriod = "yesterday";
  var selectedStatusPeriod = "yesterday";
  var selectedDetailPeriod = "week";
  var selectedViolation = "IP关联商人";
  var selectedDetailKind = "violation";
  var selectedViolationByPeriod = {
    yesterday: "IP关联商人",
    week: "手拉",
    month: "手拉"
  };
  var selectedStatusByPeriod = {
    yesterday: "禁言7天",
    week: "禁言7天",
    month: "禁言3天"
  };
  var selectedViolationChart = "radar";
  var selectedStatusChart = "donut";
  var openPeriodPicker = "";
  var pendingRangeStart = "";
  var calendarMonthOffset = 0;
  var dateRanges = {
    overview: [yesterdayText, yesterdayText],
    violation: [yesterdayText, yesterdayText],
    status: [yesterdayText, yesterdayText]
  };
  var detailKeyword = "";
  var detailOpen = false;
  var selectedRiskQueueFilter = "all";
  var selectedRiskCaseId = "RC-0916-001";
  var loaded = false;
  var queryBusy = false;
  var queryError = "";
  var sourceGames = [];
  var sourceZones = [];
  var selectedGameId = "";
  var selectedZoneId = "";
  var sourceFetchedAt = "";
  var sourceComplete = true;
  var sourceCounts = {
    chat: 0,
    item: 0,
    ip: 0
  };
  var scatterData = [];
  var trendData = [];
  var syncTimer = 0;
  var riskWordCloudChart = null;
  var riskWordCloudMask = null;
  var riskWordCloudEnginePromise = null;
  var riskWordCloudRenderToken = 0;
  var riskWordCloudData = [];
  var riskConfigOpen = false;
  var riskConfigBusy = false;
  var riskConfigError = "";
  var riskRuleDraft = null;
  var riskRuleDefaults = null;
  var riskRuleEngine = null;
  var riskRoutes = ["/risk/quality", "/dashboard/chat-risk", "/dashboard/item-log", "/risk/ip-library"];
  var riskItems = [{
    key: "/risk/quality",
    label: "风控看板",
    icon: "▦"
  }, {
    key: "/dashboard/chat-risk",
    label: "聊天风控",
    icon: "◉"
  }, {
    key: "/dashboard/item-log",
    label: "物品记录",
    icon: "◇"
  }, {
    key: "/risk/ip-library",
    label: "IP库",
    icon: "⌁"
  }];
  var periods = {
    yesterday: {
      label: "昨日",
      query: "Yesterday",
      rows: 227,
      roles: 225,
      violations: [["工作室（同IP同战区10个角色以上）", 219], ["商人", 152], ["IP关联商人", 26]],
      statuses: [["永久封禁", 157], ["封小保大", 30], ["不处理", 16], ["封停角色15天", 16], ["禁言7天", 8]]
    },
    week: {
      label: "上周",
      query: "LastWeek",
      rows: 255,
      roles: 254,
      violations: [["IP关联商人", 154], ["工作室（同IP同战区10个角色以上）", 75], ["商人", 49], ["手拉", 5]],
      statuses: [["永久封禁", 200], ["封停角色15天", 30], ["封小保大", 17], ["不处理", 5], ["禁言7天", 3]]
    },
    month: {
      label: "上月",
      query: "LastMonth",
      rows: 2028,
      roles: 1990,
      violations: [["IP关联商人", 678], ["手拉", 646], ["工作室（同IP同战区10个角色以上）", 604], ["商人", 89], ["发送联系方式", 11]],
      statuses: [["永久封禁", 1718], ["封停角色15天", 135], ["封小保大", 83], ["待处理", 42], ["不处理", 28], ["禁言7天", 21], ["追封15天", 13], ["禁言3天", 1], ["解散行会", 1]]
    }
  };
  var sources = [["幻斗聊天预警，每日更新", "聊天内容命中规则词或连续数字", "聊天预警"], ["幻斗IP预警，每日更新", "命中幻斗IP库，或同IP角色数≥4", "IP预警"], ["幻斗物品丢弃预警", "按物品名称和变化数量阈值判定", "行为预警"], ["幻斗充值预警", "充值总金额＜200元", "充值预警"]];
  var detailColumns = ["日期", "巡查人员", "区服ID", "区服", "角色名", "角色ID", "充值金额", "IP地址", "违规类型"];
  var violationDetails = {
    yesterday: {
      "工作室（同IP同战区10个角色以上）": [["2026/09/14", "何平", "13637501", "圣战1区", "洪狂型坦克", "13663794001783500221000152049", 104, "121.196.225.246", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "依依是个好女孩", "13663794001783504725000154835", 6221, "157.148.73.136", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "茶韵清香香", "13704113001783813875000039520", 192, "140.210.139.12", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "商人": [["2026/09/14", "何平", "13637501", "圣战1区", "洪狂型坦克", "13663794001783500221000152049", 104, "121.196.225.246", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "依依是个好女孩", "13663794001783504725000154835", 6221, "157.148.73.136", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "IP关联商人": [["2026/09/14", "何平", "14307900", "圣龙72区", "逍遥狼", "14308469001788579214000030639", 495, "112.123.236.5、112.122.238.9", "IP关联商人"], ["2026/09/14", "何平", "14307900", "圣龙72区", "逍遥郎", "14308469001788579561000043895", 104, "112.123.236.5", "IP关联商人"], ["2026/09/14", "何平", "14307900", "圣龙72区", "逍遥", "14308298001788578635000132752", 0, "112.122.238.9", "IP关联商人"]]
    },
    week: {
      "手拉": [["2026/09/07", "任梦倩", "14331007", "圣龙101区", "堕天遗武", "14331007001788755949000002877", 192, "36.137.98.41", "手拉"], ["2026/09/07", "任梦倩", "14331922", "圣龙102区", "零点", "14331922001788760838000005203", 192, "121.229.4.160", "手拉"], ["2026/09/07", "任梦倩", "14334020", "圣龙104区", "战鼓", "14334020001788772937000004996", 192, "36.133.233.185", "手拉"]],
      "IP关联商人": [["2026/09/08", "任梦倩", "13942114", "战神97区", "邪圣", "13953739001785778123000028226", 3122, "150.138.155.0、122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "13942114", "战神97区", "风景", "13958622001785838996000018075", 4115, "150.138.155.0", "IP关联商人"], ["2026/09/08", "任梦倩", "14296053", "圣龙58区", "韦爵爷", "14304402001788528429000078147", 0, "150.138.155.0", "IP关联商人"], ["2026/09/08", "任梦倩", "13725020", "法神1区", "梦醒時见你", "13737849001784130156000180600", 48697, "122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "11866136", "羊岁月", "交友神龙", "11967574001770653524000010037", 182, "122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "14287790", "圣龙53区", "益请叫我", "14287790001788425001000017702", 18, "122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "12931667", "狂风69区", "君临天下", "12932376001777927828000122188", 94, "150.138.155.0", "IP关联商人"], ["2026/09/08", "任梦倩", "14237678", "光芒116区", "太叔尕嫣", "14237678001788105490000151272", 0, "122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "14097903", "真魂52区", "悍匪荆遗忘", "14097903001786937981000003583", 250, "122.9.109.55", "IP关联商人"], ["2026/09/08", "任梦倩", "13637501", "圣战1区", "爆叁", "13637501001783268786000056690", 192, "120.232.192.26", "IP关联商人"], ["2026/09/08", "任梦倩", "14341952", "魔龙1区", "不饿", "14341952001788797621000014192", 192, "120.232.192.26", "IP关联商人"], ["2026/09/08", "任梦倩", "13637501", "圣战1区", "麻辣烫如今好贵", "13637501001783268964000067420", 192, "114.112.217.146", "IP关联商人"]],
      "工作室（同IP同战区10个角色以上）": [["2026/09/07", "何平", "11228926", "烈火01区", "悍匪笑号", "11465804001766855071000033429", 7404, "111.62.145.194", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪号", "11386361001766286418000254453", 17450, "101.67.35.211", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪晓号", "11235102001765107047000352359", 7132, "115.227.9.185", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "商人": [["2026/09/07", "何平", "14008316", "圣魔39区", "小雷", "14008316001786229971000139244", 104, "117.155.164.229", "商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪笑号", "11465804001766855071000033429", 7404, "111.62.145.194", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪号", "11386361001766286418000254453", 17450, "101.67.35.211", "工作室工作室（同IP同战区10个角色以上）、商人"]]
    },
    month: {
      "手拉": [["2026/08/01", "何平", "13919136", "战神43区", "适者生存", "13919136001785507551000001831", 192, "120.48.68.202", "手拉"], ["2026/08/01", "何平", "13920988", "战神45区", "归来", "13920988001785511819000001727", 192, "115.226.69.96", "手拉"], ["2026/08/01", "孙超男", "13921651", "战神53区", "五妹乐", "13921651001785546432000002588", 192, "220.175.179.100", "手拉"]],
      "发送联系方式": [["2026/08/02", "任梦倩", "13910489", "战神29区", "万青霞", "13915821001785494914000108122", 382, "116.63.75.3", "发送联系方式"], ["2026/08/02", "任梦倩", "13932416", "战神78区", "走着", "13932416001785632814000003827", 192, "116.147.113.65", "发送联系方式"], ["2026/08/10", "何平", "13637501", "圣战1区", "a阿友哥", "13645026001783334952000030467", 200, "222.246.155.205", "发送联系方式"]],
      "IP关联商人": [["2026/08/01", "何平", "13909871", "战神26区", "小璨", "13909871001785434444000092331", 192, "106.119.179.43", "IP关联商人"], ["2026/08/01", "何平", "12186673", "火符32区", "风花雪夜", "12438596001774251706000103795", 234, "106.119.179.43", "IP关联商人"], ["2026/08/01", "何平", "13460606", "龙纹1区", "危依瑶", "13460638001782063718000180773", 192, "106.119.179.43", "IP关联商人"]],
      "工作室（同IP同战区10个角色以上）": [["2026/08/08", "孙超男", "", "半月1区（霸气车车）", "忘不掉的伤", "12445105001774289475000217305", 94, "219.232.77.101", "工作室工作室（同IP同战区10个角色以上）"], ["2026/08/08", "孙超男", "", "半月1区（霸气车车）", "十八", "12526982001774931451000114965", 94, "219.232.77.101", "工作室工作室（同IP同战区10个角色以上）"], ["2026/08/08", "孙超男", "", "半月1区（霸气车车）", "御魄初夏斩", "12467848001774459503000077043", 94, "219.232.77.101", "工作室工作室（同IP同战区10个角色以上）"]],
      "商人": [["2026/08/01", "孙超男", "13648464", "圣战32区", "莫须", "13662363001783488553000126018", 576, "223.104.161.0", "商人"], ["2026/08/01", "孙超男", "13817540", "天尊17区", "雲涌", "13817540001784710377000009381", 192, "118.253.194.158", "商人"], ["2026/08/01", "孙超男", "13648464", "圣战32区", "空白", "13657808001783427170000053340", 104, "223.104.161.0", "商人"]]
    }
  };
  var statusDetails = {
    yesterday: {
      "永久封禁": [["2026/09/14", "何平", "14307900", "圣龙72区", "逍遥狼", "14308469001788579214000030639", 495, "112.123.236.5、112.122.238.9", "IP关联商人"], ["2026/09/14", "何平", "14307900", "圣龙72区", "逍遥郎", "14308469001788579561000043895", 104, "112.123.236.5", "IP关联商人"]],
      "封小保大": [["2026/09/14", "何平", "13637501", "圣战1区", "依依是个好女孩", "13663794001783504725000154835", 6221, "157.148.73.136", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "落叶轮回丶", "13669103001783520143000001195", 3218, "118.178.56.155", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "不处理": [["2026/09/14", "何平", "13637501", "圣战1区", "冉达华", "13663794001783499243000149871", 104, "47.99.70.18", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "董无敌提问", "13663794001783497629000145554", 104, "116.62.232.62", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "禁言7天": [["2026/09/14", "何平", "12629783", "圣言1区", "天天天", "12630270001775673060000004082", 1323, "183.162.227.105", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "12652809", "圣言78区", "噜啦啦", "12719661001776340001000003703", 1423, "61.132.230.182", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "封停角色15天": [["2026/09/14", "何平", "13637501", "圣战1区", "我被资本做局了", "13715626001783916604000012128", 767, "120.236.196.247", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/14", "何平", "13637501", "圣战1区", "好运来", "13713992001783874485000088416", 1590, "47.98.153.207", "工作室工作室（同IP同战区10个角色以上）、商人"]]
    },
    week: {
      "永久封禁": [["2026/09/07", "何平", "14008316", "圣魔39区", "小雷", "14008316001786229971000139244", 104, "117.155.164.229", "商人"], ["2026/09/07", "任梦倩", "14331007", "圣龙101区", "堕天遗武", "14331007001788755949000002877", 192, "36.137.98.41", "手拉"]],
      "封停角色15天": [["2026/09/07", "何平", "11228926", "烈火01区", "盗贼", "11498057001767111638000011692", 2559, "39.173.124.198", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪啸号", "11531527001767370118000002769", 1087, "183.247.255.179", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "封小保大": [["2026/09/07", "何平", "11228926", "烈火01区", "悍匪笑号", "11465804001766855071000033429", 7404, "111.62.145.194", "工作室工作室（同IP同战区10个角色以上）、商人"], ["2026/09/07", "何平", "11228926", "烈火01区", "悍匪号", "11386361001766286418000254453", 17450, "101.67.35.211", "工作室工作室（同IP同战区10个角色以上）、商人"]],
      "不处理": [["2026/09/08", "任梦倩", "14217544", "光芒84区", "前传唐僧", "14217544001787878819000016381", 192, "39.173.124.209", "工作室工作室（同IP同战区10个角色以上）"], ["2026/09/13", "任梦倩", "14250994", "圣龙1区", "苗千年等三回", "14251000001788110281000027857", 192, "111.8.8.143", "IP关联商人"]],
      "禁言7天": [["2026/09/11", "孙超男", "13648998", "圣战33区", "与世无争", "13671337001783548577000048211", 1014, "101.69.180.46", "IP关联商人"], ["2026/09/11", "孙超男", "13648998", "圣战33区", "泡芙", "13688102001783679130000085252", 1647, "150.138.142.186、163.177.77.62", "IP关联商人"]]
    },
    month: {
      "永久封禁": [["2026/08/01", "何平", "13919136", "战神43区", "适者生存", "13919136001785507551000001831", 192, "120.48.68.202", "手拉"], ["2026/08/01", "何平", "13920988", "战神45区", "归来", "13920988001785511819000001727", 192, "115.226.69.96", "手拉"]],
      "封小保大": [["2026/08/01", "何平", "13276798", "裁决1区", "傲世刀磨", "13302461001780727356000010266", 21007, "106.119.179.43", "IP关联商人"], ["2026/08/01", "何平", "13276798", "裁决1区", "傲世空空", "13366682001781182003000088883", 104354, "106.119.179.43", "IP关联商人"]],
      "禁言3天": [["2026/08/02", "任梦倩", "13910489", "战神29区", "万青霞", "13915821001785494914000108122", 382, "116.63.75.3", "发送联系方式"]],
      "不处理": [["2026/08/01", "孙超男", "13648464", "圣战32区", "莫须", "13662363001783488553000126018", 576, "223.104.161.0", "商人"], ["2026/08/08", "任梦倩", "13482694", "龙纹60区", "范黑猫每天稳", "13496109001782192238000142329", 104, "101.69.180.52", "IP关联商人"]],
      "禁言7天": [["2026/08/02", "任梦倩", "13932416", "战神78区", "走着", "13932416001785632814000003827", 192, "116.147.113.65", "发送联系方式"], ["2026/08/04", "任梦倩", "13953739", "战神115区", "红茶", "13953739001785777608000006680", 192, "139.9.237.93", "手拉"]],
      "追封15天": [["2026/08/01", "何平", "12722701", "十方3区", "小河蟹", "12794269001776919851000002088", 607, "106.119.179.43", "IP关联商人"], ["2026/08/03", "孙超男", "13867526", "天尊161区", "宇宇", "13872248001785143431000013766", 192, "115.120.40.171", "手拉"]],
      "封停角色15天": [["2026/08/01", "何平", "12722701", "十方3区", "小河蟹", "12794269001776919851000002088", 607, "106.119.179.43", "IP关联商人"], ["2026/08/03", "孙超男", "13867526", "天尊161区", "宇宇", "13872248001785143431000013766", 192, "115.120.40.171", "手拉"]],
      "待处理": [["2026/08/18", "任梦倩", "", "真魂24区", "横刀倾城", "14086007001786810169000033720", 104, "123.169.205.146", "IP关联商人"], ["2026/08/18", "任梦倩", "", "真魂24区", "弹道无痕", "14086007001786810147000025794", 104, "123.169.205.146", "IP关联商人"]],
      "解散行会": [["2026/08/13", "何平", "13986440", "圣魔3区", "大金妹妹全拼", "13986888001786064832000111062", 192, "101.245.90.41、1.95.213.55", "IP关联商人"]]
    }
  };
  var riskCases = [{
    id: "RC-0916-001",
    role: "悍匪笑号",
    roleId: "11465804001766855071000033429",
    server: "烈火01区",
    inspector: "何平",
    detectedAt: "09:47",
    window: "09:00–10:00",
    signals: ["聊天", "IP", "物品", "货币", "充值"],
    occurrences: 8,
    status: "待处置",
    evidenceClosed: true,
    action: "复核完整证据链后执行处置",
    evidence: ["聊天命中交易联系方式规则", "异常IP库命中且同区服多角色", "物品与货币存在大额转移行为", "充值档位命中异常筛选"]
  }, {
    id: "RC-0916-002",
    role: "逍遥狼",
    roleId: "14308469001788579214000030639",
    server: "圣龙72区",
    inspector: "何平",
    detectedAt: "09:38",
    window: "09:00–10:00",
    signals: ["聊天", "IP", "物品", "充值"],
    occurrences: 6,
    status: "跟踪",
    evidenceClosed: false,
    action: "优先核查关联IP与聊天原文",
    evidence: ["同一小时内关联2个异常IP", "角色出现数大于4且状态为跟踪", "聊天与物品信号待人工复核"]
  }, {
    id: "RC-0916-003",
    role: "依依是个好女孩",
    roleId: "13663794001783504725000154835",
    server: "圣战1区",
    inspector: "何平",
    detectedAt: "09:26",
    window: "09:00–10:00",
    signals: ["IP", "物品", "货币"],
    occurrences: 4,
    status: "待核实",
    evidenceClosed: false,
    action: "核验物品与货币流向",
    evidence: ["同IP角色聚集", "物品转移数量达到规则阈值", "货币异常信号待补充原始记录"]
  }, {
    id: "RC-0916-004",
    role: "堕天遗武",
    roleId: "14331007001788755949000002877",
    server: "圣龙101区",
    inspector: "任梦倩",
    detectedAt: "09:18",
    window: "09:00–10:00",
    signals: ["聊天", "IP"],
    occurrences: 3,
    status: "观察",
    evidenceClosed: false,
    action: "继续观察下一小时信号",
    evidence: ["聊天关键词命中", "登录IP命中关联规则"]
  }, {
    id: "RC-0916-005",
    role: "万青霞",
    roleId: "13915821001785494914000108122",
    server: "战神29区",
    inspector: "任梦倩",
    detectedAt: "09:11",
    window: "09:00–10:00",
    signals: ["聊天"],
    occurrences: 1,
    status: "观察",
    evidenceClosed: false,
    action: "保留信号，不进入处置",
    evidence: ["聊天内容命中发送联系方式规则"]
  }];
  function installStyle() {
    // 页面可能同时存在多份脚本实例（站内路由多次注入），必须清掉全部同名样式，否则旧样式会后置覆盖。
    Array.prototype.forEach.call(document.querySelectorAll("#" + STYLE_ID), function (node) {
      node.remove();
    });
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [".dc-hero-risk-host-hidden{display:none!important}", "#dc-hero-risk-root{box-sizing:border-box;width:100%;min-height:calc(100vh - 88px);padding:24px;background:#f4f7fb;color:#1d2939}", "#dc-hero-risk-root *{box-sizing:border-box}", ".dc-hr-head{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:-24px -24px 22px;padding:28px 28px 24px;overflow:hidden;background:linear-gradient(122deg,#071b3a 0%,#0b3b78 58%,#0866b2 100%);color:#fff}.dc-hr-head:after{content:'';position:absolute;right:-70px;top:-120px;width:330px;height:330px;border:54px solid rgba(87,196,255,.13);border-radius:50%}.dc-hr-title{position:relative;z-index:1;display:flex;align-items:center;gap:10px}.dc-hr-title h1{margin:0;font-size:26px;letter-spacing:.5px}.dc-hr-badge{padding:3px 9px;border:1px solid rgba(255,255,255,.38);border-radius:999px;background:rgba(255,255,255,.12);color:#dff4ff;font-size:12px}.dc-hr-sub{position:relative;z-index:1;margin:8px 0 0;color:#c4dcf7}.dc-hr-project{position:relative;z-index:1;display:flex;align-items:center;gap:8px;margin-top:14px;color:#dbeafe;font-size:13px}.dc-hr-project select{height:32px;padding:0 30px 0 10px;border:1px solid rgba(255,255,255,.35);border-radius:6px;background:#fff;color:#1d2939}", ".dc-hr-btn{position:relative;z-index:1;height:38px;padding:0 16px;border:1px solid rgba(255,255,255,.42);border-radius:7px;background:#fff;color:#0958d9;font-weight:600;cursor:pointer;box-shadow:0 8px 22px rgba(0,20,55,.18)}.dc-hr-tabs{display:flex;gap:8px;margin-bottom:16px}.dc-hr-tabs button{padding:8px 20px;border:1px solid #d0d5dd;border-radius:7px;background:#fff;cursor:pointer}.dc-hr-tabs button.active{border-color:#1677ff;background:#eaf3ff;color:#0958d9;font-weight:600}", ".dc-hr-viewtabs{display:flex;gap:18px;margin-bottom:16px;border-bottom:1px solid #e4e7ec}.dc-hr-viewtabs button{padding:9px 2px;border:0;border-bottom:2px solid transparent;background:transparent;color:#667085;cursor:pointer}.dc-hr-viewtabs button.active{border-color:#1677ff;color:#0958d9;font-weight:600}", ".dc-hr-empty{display:grid;place-items:center;min-height:420px;border:1px dashed #b9c3d0;border-radius:12px;background:#fff;color:#667085}.dc-hr-empty strong{display:block;margin-bottom:8px;color:#344054;font-size:18px}", ".dc-hr-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}.dc-hr-card{border:1px solid #e4e7ec;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04)}.dc-hr-metric{grid-column:span 3;padding:18px}.dc-hr-metric .label{color:#667085;font-size:13px}.dc-hr-metric .value{margin-top:8px;font-size:34px;font-weight:700;line-height:1}.dc-hr-metric .hint{margin-top:9px;color:#98a2b3;font-size:12px}", ".dc-hr-chart{grid-column:span 6;padding:18px}.dc-hr-card h2{margin:0 0 16px;font-size:16px}.dc-hr-bars{display:flex;flex-direction:column;gap:13px}.dc-hr-bar-row{display:grid;grid-template-columns:minmax(130px,1.35fr) 2fr 56px;gap:12px;align-items:center;font-size:13px}.dc-hr-bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#475467}.dc-hr-track{height:12px;border-radius:99px;background:#eef2f6;overflow:hidden}.dc-hr-fill{height:100%;min-width:4px;border-radius:99px;background:linear-gradient(90deg,#ff7a45,#faad14)}.dc-hr-status .dc-hr-fill{background:linear-gradient(90deg,#1677ff,#36cfc9)}.dc-hr-bar-value{text-align:right;font-weight:600}", ".dc-hr-note{grid-column:span 12;padding:13px 16px;border-left:4px solid #faad14;background:#fffbe6;color:#7a5600;font-size:13px}.dc-hr-index{grid-column:span 12;padding:18px}.dc-hr-flow{display:grid;grid-template-columns:1.2fr 54px 1.2fr 54px 1fr;gap:12px;align-items:center}.dc-hr-source-list{display:grid;gap:8px}.dc-hr-source{padding:11px;border:1px solid #e4e7ec;border-radius:8px;background:#f9fafb}.dc-hr-source strong{display:block;font-size:13px}.dc-hr-source span{display:block;margin-top:4px;color:#667085;font-size:12px}.dc-hr-arrow{text-align:center;color:#1677ff;font-size:24px}.dc-hr-node{padding:16px;border:1px solid #91caff;border-radius:10px;background:#eaf3ff}.dc-hr-node strong,.dc-hr-node span{display:block}.dc-hr-node span{margin-top:6px;color:#475467;font-size:12px}", ".dc-hr-table{width:100%;border-collapse:collapse}.dc-hr-table th,.dc-hr-table td{padding:11px 12px;border-bottom:1px solid #eaecf0;text-align:left;font-size:13px}.dc-hr-table th{width:160px;color:#475467;background:#f9fafb}.dc-hr-foot{margin-top:14px;color:#667085;font-size:12px}", ".dc-hr-trend{grid-column:span 12;padding:18px}.dc-hr-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.dc-hr-card-head h2{margin:0}.dc-hr-legend{color:#98a2b3;font-size:12px}.dc-hr-trend-chart{height:190px}.dc-hr-trend-svg{display:block;width:100%;height:190px;overflow:visible}.dc-hr-trend-grid{stroke:#e9eef5;stroke-width:1}.dc-hr-trend-area{fill:url(#dcTrendArea)}.dc-hr-trend-line{fill:none;stroke:url(#dcTrendLine);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 5px 7px rgba(22,119,255,.18))}.dc-hr-trend-point{fill:#fff;stroke:#1677ff;stroke-width:3}.dc-hr-trend-value{fill:#16365f;font-size:11px;font-weight:700;text-anchor:middle}.dc-hr-trend-label{fill:#98a2b3;font-size:11px;text-anchor:middle}", ".dc-risk-signal-section{margin:14px 0}.dc-risk-signal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dc-risk-signal-card{min-width:0;overflow:hidden;border:1px solid #e4e7ec;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04)}.dc-risk-signal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 16px 6px}.dc-risk-signal-head strong{color:#16365f;font-size:15px}.dc-risk-signal-head span{color:#98a2b3;font-size:11px}.dc-ban-word-cloud{display:flex;min-height:282px;align-items:center;justify-content:center;padding:4px 16px 12px;background:#fff}.dc-ban-word-cloud svg{display:block;width:100%;height:264px;overflow:visible}.dc-ban-word{cursor:default;font-family:'Microsoft YaHei','PingFang SC',sans-serif;font-weight:800;paint-order:stroke;stroke:#fff;stroke-width:2px;stroke-linejoin:round;transition:opacity .16s,filter .16s,transform .16s;transform-box:fill-box;transform-origin:center}.dc-ban-word:hover{filter:drop-shadow(0 5px 8px rgba(16,42,86,.18));opacity:1;transform:scale(1.08)}.dc-server-scatter{display:block;width:100%;height:288px}.dc-scatter-grid{stroke:#e7edf5;stroke-width:1}.dc-scatter-axis{stroke:#9fb2c8;stroke-width:1.2}.dc-scatter-label{fill:#98a2b3;font-size:10px}.dc-scatter-axis-title{fill:#667085;font-size:10px;font-weight:600}.dc-scatter-dot{cursor:default;fill:url(#dcScatterDot);stroke:#fff;stroke-width:2;filter:drop-shadow(0 5px 7px rgba(22,119,255,.24));transition:opacity .16s}.dc-scatter-dot:hover{opacity:.72}.dc-scatter-name{fill:#344054;font-size:9px;font-weight:600;text-anchor:middle}.dc-scatter-count{fill:#0958d9;font-size:9px;font-weight:700;text-anchor:middle}.dc-risk-overview-layout{display:grid;grid-template-columns:minmax(340px,.82fr) minmax(0,1.45fr);gap:14px;align-items:stretch}.dc-risk-overview-data{display:flex;min-width:0;flex-direction:column;gap:12px}.dc-risk-overview-data .dc-pro-insight{margin:0}.dc-risk-overview-metrics{display:grid;flex:1;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dc-risk-overview-metrics .dc-hr-metric{grid-column:auto;min-width:0;min-height:126px;padding:16px}.dc-risk-overview-metrics .value{font-size:31px}.dc-risk-feed{min-width:0;overflow:hidden}.dc-risk-feed-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px}.dc-risk-feed-title{display:flex;align-items:center;gap:8px;color:#16365f;font-size:15px;font-weight:700}.dc-risk-feed-live{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;background:#ecfdf3;color:#067647;font-size:11px;font-weight:500}.dc-risk-feed-live:before{content:'';width:6px;height:6px;border-radius:50%;background:#12b76a;box-shadow:0 0 0 4px rgba(18,183,106,.12)}.dc-risk-feed-note{color:#98a2b3;font-size:11px}.dc-risk-feed-columns,.dc-risk-feed-item{display:grid;grid-template-columns:48px 58px 78px 82px minmax(100px,1fr) 60px;gap:8px;align-items:center}.dc-risk-feed-columns{margin:0 16px;padding:0 12px 8px;border-bottom:1px solid #e7edf5;color:#98a2b3;font-size:11px}.dc-risk-feed-columns span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-columns span:last-child{text-align:right}.dc-risk-feed-window{height:286px;overflow:hidden;padding:8px 16px 14px;mask-image:linear-gradient(180deg,transparent,#000 7%,#000 93%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 7%,#000 93%,transparent)}.dc-risk-feed-track{animation:dcRiskFeedLoop 42s linear infinite}.dc-risk-feed-window:hover .dc-risk-feed-track{animation-play-state:paused}.dc-risk-feed-group{display:flex;flex-direction:column;gap:8px;padding-bottom:8px}.dc-risk-feed-item{min-height:42px;padding:8px 12px;border:1px solid #e5edf7;border-radius:9px;background:linear-gradient(135deg,#f8fbff,#fff);color:#475467;font-size:12px;box-shadow:0 3px 10px rgba(16,42,86,.04)}.dc-risk-feed-time{color:#98a2b3}.dc-risk-feed-person{overflow:hidden;color:#475467;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-server{overflow:hidden;padding:2px 7px;border-radius:999px;background:#f0ecff;color:#514477;text-align:center;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-role{overflow:hidden;color:#16365f;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-type{overflow:hidden;color:#b54708;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-amount{overflow:hidden;color:#0958d9;font-weight:700;text-align:right;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-amount:before{content:'¥';color:#98a2b3;font-weight:400}@keyframes dcRiskFeedLoop{from{transform:translateY(0)}to{transform:translateY(-50%)}}@media(prefers-reduced-motion:reduce){.dc-risk-feed-track{animation:none}}", ".dc-ban-word-cloud{display:block;position:relative;width:100%;height:288px;min-height:288px;padding:0;background:#fff}.dc-ban-word-cloud canvas{display:block}.dc-ban-word-cloud-fallback{display:grid;height:100%;place-items:center;color:#98a2b3;font-size:12px}", ".dc-risk-config-mask{position:fixed;inset:0;z-index:13000;background:rgba(15,23,42,.32)}.dc-risk-config{position:fixed;top:0;right:0;bottom:0;z-index:13010;display:flex;flex-direction:column;width:min(720px,100vw);background:#fff;box-shadow:-12px 0 32px rgba(15,23,42,.18)}.dc-risk-config-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e4e7ec}.dc-risk-config-head h2{margin:0;font-size:17px;color:#16365f}.dc-risk-config-close{width:30px;height:30px;border:0;background:transparent;color:#98a2b3;font-size:22px;cursor:pointer}.dc-risk-config-body{flex:1;overflow:auto;padding:16px 20px}.dc-risk-config-block{margin-bottom:18px}.dc-risk-config-block h3{margin:0 0 10px;font-size:14px;color:#344054}.dc-risk-path{display:flex;flex-direction:column;gap:8px}.dc-risk-path-row{padding:10px 12px;border:1px solid #e4e7ec;border-radius:8px;background:#f9fafb;font-size:12px;color:#475467}.dc-risk-path-row strong{display:inline-block;min-width:48px;color:#16365f}.dc-risk-rule-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.dc-risk-rule-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid #d6e4f4;border-radius:999px;background:#f5f9ff;color:#175cd3;font-size:12px}.dc-risk-rule-item{background:#fff7e6;border-color:#fadc9e;color:#b54708}.dc-risk-rule-x{border:0;background:transparent;color:#98a2b3;cursor:pointer;font-size:14px;line-height:1}.dc-risk-rule-add{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:#475467}.dc-risk-rule-add input,.dc-risk-rule-add select{height:30px;padding:0 8px;border:1px solid #d0d5dd;border-radius:6px;font-size:12px}.dc-risk-rule-add input[type=number]{width:90px}.dc-risk-config-note{color:#98a2b3;font-size:12px}.dc-risk-config-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px;border-top:1px solid #e4e7ec;background:#f9fafb}.dc-risk-config-error{padding:12px;border:1px solid #ffccc7;border-radius:8px;background:#fff1f0;color:#cf1322;font-size:13px}.dc-risk-config-loading{padding:12px;color:#667085;font-size:13px}", ".dc-risk-engine-grid{display:grid;gap:10px}.dc-risk-engine-item{padding:10px 12px;border:1px solid #e4e7ec;border-radius:8px;background:#f9fafb}.dc-risk-engine-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}.dc-risk-engine-head strong{color:#16365f;font-size:13px}.dc-risk-engine-level{padding:1px 7px;border-radius:999px;background:#eef4ff;color:#175cd3;font-size:11px}.dc-risk-engine-line{margin-top:4px;color:#475467;font-size:12px;line-height:1.6}.dc-risk-engine-guard{color:#b54708}", ".dc-risk-feed-columns,.dc-risk-feed-item{grid-template-columns:78px 58px 78px 82px minmax(120px,1.2fr) minmax(100px,1fr) 72px!important}.dc-risk-feed-amount:before{content:none!important}.dc-risk-feed-roleid{overflow:hidden;color:#475467;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-time,.dc-risk-feed-amount{white-space:nowrap!important}@media(max-width:1100px){.dc-risk-feed-columns,.dc-risk-feed-item{grid-template-columns:72px 66px 86px 96px minmax(120px,1fr) minmax(86px,.9fr) 62px!important}}", ".dc-risk-overview-layout{display:grid;grid-template-columns:minmax(340px,.82fr) minmax(0,1.45fr);gap:14px;align-items:stretch}.dc-risk-overview-data{display:flex;min-width:0;flex-direction:column;gap:12px}.dc-risk-overview-data .dc-pro-insight{margin:0}.dc-risk-overview-metrics{display:grid;flex:1;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dc-risk-overview-metrics .dc-hr-metric{grid-column:auto;min-width:0;min-height:126px;padding:16px}.dc-risk-overview-metrics .value{font-size:31px}.dc-risk-feed{min-width:0;overflow:hidden}.dc-risk-feed-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px}.dc-risk-feed-title{display:flex;align-items:center;gap:8px;color:#16365f;font-size:15px;font-weight:700}.dc-risk-feed-live{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;background:#ecfdf3;color:#067647;font-size:11px;font-weight:500}.dc-risk-feed-live:before{content:'';width:6px;height:6px;border-radius:50%;background:#12b76a;box-shadow:0 0 0 4px rgba(18,183,106,.12)}.dc-risk-feed-note{color:#98a2b3;font-size:11px}.dc-risk-feed-columns,.dc-risk-feed-item{display:grid;grid-template-columns:48px 58px 78px 82px minmax(100px,1fr) 60px;gap:8px;align-items:center}.dc-risk-feed-columns{margin:0 16px;padding:0 12px 8px;border-bottom:1px solid #e7edf5;color:#98a2b3;font-size:11px}.dc-risk-feed-columns span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-columns span:last-child{text-align:right}.dc-risk-feed-window{height:286px;overflow:hidden;padding:8px 16px 14px;mask-image:linear-gradient(180deg,transparent,#000 7%,#000 93%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 7%,#000 93%,transparent)}.dc-risk-feed-track{animation:dcRiskFeedLoop 42s linear infinite}.dc-risk-feed-window:hover .dc-risk-feed-track{animation-play-state:paused}.dc-risk-feed-group{display:flex;flex-direction:column;gap:8px;padding-bottom:8px}.dc-risk-feed-item{min-height:42px;padding:8px 12px;border:1px solid #e5edf7;border-radius:9px;background:linear-gradient(135deg,#f8fbff,#fff);color:#475467;font-size:12px;box-shadow:0 3px 10px rgba(16,42,86,.04)}.dc-risk-feed-time{color:#98a2b3}.dc-risk-feed-person{overflow:hidden;color:#475467;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-server{overflow:hidden;padding:2px 7px;border-radius:999px;background:#f0ecff;color:#514477;text-align:center;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-role{overflow:hidden;color:#16365f;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-type{overflow:hidden;color:#b54708;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-amount{overflow:hidden;color:#0958d9;font-weight:700;text-align:right;text-overflow:ellipsis;white-space:nowrap}.dc-risk-feed-amount:before{content:'¥';color:#98a2b3;font-weight:400}@keyframes dcRiskFeedLoop{from{transform:translateY(0)}to{transform:translateY(-50%)}}@media(prefers-reduced-motion:reduce){.dc-risk-feed-track{animation:none}}", ".dc-risk-queue{margin-bottom:16px;overflow:hidden}.dc-risk-queue-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px 20px;border-bottom:1px solid #e4e7ec;background:linear-gradient(110deg,#071b3a,#0d4b87);color:#fff}.dc-risk-queue-title{display:flex;align-items:center;gap:9px;font-size:17px;font-weight:700}.dc-risk-queue-title span{padding:3px 8px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(255,255,255,.12);font-size:11px;font-weight:500}.dc-risk-queue-sub{margin-top:6px;color:#cfe5ff;font-size:12px}.dc-risk-queue-summary{display:flex;gap:18px}.dc-risk-queue-summary strong{display:block;font-size:22px;line-height:1}.dc-risk-queue-summary span{display:block;margin-top:5px;color:#cfe5ff;font-size:11px}.dc-risk-queue-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#f8fbff}.dc-risk-queue-filters{display:flex;gap:7px}.dc-risk-queue-filters button{height:30px;padding:0 12px;border:1px solid #d6e0ed;border-radius:7px;background:#fff;color:#475467;font-size:12px;cursor:pointer}.dc-risk-queue-filters button.is-active{border-color:#1677ff;background:#eaf3ff;color:#0958d9;font-weight:700}.dc-risk-queue-rule{color:#667085;font-size:11px}.dc-risk-case-list{display:flex;flex-direction:column}.dc-risk-case{display:grid;grid-template-columns:88px minmax(180px,1.25fr) minmax(230px,1.8fr) 110px 118px 34px;gap:14px;align-items:center;width:100%;padding:14px 18px;border:0;border-top:1px solid #edf1f6;background:#fff;color:#344054;text-align:left;cursor:pointer;transition:background .15s}.dc-risk-case:first-child{border-top:0}.dc-risk-case:hover,.dc-risk-case.is-active{background:#f5f9ff}.dc-risk-case-rank{display:flex;align-items:center;gap:7px}.dc-risk-case-stars{color:#fa8c16;font-size:14px;letter-spacing:-2px}.dc-risk-case-level{color:#b54708;font-size:11px;font-weight:700}.dc-risk-case-role strong{display:block;overflow:hidden;color:#16365f;text-overflow:ellipsis;white-space:nowrap}.dc-risk-case-role span{display:block;margin-top:4px;overflow:hidden;color:#98a2b3;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.dc-risk-case-signals{display:flex;flex-wrap:wrap;gap:5px}.dc-risk-signal{padding:3px 7px;border-radius:999px;background:#eef4ff;color:#175cd3;font-size:11px}.dc-risk-case-meta strong{display:block;color:#344054;font-size:12px}.dc-risk-case-meta span{display:block;margin-top:4px;color:#98a2b3;font-size:11px}.dc-risk-status{display:inline-flex;justify-content:center;padding:5px 8px;border-radius:999px;background:#fff7e6;color:#b54708;font-size:11px;font-weight:700}.dc-risk-status.is-track{background:#fff1f0;color:#cf1322}.dc-risk-status.is-observe{background:#f2f4f7;color:#475467}.dc-risk-case-arrow{color:#98a2b3;font-size:18px;text-align:right}.dc-risk-case-detail{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(240px,.9fr);gap:18px;padding:18px 20px;border-top:1px solid #d6e4f4;background:#f8fbff}.dc-risk-evidence-title{display:flex;align-items:center;justify-content:space-between;color:#16365f;font-size:13px;font-weight:700}.dc-risk-evidence-title span{color:#667085;font-size:11px;font-weight:500}.dc-risk-evidence-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.dc-risk-evidence-item{padding:9px 11px;border:1px solid #dfe8f3;border-radius:8px;background:#fff;color:#475467;font-size:12px}.dc-risk-case-action{padding:14px;border:1px solid #91caff;border-radius:9px;background:#eaf3ff}.dc-risk-case-action span{display:block;color:#667085;font-size:11px}.dc-risk-case-action strong{display:block;margin-top:6px;color:#102a56;font-size:14px}.dc-risk-case-action em{display:block;margin-top:8px;color:#667085;font-size:11px;font-style:normal}.dc-risk-demo-note{color:#b54708;font-size:11px}.dc-risk-case-empty{padding:42px;color:#98a2b3;text-align:center}@media(max-width:980px){.dc-risk-case{grid-template-columns:80px minmax(150px,1fr) minmax(180px,1.5fr) 96px 100px 28px}.dc-risk-case-detail{grid-template-columns:1fr}}@media(max-width:720px){.dc-risk-queue-head{flex-direction:column}.dc-risk-queue-toolbar{align-items:flex-start;flex-direction:column}.dc-risk-case{grid-template-columns:72px 1fr 28px}.dc-risk-case-signals,.dc-risk-case-meta,.dc-risk-status{display:none}.dc-risk-evidence-list{grid-template-columns:1fr}}.dc-risk-evidence-item.is-jump{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;width:100%;border-color:#bcd7ff;background:#f6fbff;color:#175cd3;font:inherit;font-size:12px;line-height:1.5;text-align:left;cursor:pointer}.dc-risk-evidence-item.is-jump:hover{border-color:#1677ff;background:#eaf3ff}.dc-risk-evidence-jump{flex:0 0 auto;color:#1677ff;font-size:11px;white-space:nowrap}", "#" + TOP_ID + "{height:54px;line-height:54px;color:rgba(255,255,255,.65);cursor:pointer}#" + TOP_ID + ".ant-menu-item-selected{color:#fff;background:#1677ff}#" + MENU_ID + "{min-height:40px;line-height:40px;cursor:pointer}#" + MENU_ID + " .ant-menu-title-content{margin-inline-start:10px}", ".dc-risk-original-menu-hidden{display:none!important}.dc-hero-risk-nav{min-height:40px;line-height:40px;cursor:pointer}.dc-hero-risk-nav .dc-risk-nav-icon{display:inline-flex;width:18px;justify-content:center;color:#667085}.dc-hero-risk-nav .ant-menu-title-content{margin-inline-start:10px}", "body.dc-module-transition-leave aside.ant-layout-sider,body.dc-module-transition-leave main.ant-layout-content{opacity:0;transform:translateY(3px);pointer-events:none}aside.ant-layout-sider,main.ant-layout-content{transition:opacity .14s ease,transform .14s ease}body.dc-module-transition-enter aside.ant-layout-sider,body.dc-module-transition-enter main.ant-layout-content{animation:dcModuleTransitionEnter .16s ease both}@keyframes dcModuleTransitionEnter{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){aside.ant-layout-sider,main.ant-layout-content{transition:none!important}body.dc-module-transition-enter aside.ant-layout-sider,body.dc-module-transition-enter main.ant-layout-content{animation:none!important}}", ".dc-hr-head{margin:-24px -24px 0;padding:22px 26px 18px;border-bottom:1px solid #dfe7f2;background:#fff;color:#12213a}.dc-hr-head:after{display:none}.dc-hr-title h1{font-size:22px}.dc-hr-badge{border-color:#91caff;background:#e6f4ff;color:#0958d9}.dc-hr-sub{color:#667085}.dc-hr-project{color:#475467}.dc-hr-btn{border-color:#1677ff;background:#1677ff;color:#fff;box-shadow:none}", ".dc-pro-notice{margin:0 -24px 14px;padding:10px 26px;border-bottom:1px solid #c6dbf5;background:#eaf3ff;color:#203c64;font-size:13px;font-weight:600}.dc-pro-filter{display:flex;align-items:flex-end;gap:12px;margin-bottom:14px;padding:14px 16px;border:1px solid #e4e7ec;background:#fff}.dc-pro-filter>label{display:flex;flex-direction:column;gap:6px;color:#475467;font-size:12px}.dc-pro-filter>label>select{min-width:150px;height:34px;padding:0 10px;border:1px solid #d0d5dd;border-radius:6px;background:#fff;color:#344054}.dc-pro-filter-state{margin-left:auto;padding-bottom:8px;color:#667085;font-size:12px}.dc-period-field{display:flex;flex-direction:column;gap:6px;color:#475467;font-size:12px}.dc-period-picker{position:relative;display:inline-flex;align-items:center;height:34px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;transition:border-color .2s,box-shadow .2s}.dc-period-picker:hover{border-color:#4096ff}.dc-period-picker:focus-within{border-color:#1677ff;box-shadow:0 0 0 2px rgba(5,145,255,.1)}.dc-period-picker:after{content:'▣';position:absolute;right:10px;color:#8c8c8c;font-size:12px;pointer-events:none}.dc-period-picker select{width:100%;min-width:224px;height:32px;padding:0 34px 0 11px;border:0;outline:0;background:transparent;color:#262626;font-size:14px;appearance:none;cursor:pointer}.dc-funnel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.dc-funnel-head .dc-funnel-title{margin:5px 0 0}.dc-funnel-head .dc-period-field{flex:none}.dc-funnel-head .dc-period-picker select{min-width:196px}", ".dc-pro-section{margin:14px 0}.dc-pro-section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:9px 13px;border-left:4px solid #1677ff;background:#eaf3ff;color:#16365f;font-size:14px;font-weight:700}.dc-pro-section-title small{color:#667085;font-weight:400}.dc-pro-insight{margin-bottom:12px;padding:12px 14px;border:1px solid #d6e4f5;background:#fff;color:#344054;font-size:13px;line-height:22px}.dc-pro-insight strong{color:#0b63ce}.dc-pro-table-wrap{overflow:auto;border:1px solid #dfe5ed;background:#fff}.dc-pro-table{width:100%;border-collapse:collapse;font-size:12px}.dc-pro-table th{padding:10px;border-right:1px solid #dfe5ed;border-bottom:1px solid #cad7e6;background:#eaf3ff;color:#344054;text-align:center}.dc-pro-table td{padding:9px 10px;border-right:1px solid #edf0f4;border-bottom:1px solid #edf0f4;color:#475467}.dc-pro-table td.num{text-align:right;font-weight:600}.dc-pro-cellbar{position:relative;height:22px;min-width:150px;background:#f2f4f7}.dc-pro-cellbar i{display:block;height:100%;background:linear-gradient(90deg,#32d583,#12b76a)}.dc-pro-cellbar span{position:absolute;inset:0 6px;display:flex;align-items:center;justify-content:flex-end;color:#16331f;font-style:normal;font-weight:600}.dc-pro-source{display:inline-flex;align-items:center;gap:6px;color:#067647}.dc-pro-source:before{content:'';width:7px;height:7px;border-radius:50%;background:#12b76a}.dc-dict{padding:24px;background:#f5f7fa}.dc-dict h1{margin:0 0 6px}.dc-dict-sub{margin:0 0 18px;color:#667085}.dc-dict-card{margin-bottom:16px;padding:18px;border:1px solid #e4e7ec;border-radius:8px;background:#fff}.dc-dict-card h2{margin:0 0 14px;font-size:16px}", ".dc-funnel-card{min-height:320px;padding:16px 18px 18px;border:1px solid #dfe5ed;border-radius:10px;background:#fff}.dc-funnel-title{margin:0 0 14px;color:#16365f;font-size:16px}.dc-chart-tools{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:-2px 0 16px}.dc-chart-modes{display:inline-flex;flex-wrap:wrap;padding:3px;border:1px solid #d9e2ee;border-radius:8px;background:#f4f7fb}.dc-chart-modes button{height:28px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:#667085;font-size:12px;cursor:pointer}.dc-chart-modes button:hover{color:#0958d9}.dc-chart-modes button.is-active{background:#fff;color:#0958d9;font-weight:700;box-shadow:0 1px 4px rgba(16,42,86,.12)}.dc-rank-list{display:flex;flex-direction:column;gap:8px}.dc-rank-row{position:relative;width:100%;padding:10px 11px 9px;border:1px solid transparent;border-radius:9px;background:#f8fafc;color:#344054;text-align:left;cursor:pointer;transition:border-color .16s,background .16s,box-shadow .16s,transform .16s}.dc-rank-row:hover,.dc-rank-row:focus{border-color:#91caff;background:#f0f7ff;box-shadow:0 4px 12px rgba(22,119,255,.08);outline:none;transform:translateY(-1px)}.dc-rank-row.is-active{border-color:#69b1ff;background:#eaf3ff;box-shadow:0 0 0 2px rgba(22,119,255,.08)}.dc-rank-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.dc-rank-name{display:flex;min-width:0;align-items:center;gap:8px;font-size:12px;font-weight:600}.dc-rank-name i{display:grid;flex:none;width:20px;height:20px;place-items:center;border-radius:6px;background:#e8eef7;color:#667085;font-size:11px;font-style:normal}.dc-rank-row:nth-child(1) .dc-rank-name i{background:#fff1b8;color:#ad6800}.dc-rank-row:nth-child(2) .dc-rank-name i{background:#eef2f6;color:#475467}.dc-rank-row:nth-child(3) .dc-rank-name i{background:#ffe7ba;color:#ad4e00}.dc-rank-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dc-rank-value{flex:none;color:#102a56;font-size:15px}.dc-rank-track{display:block;height:9px;overflow:hidden;border-radius:99px;background:#e8eef5}.dc-rank-fill{display:block;width:var(--bar);height:100%;min-width:5px;border-radius:99px;background:linear-gradient(90deg,#36cfc9,#1677ff);box-shadow:0 2px 7px rgba(22,119,255,.18)}.dc-rank-row.is-active .dc-rank-fill{background:linear-gradient(90deg,#1677ff,#0958d9)}.dc-rank-share{display:block;margin-top:5px;color:#98a2b3;font-size:11px;text-align:right}.dc-funnel-hint{margin-top:12px;color:#98a2b3;font-size:11px;text-align:right}.dc-radar-wrap{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(126px,.92fr);gap:10px;align-items:center;min-height:300px}.dc-radar{width:100%;height:auto;overflow:visible}.dc-radar-grid{fill:#f7fbff;stroke:#c8d9ed;stroke-width:1}.dc-radar-spoke{stroke:#d6e2f0;stroke-width:1}.dc-radar-area{fill:rgba(22,119,255,.22);stroke:#1677ff;stroke-width:2}.dc-radar-dot{fill:#fff;stroke:#0958d9;stroke-width:3}.dc-chart-legend{display:flex;flex-direction:column;gap:7px}.dc-chart-legend button{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;padding:8px;border:1px solid transparent;border-radius:8px;background:#f8fafc;color:#475467;text-align:left;cursor:pointer}.dc-chart-legend button:hover{border-color:#91caff;background:#f0f7ff}.dc-chart-legend button.is-active{border-color:#69b1ff;background:#eaf3ff}.dc-chart-legend i{width:9px;height:9px;border-radius:3px;background:var(--chart-color)}.dc-chart-legend span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.dc-chart-legend strong{color:#102a56;font-size:12px}.dc-donut-wrap{display:grid;grid-template-columns:170px minmax(0,1fr);gap:18px;align-items:center;min-height:300px}.dc-donut{position:relative;width:164px;height:164px;margin:auto;border-radius:50%;background:var(--donut);box-shadow:inset 0 0 0 1px rgba(16,42,86,.06),0 12px 28px rgba(16,42,86,.1)}.dc-donut:after{content:'';position:absolute;inset:38px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px #e6edf5}.dc-donut-center{position:absolute;z-index:1;inset:0;display:grid;place-content:center;text-align:center;color:#667085;font-size:11px}.dc-donut-center strong{display:block;color:#102a56;font-size:26px;line-height:1.1}.dc-donut-center span{margin-top:3px}.dc-donut-wrap .dc-chart-legend{max-height:274px;overflow:auto}.dc-donut-wrap .dc-chart-legend button{padding:7px 8px}.dc-pareto{width:100%;min-height:286px}.dc-pareto-grid{stroke:#e7edf5;stroke-width:1}.dc-pareto-bar{stroke:#fff;stroke-width:2;cursor:pointer;transition:opacity .15s}.dc-pareto-bar:hover{opacity:.78}.dc-pareto-line{fill:none;stroke:#ff7a45;stroke-width:3}.dc-pareto-point{fill:#fff;stroke:#ff7a45;stroke-width:2}.dc-pareto-value{fill:#344054;font-size:10px;font-weight:700;text-anchor:middle}.dc-pareto-percent{fill:#c2410c;font-size:9px;text-anchor:middle}.dc-pareto-label{fill:#667085;font-size:9px;text-anchor:middle}.dc-tree{display:grid;grid-template-columns:minmax(0,1fr);height:292px;overflow:hidden;border:3px solid #fff;border-radius:12px;background:#eef4fb}.dc-tree-cell{position:absolute;display:flex;min-width:0;flex-direction:column;justify-content:flex-end;padding:11px;border:3px solid #fff;color:#fff;text-align:left;cursor:pointer;overflow:hidden;transition:filter .16s,transform .16s}.dc-tree-cell:hover{z-index:2;filter:brightness(1.08)}.dc-tree-cell.is-active{box-shadow:inset 0 0 0 3px #102a56}.dc-tree-cell strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;text-shadow:0 1px 2px rgba(0,0,0,.18)}.dc-tree-cell span{margin-top:3px;font-size:18px;font-weight:800}.dc-tree-cell em{font-size:10px;font-style:normal;opacity:.88}.dc-tree-canvas{position:relative;width:100%;height:100%}", ".dc-period-picker.dc-range-picker{display:grid;grid-template-columns:1fr 24px 1fr 22px;min-width:270px;height:34px;padding:0 7px}.dc-range-date{align-self:center;overflow:hidden;color:#344054;font-size:12px;text-align:center;white-space:nowrap}.dc-range-swap{align-self:center;color:#98a2b3;text-align:center}.dc-range-calendar{align-self:center;color:#8c8c8c;text-align:right}.dc-range-picker select{position:absolute;inset:0;z-index:2;min-width:0!important;height:100%!important;opacity:0;cursor:pointer}.dc-funnel-head .dc-range-picker{min-width:244px}.dc-radar-wrap,.dc-donut-wrap{display:block;min-height:300px}.dc-radar,.dc-donut-svg{display:block;width:100%;height:300px}.dc-radar-link,.dc-donut-link{fill:none;stroke:#98a2b3;stroke-width:1.2}.dc-radar-label-box{fill:#fff;stroke:#d6e4f5;stroke-width:1}.dc-radar-label.is-active .dc-radar-label-box{fill:#eaf3ff;stroke:#1677ff;stroke-width:1.5}.dc-radar-label-name{fill:#344054;font-size:10px;text-anchor:middle}.dc-radar-label-value{fill:#0958d9;font-size:11px;font-weight:700;text-anchor:middle}.dc-donut-track{fill:none;stroke:#edf2f7;stroke-width:28}.dc-donut-segment{fill:none;stroke-width:28;cursor:pointer;transition:opacity .15s}.dc-donut-segment:hover{opacity:.78}.dc-donut-label{cursor:pointer}.dc-donut-label-name{fill:#344054;font-size:10px}.dc-donut-label-value{fill:#667085;font-size:9px}.dc-donut-center-total{fill:#102a56;font-size:25px;font-weight:800;text-anchor:middle}.dc-donut-center-caption{fill:#667085;font-size:10px;text-anchor:middle}.dc-pareto-legend,.dc-tree-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:4px}.dc-pareto-legend button,.dc-tree-legend button{min-width:0;padding:7px 8px}.dc-tree{height:250px}.dc-tree-cell.is-compact{align-items:center;justify-content:center;padding:4px}.dc-tree-cell.is-compact strong,.dc-tree-cell.is-compact em{display:none}.dc-tree-cell.is-compact span{margin:0;font-size:11px}.dc-tree-legend{margin-top:8px}.dc-chart-legend span{display:block;min-width:0}", ".dc-period-field{position:relative}.dc-range-picker{cursor:pointer}.dc-range-picker select{display:none}.dc-period-popover{position:absolute;z-index:10030;top:58px;left:0;display:grid;grid-template-columns:110px 1fr;width:640px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;box-shadow:0 10px 34px rgba(15,23,42,.18);overflow:hidden}.dc-funnel-head .dc-period-popover{left:auto;right:0}.dc-period-shortcuts{padding:9px 0;border-right:1px solid #edf0f4;background:#fff}.dc-period-shortcuts button{display:block;width:100%;height:34px;padding:0 18px;border:0;background:transparent;color:#344054;font-size:13px;text-align:left;cursor:pointer}.dc-period-shortcuts button:hover,.dc-period-shortcuts button.is-active{background:#f0f5ff;color:#1677ff}.dc-calendar-panel{padding:12px 16px 15px}.dc-calendar-nav{display:grid;grid-template-columns:32px 32px 1fr 1fr 32px 32px;align-items:center;margin-bottom:10px}.dc-calendar-nav button{width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:#667085;font-size:17px;cursor:pointer}.dc-calendar-nav button:hover{background:#f2f4f7;color:#1677ff}.dc-calendar-nav strong{text-align:center;color:#344054;font-size:14px}.dc-calendar-months{display:grid;grid-template-columns:1fr 1fr;gap:22px}.dc-calendar-week,.dc-calendar-days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.dc-calendar-week span{height:28px;color:#475467;font-size:12px;text-align:center;line-height:28px}.dc-calendar-day{height:30px;border:0;border-radius:6px;background:transparent;color:#344054;font-size:12px;cursor:pointer}.dc-calendar-day:hover{background:#e6f4ff}.dc-calendar-day.is-muted{color:#c5c9d0}.dc-calendar-day.is-range{border-radius:0;background:#e6f4ff}.dc-calendar-day.is-edge{border-radius:6px;background:#1677ff;color:#fff}.dc-calendar-day.is-today{font-weight:800}.dc-rose{display:block;width:100%;height:314px}.dc-rose-grid{fill:none;stroke:#dbe4ef;stroke-width:1;stroke-dasharray:3 3}.dc-rose-axis{stroke:#ccd8e7;stroke-width:1}.dc-rose-sector{cursor:pointer;stroke:#fff;stroke-width:3;transition:filter .16s,transform .16s;transform-origin:210px 226px}.dc-rose-sector:hover,.dc-rose-sector.is-active{filter:brightness(1.08);transform:scale(1.025)}.dc-rose-label{fill:#344054;font-size:10px;text-anchor:middle}.dc-rose-value{fill:#102a56;font-size:10px;font-weight:800;text-anchor:middle}.dc-rose-caption{fill:#98a2b3;font-size:10px;text-anchor:middle}@media(max-width:760px){.dc-period-popover{width:min(640px,calc(100vw - 48px));grid-template-columns:92px 1fr}.dc-calendar-months{grid-template-columns:1fr}.dc-calendar-month:nth-child(2){display:none}}", ".dc-funnel-head .dc-period-popover{right:-380px}@media(max-width:760px){.dc-funnel-head .dc-period-popover{right:auto;left:0}}", ".dc-analysis-pair{display:grid;grid-template-columns:minmax(340px,.82fr) minmax(0,1.35fr);gap:14px;align-items:stretch}.dc-analysis-pair .dc-funnel-card{min-height:430px}.dc-inline-detail{display:flex;min-width:0;min-height:430px;flex-direction:column;overflow:hidden;border:1px solid #dfe5ed;border-radius:10px;background:#fff}.dc-inline-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 16px 12px;border-bottom:1px solid #e4e7ec}.dc-inline-detail-head strong{display:block;color:#16365f;font-size:15px}.dc-inline-detail-head span{display:block;margin-top:4px;color:#98a2b3;font-size:11px}.dc-inline-detail-count{flex:none;color:#475467!important;text-align:right}.dc-inline-detail-scroll{flex:1;overflow:auto}.dc-inline-detail .dc-pro-table{min-width:980px}.dc-inline-detail .dc-pro-table th{position:sticky;top:0;z-index:1;white-space:nowrap}.dc-inline-detail .dc-pro-table td{max-width:220px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.dc-inline-empty{padding:44px!important;text-align:center;color:#98a2b3!important}", ".dc-detail-overlay{position:fixed;z-index:10050;inset:0;display:grid;place-items:center;padding:14px;background:rgba(15,23,42,.52)}.dc-detail-modal{display:flex;flex-direction:column;width:min(1180px,calc(100vw - 28px));height:min(790px,calc(100vh - 28px));overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 24px 80px rgba(15,23,42,.28)}.dc-detail-head{display:flex;align-items:center;justify-content:space-between;padding:18px 24px 12px}.dc-detail-head h2{margin:0;color:#1f2937;font-size:19px}.dc-detail-close{width:34px;height:34px;border:0;background:transparent;color:#475467;font-size:28px;line-height:1;cursor:pointer}.dc-detail-context{display:flex;align-items:center;gap:8px;padding:0 24px 12px;color:#667085;font-size:12px}.dc-detail-context strong{color:#ff4d4f}.dc-detail-search{margin:0 24px 16px}.dc-detail-search input{width:100%;height:34px;padding:0 12px;border:1px solid #cfd8e3;border-radius:6px}.dc-detail-scroll{flex:1;overflow:auto;margin:0 24px 18px;border:1px solid #dfe5ed}.dc-detail-table{min-width:1150px}.dc-detail-table th{position:sticky;top:0;z-index:1;height:62px;background:#fff;font-weight:500}.dc-detail-table td{height:34px;max-width:250px;padding:6px 9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dc-detail-table .dc-row-no{width:38px;color:#98a2b3;text-align:center}.dc-detail-pill{display:inline-flex;padding:2px 8px;border-radius:999px;background:#fff1c7;color:#6b4f00}.dc-detail-person{display:inline-flex;padding:2px 8px;border-radius:999px;background:#dff5ff;color:#245b70}.dc-detail-server{display:inline-flex;padding:2px 8px;border-radius:999px;background:#f0ecff;color:#514477}.dc-detail-empty{padding:48px!important;text-align:center;color:#98a2b3}.dc-detail-summary{margin-left:auto;color:#475467}", "@media(max-width:1100px){.dc-hr-metric{grid-column:span 6}.dc-hr-chart,.dc-hr-trend{grid-column:span 12}.dc-hr-flow{grid-template-columns:1fr}.dc-hr-arrow{transform:rotate(90deg)}.dc-risk-signal-grid,.dc-risk-overview-layout,.dc-analysis-pair{grid-template-columns:1fr}.dc-risk-overview-metrics .dc-hr-metric{grid-column:auto}.dc-risk-feed-columns,.dc-risk-feed-item{grid-template-columns:68px 82px 100px 110px minmax(180px,1fr) 76px}.dc-risk-feed-window{height:238px}.dc-funnel-card,.dc-analysis-pair .dc-funnel-card{min-height:auto}.dc-funnel-head{align-items:stretch;flex-direction:column}.dc-funnel-head .dc-period-picker select{min-width:100%}}@media(max-width:640px){.dc-risk-overview-metrics{grid-template-columns:1fr}.dc-risk-overview-metrics .dc-hr-metric{min-height:auto}.dc-chart-tools{align-items:stretch;flex-direction:column}.dc-chart-modes{width:100%}.dc-chart-modes button{flex:1}.dc-radar-wrap,.dc-donut-wrap{grid-template-columns:1fr}.dc-donut-wrap{gap:14px}}"].join("");
    document.head.appendChild(style);
  }
  function number(value) {
    return new Intl.NumberFormat("zh-CN").format(value);
  }
  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function isRoute() {
    return location.pathname === ROUTE;
  }
  function isRiskRoute() {
    return riskRoutes.indexOf(location.pathname) >= 0;
  }
  function isDictionaryRoute() {
    return location.pathname === "/admin/dictionary";
  }
  function host() {
    return document.querySelector("main.ant-layout-content") || document.querySelector(".ant-layout-content") || document.querySelector("main");
  }
  function bars(rows, status) {
    var max = Math.max.apply(null, rows.map(function (row) {
      return row[1];
    }).concat([1]));
    return '<div class="dc-hr-bars' + (status ? ' dc-hr-status' : '') + '">' + rows.map(function (row) {
      return '<div class="dc-hr-bar-row"><span class="dc-hr-bar-label" title="' + row[0] + '">' + row[0] + '</span><div class="dc-hr-track"><div class="dc-hr-fill" style="width:' + Math.max(3, row[1] / max * 100) + '%"></div></div><span class="dc-hr-bar-value">' + number(row[1]) + '</span></div>';
    }).join("") + '</div>';
  }
  function trendMarkup() {
    var rows = trendData.length ? trendData : [[dateRanges.overview[0].slice(5).replace("-", "/"), 0]];
    var values = rows.map(function (row) {
      return row[1];
    });
    var labels = rows.map(function (row) {
      return row[0];
    });
    var min = Math.min.apply(null, values.concat([0]));
    var max = Math.max.apply(null, values.concat([1]));
    var points = values.map(function (value, index) {
      return [50 + index * (840 / Math.max(1, values.length - 1)), 146 - (value - min) / Math.max(1, max - min) * 104];
    });
    var pointText = points.map(function (point) {
      return point[0] + ',' + point[1].toFixed(1);
    }).join(' ');
    var area = 'M50 146 L' + points.map(function (point) {
      return point[0] + ' ' + point[1].toFixed(1);
    }).join(' L') + ' L890 146 Z';
    var grid = [42, 76, 111, 146].map(function (y) {
      return '<line class="dc-hr-trend-grid" x1="40" y1="' + y + '" x2="900" y2="' + y + '"></line>';
    }).join('');
    var dots = points.map(function (point, index) {
      return '<circle class="dc-hr-trend-point" cx="' + point[0] + '" cy="' + point[1].toFixed(1) + '" r="5"></circle><text class="dc-hr-trend-value" x="' + point[0] + '" y="' + (point[1] - 12).toFixed(1) + '">' + values[index] + '</text><text class="dc-hr-trend-label" x="' + point[0] + '" y="174">' + labels[index] + '</text>';
    }).join('');
    return '<article class="dc-hr-card dc-hr-trend"><div class="dc-hr-card-head"><h2>所选日期风险记录趋势</h2><span class="dc-hr-legend">真实模型命中记录</span></div><div class="dc-hr-trend-chart"><svg class="dc-hr-trend-svg" viewBox="0 0 940 190" role="img" aria-label="风险记录折线趋势图"><defs><linearGradient id="dcTrendLine" x1="0" x2="1"><stop offset="0" stop-color="#36cfc9"></stop><stop offset="1" stop-color="#1677ff"></stop></linearGradient><linearGradient id="dcTrendArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36cfc9" stop-opacity=".28"></stop><stop offset="1" stop-color="#1677ff" stop-opacity=".03"></stop></linearGradient></defs>' + grid + '<path class="dc-hr-trend-area" d="' + area + '"></path><polyline class="dc-hr-trend-line" points="' + pointText + '"></polyline>' + dots + '</svg></div></article>';
  }
  function riskDetailFeedMarkup() {
    var records = [];
    var seen = {};
    ["yesterday", "week", "month"].forEach(function (period) {
      var source = violationDetails[period] || {};
      Object.keys(source).forEach(function (type) {
        source[type].forEach(function (row) {
          var key = row[0] + '|' + row[5];
          if (seen[key] || records.length >= 24) return;
          seen[key] = true;
          records.push(row);
        });
      });
    });
    var items = records.map(function (row) {
      var amount = row[6];
      var amountText = amount === "" || amount === null || amount === undefined ? '' : '¥' + number(amount);
      return '<div class="dc-risk-feed-item"><span class="dc-risk-feed-time" title="' + escapeHtml(row[0]) + '">' + escapeHtml(String(row[0] || "").slice(5)) + '</span><span class="dc-risk-feed-person">' + escapeHtml(row[1]) + '</span><span class="dc-risk-feed-server">' + escapeHtml(row[3]) + '</span><span class="dc-risk-feed-role">' + escapeHtml(row[4]) + '</span><span class="dc-risk-feed-roleid" title="' + escapeHtml(row[5]) + '">' + escapeHtml(row[5]) + '</span><span class="dc-risk-feed-type" title="' + escapeHtml(row[8]) + '">' + escapeHtml(row[8]) + '</span><span class="dc-risk-feed-amount">' + amountText + '</span></div>';
    }).join('');
    if (!items) items = '<div class="dc-risk-feed-item"><span class="dc-risk-feed-time">--</span><span class="dc-risk-feed-person">系统模型</span><span class="dc-risk-feed-server">--</span><span class="dc-risk-feed-role">--</span><span class="dc-risk-feed-roleid">--</span><span class="dc-risk-feed-type">当前范围暂无风险命中</span><span class="dc-risk-feed-amount"></span></div>';
    return '<article class="dc-hr-card dc-risk-feed"><div class="dc-risk-feed-head"><div class="dc-risk-feed-title">最新风险明细 <span class="dc-risk-feed-live">查询快照</span></div><span class="dc-risk-feed-note">上下滚动 · 悬停暂停</span></div><div class="dc-risk-feed-columns"><span>时间</span><span>评估来源</span><span>区服</span><span>角色名</span><span>角色ID</span><span>违规类型</span><span>充值金额</span></div><div class="dc-risk-feed-window"><div class="dc-risk-feed-track"><div class="dc-risk-feed-group">' + items + '</div><div class="dc-risk-feed-group" aria-hidden="true">' + items + '</div></div></div></article>';
  }
  var CHAT_CONTACT_NEEDLE = /联系方式·(?:手机|QQ|微信):([^（；\s]{2,64})/;
  var CHAT_KEYWORD_NEEDLE = /^(?:敏感词|引导词|账号串):([^（；\s]{2,64})/;
  function chatEvidenceNeedle(evidence) {
    var text = String(evidence || "").trim();
    var match = CHAT_CONTACT_NEEDLE.exec(text) || CHAT_KEYWORD_NEEDLE.exec(text);
    return match ? match[1].trim() : "";
  }
  function chatJumpDates(detectedAt) {
    var dates = [];
    var range = dateRanges.overview || [];
    [String(detectedAt || "").slice(0, 10), range[1], range[0]].forEach(function (value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value || "") && dates.indexOf(value) === -1) dates.push(value);
    });
    return dates.slice(0, 3);
  }
  function markEvidenceJumps(root) {
    var items = root.querySelectorAll(".dc-risk-evidence-item");
    if (!items.length) return;
    var selected = riskCases.filter(function (item) {
      return item.id === selectedRiskCaseId;
    })[0];
    if (!selected || !selectedGameId) return;
    var payload = {
      gameId: String(selectedGameId),
      roleId: String(selected.roleId || ""),
      roleName: String(selected.role || ""),
      dates: chatJumpDates(selected.detectedAt)
    };
    if (!payload.roleId || !payload.dates.length) return;
    Array.prototype.forEach.call(items, function (item) {
      var needle = chatEvidenceNeedle(item.textContent);
      if (!needle) return;
      payload.needle = needle;
      item.classList.add("is-jump");
      item.setAttribute("data-evidence-jump", JSON.stringify(payload));
      item.setAttribute("title", "点击查看聊天风控原文");
      var hint = document.createElement("span");
      hint.className = "dc-risk-evidence-jump";
      hint.textContent = "查看原文 ›";
      item.appendChild(hint);
    });
  }
  function openChatEvidence(item) {
    var payload = null;
    try {
      payload = JSON.parse(item.getAttribute("data-evidence-jump") || "");
    } catch (error) {
      payload = null;
    }
    if (!payload || !payload.roleId || !payload.needle) return;
    try {
      sessionStorage.setItem("dc_chat_jump", JSON.stringify(payload));
    } catch (error) {}
    if (location.pathname !== "/dashboard/chat-risk") history.pushState({}, "", "/dashboard/chat-risk");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  function riskQueueMarkup() {
    var filtered = riskCases.filter(function (item) {
      if (selectedRiskQueueFilter === "high") return item.signals.length >= 4;
      if (selectedRiskQueueFilter === "track") return item.status === "待复核";
      return true;
    });
    if (!filtered.some(function (item) {
      return item.id === selectedRiskCaseId;
    })) {
      selectedRiskCaseId = filtered.length ? filtered[0].id : "";
    }
    var highCount = riskCases.filter(function (item) {
      return item.signals.length >= 4;
    }).length;
    var trackCount = riskCases.filter(function (item) {
      return item.status === "待复核";
    }).length;
    var filters = [["all", "全部案件", riskCases.length], ["high", "四星及以上", highCount], ["track", "待复核", trackCount]].map(function (item) {
      return '<button type="button" class="' + (selectedRiskQueueFilter === item[0] ? 'is-active' : '') + '" data-risk-queue-filter="' + item[0] + '">' + item[1] + ' ' + item[2] + '</button>';
    }).join("");
    var rows = filtered.map(function (item) {
      var level = item.signals.length;
      var statusClass = item.status === "跟踪" ? " is-track" : item.status === "观察" ? " is-observe" : "";
      var signalTags = item.signals.map(function (signal) {
        return '<span class="dc-risk-signal">' + signal + '</span>';
      }).join("");
      return '<button type="button" class="dc-risk-case ' + (selectedRiskCaseId === item.id ? 'is-active' : '') + '" data-risk-case="' + item.id + '"><span class="dc-risk-case-rank"><span class="dc-risk-case-stars">' + '★'.repeat(level) + '</span><span class="dc-risk-case-level">' + level + '星</span></span><span class="dc-risk-case-role"><strong>' + escapeHtml(item.role) + '</strong><span>' + escapeHtml(item.server) + ' · ' + escapeHtml(item.roleId) + '</span></span><span class="dc-risk-case-signals">' + signalTags + '</span><span class="dc-risk-case-meta"><strong>' + item.occurrences + ' 次命中</strong><span>' + item.window + '</span></span><span class="dc-risk-status' + statusClass + '">' + item.status + '</span><span class="dc-risk-case-arrow">›</span></button>';
    }).join("");
    var selected = riskCases.filter(function (item) {
      return item.id === selectedRiskCaseId;
    })[0];
    var detail = "";
    if (selected) {
      detail = '<div class="dc-risk-case-detail"><div><div class="dc-risk-evidence-title"><span>证据明细</span><span>' + escapeHtml(selected.id) + ' · ' + escapeHtml(selected.detectedAt) + '发现 · 巡查人员 ' + escapeHtml(selected.inspector) + '</span></div><div class="dc-risk-evidence-list">' + selected.evidence.map(function (evidence) {
        return '<div class="dc-risk-evidence-item">' + escapeHtml(evidence) + '</div>';
      }).join("") + '</div></div><div class="dc-risk-case-action"><span>当前建议</span><strong>' + escapeHtml(selected.action) + '</strong><em>' + (selected.evidenceClosed ? '证据链已形成闭环，仍需人工复核。' : '证据链尚未闭环，不建议直接采取封禁措施。') + '</em></div></div>';
    }
    return '<article class="dc-hr-card dc-risk-queue"><div class="dc-risk-queue-head"><div><div class="dc-risk-queue-title">即时风险处置队列 <span>真实数据评估</span></div><div class="dc-risk-queue-sub">同一角色ID归并 · 同类信号仅计一次 · 结果待人工复核</div></div><div class="dc-risk-queue-summary"><div><strong>' + highCount + '</strong><span>四类信号</span></div><div><strong>' + trackCount + '</strong><span>触发跟踪提醒</span></div></div></div><div class="dc-risk-queue-toolbar"><div class="dc-risk-queue-filters">' + filters + '</div><div class="dc-risk-queue-rule">聊天/IP/物品/充值四类信号 · <span class="dc-risk-demo-note">暂不联动工单</span></div></div><div class="dc-risk-case-list">' + (rows || '<div class="dc-risk-case-empty">当前筛选条件下没有模型命中案件</div>') + '</div>' + detail + '</article>';
  }
  var sevenDaysAgo = new Date(now.getTime() - 6 * 86400000);
  var sevenDaysText = sevenDaysAgo.getFullYear() + "-" + String(sevenDaysAgo.getMonth() + 1).padStart(2, "0") + "-" + String(sevenDaysAgo.getDate()).padStart(2, "0");
  var rangeShortcuts = [["昨日", "yesterday", yesterdayText, yesterdayText], ["今日", "yesterday", todayText, todayText], ["最近7天", "week", sevenDaysText, todayText]];
  function dateText(date) {
    return date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0");
  }
  function monthCalendarMarkup(kind, year, month, current) {
    var first = new Date(Date.UTC(year, month, 1));
    var start = new Date(first.getTime());
    start.setUTCDate(1 - first.getUTCDay());
    var days = [];
    for (var index = 0; index < 42; index += 1) {
      var day = new Date(start.getTime());
      day.setUTCDate(start.getUTCDate() + index);
      var value = dateText(day);
      var inRange = value >= current[0] && value <= current[1];
      var classes = ["dc-calendar-day"];
      if (day.getUTCMonth() !== month) classes.push("is-muted");
      if (inRange) classes.push("is-range");
      if (value === current[0] || value === current[1]) classes.push("is-edge");
      if (value === todayText) classes.push("is-today");
      days.push('<button type="button" class="' + classes.join(" ") + '" data-range-day="' + value + '" data-kind="' + kind + '">' + day.getUTCDate() + '</button>');
    }
    return '<div class="dc-calendar-month"><div class="dc-calendar-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="dc-calendar-days">' + days.join("") + '</div></div>';
  }
  function periodPopoverMarkup(kind, selected) {
    if (openPeriodPicker !== kind) return "";
    var current = dateRanges[kind];
    var left = new Date(Date.UTC(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1));
    var right = new Date(Date.UTC(left.getUTCFullYear(), left.getUTCMonth() + 1, 1));
    var shortcuts = rangeShortcuts.map(function (item) {
      var active = current[0] === item[2] && current[1] === item[3];
      return '<button type="button" class="' + (active ? 'is-active' : '') + '" data-period-shortcut="' + item[1] + '" data-start="' + item[2] + '" data-end="' + item[3] + '" data-kind="' + kind + '">' + item[0] + '</button>';
    }).join("");
    return '<div class="dc-period-popover" data-period-popover><div class="dc-period-shortcuts">' + shortcuts + '</div><div class="dc-calendar-panel"><div class="dc-calendar-nav"><button type="button" data-calendar-shift="-12">«</button><button type="button" data-calendar-shift="-1">‹</button><strong>' + left.getUTCFullYear() + '年 ' + (left.getUTCMonth() + 1) + '月</strong><strong>' + right.getUTCFullYear() + '年 ' + (right.getUTCMonth() + 1) + '月</strong><button type="button" data-calendar-shift="1">›</button><button type="button" data-calendar-shift="12">»</button></div><div class="dc-calendar-months">' + monthCalendarMarkup(kind, left.getUTCFullYear(), left.getUTCMonth(), current) + monthCalendarMarkup(kind, right.getUTCFullYear(), right.getUTCMonth(), current) + '</div></div></div>';
  }
  function periodPickerMarkup(kind, selected) {
    var current = dateRanges[kind] || [yesterdayText, yesterdayText];
    var aria = kind === "overview" ? "总体统计日期范围" : kind === "violation" ? "违规类型日期范围" : "处理状态日期范围";
    return '<label class="dc-period-field">日期范围<span class="dc-period-picker dc-range-picker" role="button" tabindex="0" data-period-toggle="' + kind + '" aria-label="' + aria + '" aria-expanded="' + (openPeriodPicker === kind) + '"><span class="dc-range-date">' + current[0] + '</span><span class="dc-range-swap">→</span><span class="dc-range-date">' + current[1] + '</span><span class="dc-range-calendar">▣</span></span>' + periodPopoverMarkup(kind, selected) + '</label>';
  }
  function selectedRangeLabel(kind, fallback) {
    var current = dateRanges[kind];
    var match = rangeShortcuts.filter(function (item) {
      return current[0] === item[2] && current[1] === item[3];
    })[0];
    return match ? match[0] : (current[0] === current[1] ? current[0] : current[0] + " 至 " + current[1]) || fallback;
  }
  var chartPalette = ["#1677ff", "#36cfc9", "#faad14", "#ff7a45", "#9254de", "#13c2c2", "#eb2f96", "#52c41a", "#597ef7"];
  function chartModeMarkup(kind, selected) {
    var labels = {
      rank: "排行",
      pareto: "帕累托",
      radar: "雷达",
      donut: "环形",
      treemap: "矩形树图"
    };
    return '<div class="dc-chart-modes" role="group" aria-label="图表样式">' + Object.keys(labels).map(function (mode) {
      return '<button type="button" class="' + (mode === selected ? 'is-active' : '') + '" data-' + kind + '-chart="' + mode + '" aria-pressed="' + (mode === selected) + '">' + labels[mode] + '</button>';
    }).join("") + '</div>';
  }
  function chartAction(kind, period, label) {
    return 'data-' + kind + '-open data-period="' + period + '" data-' + kind + '="' + escapeHtml(label) + '"';
  }
  function chartLegendMarkup(kind, period, rows, selected, total, extraClass) {
    return '<div class="dc-chart-legend' + (extraClass ? ' ' + extraClass : '') + '">' + rows.map(function (row, index) {
      var share = total ? row[1] / total * 100 : 0;
      return '<button type="button" class="' + (row[0] === selected ? 'is-active' : '') + '" style="--chart-color:' + chartPalette[index % chartPalette.length] + '" ' + chartAction(kind, period, row[0]) + ' title="' + escapeHtml(row[0]) + '，' + number(row[1]) + ' 次，占命中 ' + share.toFixed(1) + '%"><i></i><span>' + escapeHtml(row[0]) + '</span><strong>' + number(row[1]) + '</strong></button>';
    }).join("") + '</div>';
  }
  function rankChartMarkup(kind, period, rows, selected, baseRows) {
    var max = Math.max.apply(null, rows.map(function (row) {
      return row[1];
    }).concat([1]));
    return '<div class="dc-rank-list">' + rows.map(function (row, index) {
      var width = Math.max(3, row[1] / max * 100);
      var share = baseRows ? row[1] / baseRows * 100 : 0;
      return '<button type="button" class="dc-rank-row' + (row[0] === selected ? ' is-active' : '') + '" style="--bar:' + width.toFixed(1) + '%" ' + chartAction(kind, period, row[0]) + '><span class="dc-rank-meta"><span class="dc-rank-name"><i>' + (index + 1) + '</i><span class="dc-rank-label" title="' + escapeHtml(row[0]) + '">' + escapeHtml(row[0]) + '</span></span><strong class="dc-rank-value">' + number(row[1]) + '</strong></span><span class="dc-rank-track"><span class="dc-rank-fill"></span></span><span class="dc-rank-share">占当前记录 ' + share.toFixed(1) + '%</span></button>';
    }).join("") + '</div><div class="dc-funnel-hint">按数量降序 · 点击条形联动右侧明细</div>';
  }
  function polarPoint(cx, cy, radius, index, count) {
    var angle = Math.PI * 2 * index / count - Math.PI / 2;
    return [(cx + Math.cos(angle) * radius).toFixed(1), (cy + Math.sin(angle) * radius).toFixed(1)];
  }
  function shortChartLabel(value, maxLength) {
    var text = String(value || "");
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  }
  function radarChartMarkup(kind, period, rows, selected) {
    var cx = 200,
      cy = 160,
      radius = 82,
      labelRadius = 128;
    var max = Math.max.apply(null, rows.map(function (row) {
      return row[1];
    }).concat([1]));
    var grids = [0.25, 0.5, 0.75, 1].map(function (level) {
      return '<polygon class="dc-radar-grid" points="' + rows.map(function (_, index) {
        return polarPoint(cx, cy, radius * level, index, rows.length).join(",");
      }).join(" ") + '"></polygon>';
    }).join("");
    var spokes = rows.map(function (_, index) {
      var point = polarPoint(cx, cy, radius, index, rows.length);
      return '<line class="dc-radar-spoke" x1="' + cx + '" y1="' + cy + '" x2="' + point[0] + '" y2="' + point[1] + '"></line>';
    }).join("");
    var points = rows.map(function (row, index) {
      return polarPoint(cx, cy, Math.max(8, row[1] / max * radius), index, rows.length);
    });
    var dots = points.map(function (point, index) {
      return '<g style="cursor:pointer" ' + chartAction(kind, period, rows[index][0]) + '><title>' + escapeHtml(rows[index][0]) + '：' + number(rows[index][1]) + '</title><circle class="dc-radar-dot" cx="' + point[0] + '" cy="' + point[1] + '" r="5"></circle></g>';
    }).join("");
    var labels = rows.map(function (row, index) {
      var edge = polarPoint(cx, cy, radius + 4, index, rows.length);
      var label = polarPoint(cx, cy, labelRadius, index, rows.length);
      var boxX = Number(label[0]) - 54;
      var boxY = Number(label[1]) - 19;
      return '<g class="dc-radar-label' + (row[0] === selected ? ' is-active' : '') + '" style="cursor:pointer" ' + chartAction(kind, period, row[0]) + '><title>' + escapeHtml(row[0]) + '：' + number(row[1]) + '</title><line class="dc-radar-link" x1="' + edge[0] + '" y1="' + edge[1] + '" x2="' + label[0] + '" y2="' + label[1] + '"></line><rect class="dc-radar-label-box" x="' + boxX.toFixed(1) + '" y="' + boxY.toFixed(1) + '" width="108" height="38" rx="7"></rect><text class="dc-radar-label-name" x="' + label[0] + '" y="' + (Number(label[1]) - 3).toFixed(1) + '">' + escapeHtml(shortChartLabel(row[0], 10)) + '</text><text class="dc-radar-label-value" x="' + label[0] + '" y="' + (Number(label[1]) + 12).toFixed(1) + '">' + number(row[1]) + '</text></g>';
    }).join("");
    return '<div class="dc-radar-wrap"><svg class="dc-radar" viewBox="0 0 400 320" role="img" aria-label="分类雷达图">' + grids + spokes + '<polygon class="dc-radar-area" points="' + points.map(function (point) {
      return point.join(",");
    }).join(" ") + '"></polygon>' + dots + labels + '</svg></div><div class="dc-funnel-hint">分类和值对应各顶点 · 点击标签联动明细</div>';
  }
  function arrangeDonutLabels(items) {
    var minY = 34,
      maxY = 286,
      gap = 30;
    items.sort(function (a, b) {
      return a.naturalY - b.naturalY;
    });
    items.forEach(function (item, index) {
      item.labelY = Math.max(item.naturalY, index ? items[index - 1].labelY + gap : minY);
    });
    if (items.length && items[items.length - 1].labelY > maxY) {
      items[items.length - 1].labelY = maxY;
      for (var index = items.length - 2; index >= 0; index--) items[index].labelY = Math.min(items[index].labelY, items[index + 1].labelY - gap);
    }
    return items;
  }
  function donutChartMarkup(kind, period, rows, selected) {
    var total = rows.reduce(function (sum, row) {
      return sum + row[1];
    }, 0);
    var cx = 220,
      cy = 160,
      radius = 66,
      cursor = 0;
    var labels = [];
    var segments = rows.map(function (row, index) {
      var start = cursor;
      var percent = total ? row[1] / total * 100 : 0;
      cursor += percent;
      var angle = (start + percent / 2) / 100 * Math.PI * 2 - Math.PI / 2;
      labels.push({
        row: row,
        index: index,
        percent: percent,
        left: Math.cos(angle) < 0,
        sourceX: cx + Math.cos(angle) * 86,
        sourceY: cy + Math.sin(angle) * 86,
        naturalY: cy + Math.sin(angle) * 112
      });
      return '<circle class="dc-donut-segment' + (row[0] === selected ? ' is-active' : '') + '" ' + chartAction(kind, period, row[0]) + ' cx="' + cx + '" cy="' + cy + '" r="' + radius + '" pathLength="100" stroke="' + chartPalette[index % chartPalette.length] + '" stroke-dasharray="' + percent.toFixed(3) + ' ' + (100 - percent).toFixed(3) + '" stroke-dashoffset="' + (-start).toFixed(3) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" style="stroke-width:' + (row[0] === selected ? 32 : 28) + '"><title>' + escapeHtml(row[0]) + '：' + number(row[1]) + '，' + percent.toFixed(1) + '%</title></circle>';
    }).join("");
    var leftLabels = arrangeDonutLabels(labels.filter(function (item) {
      return item.left;
    }));
    var rightLabels = arrangeDonutLabels(labels.filter(function (item) {
      return !item.left;
    }));
    var labelMarkup = leftLabels.concat(rightLabels).map(function (item) {
      var textX = item.left ? 12 : 328;
      var lineEndX = item.left ? 132 : 308;
      var elbowX = item.left ? 146 : 294;
      return '<g class="dc-donut-label" ' + chartAction(kind, period, item.row[0]) + '><title>' + escapeHtml(item.row[0]) + '：' + number(item.row[1]) + '，' + item.percent.toFixed(1) + '%</title><polyline class="dc-donut-link" style="stroke:' + chartPalette[item.index % chartPalette.length] + '" points="' + item.sourceX.toFixed(1) + ',' + item.sourceY.toFixed(1) + ' ' + elbowX + ',' + item.labelY.toFixed(1) + ' ' + lineEndX + ',' + item.labelY.toFixed(1) + '"></polyline><circle cx="' + lineEndX + '" cy="' + item.labelY.toFixed(1) + '" r="3" fill="' + chartPalette[item.index % chartPalette.length] + '"></circle><text class="dc-donut-label-name" x="' + textX + '" y="' + (item.labelY - 3).toFixed(1) + '">' + escapeHtml(shortChartLabel(item.row[0], 11)) + '</text><text class="dc-donut-label-value" x="' + textX + '" y="' + (item.labelY + 11).toFixed(1) + '">' + number(item.row[1]) + ' · ' + item.percent.toFixed(1) + '%</text></g>';
    }).join("");
    return '<div class="dc-donut-wrap"><svg class="dc-donut-svg" viewBox="0 0 440 320" role="img" aria-label="分类命中环形图"><circle class="dc-donut-track" cx="' + cx + '" cy="' + cy + '" r="' + radius + '"></circle>' + segments + labelMarkup + '<text class="dc-donut-center-total" x="' + cx + '" y="156">' + number(total) + '</text><text class="dc-donut-center-caption" x="' + cx + '" y="174">分类命中</text></svg></div><div class="dc-funnel-hint">指向线连接分类与环块 · 不代表去重账号占比</div>';
  }
  function paretoChartMarkup(kind, period, rows) {
    var total = rows.reduce(function (sum, row) {
      return sum + row[1];
    }, 0);
    var max = Math.max.apply(null, rows.map(function (row) {
      return row[1];
    }).concat([1]));
    var left = 28,
      top = 34,
      chartWidth = 314,
      chartHeight = 178;
    var slot = chartWidth / rows.length;
    var barWidth = Math.min(46, slot * 0.62);
    var cumulative = 0;
    var points = [];
    var bars = rows.map(function (row, index) {
      var height = row[1] / max * chartHeight;
      var x = left + slot * index + (slot - barWidth) / 2;
      var y = top + chartHeight - height;
      cumulative += row[1];
      var percent = total ? cumulative / total * 100 : 0;
      var pointX = left + slot * index + slot / 2;
      var pointY = top + chartHeight - percent / 100 * chartHeight;
      points.push([pointX, pointY, percent]);
      return '<g ' + chartAction(kind, period, row[0]) + '><title>' + escapeHtml(row[0]) + '：' + number(row[1]) + '，累计 ' + percent.toFixed(1) + '%</title><rect class="dc-pareto-bar" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barWidth.toFixed(1) + '" height="' + height.toFixed(1) + '" rx="5" fill="' + chartPalette[index % chartPalette.length] + '"></rect><text class="dc-pareto-value" x="' + pointX.toFixed(1) + '" y="' + Math.max(18, y - 6).toFixed(1) + '">' + number(row[1]) + '</text><text class="dc-pareto-label" x="' + pointX.toFixed(1) + '" y="232">' + (index + 1) + '</text></g>';
    }).join("");
    var grid = [0.25, 0.5, 0.75, 1].map(function (level) {
      var y = top + chartHeight - chartHeight * level;
      return '<line class="dc-pareto-grid" x1="' + left + '" y1="' + y + '" x2="' + (left + chartWidth) + '" y2="' + y + '"></line>';
    }).join("");
    var pointMarkup = points.map(function (point) {
      return '<circle class="dc-pareto-point" cx="' + point[0].toFixed(1) + '" cy="' + point[1].toFixed(1) + '" r="4"></circle><text class="dc-pareto-percent" x="' + point[0].toFixed(1) + '" y="' + Math.max(12, point[1] - 8).toFixed(1) + '">' + point[2].toFixed(0) + '%</text>';
    }).join("");
    return '<svg class="dc-pareto" viewBox="0 0 370 250" role="img" aria-label="风险分类帕累托图">' + grid + bars + '<polyline class="dc-pareto-line" points="' + points.map(function (point) {
      return point[0].toFixed(1) + ',' + point[1].toFixed(1);
    }).join(" ") + '"></polyline>' + pointMarkup + '<text x="28" y="246" fill="#98a2b3" font-size="9">编号对应下方图例</text></svg>' + chartLegendMarkup(kind, period, rows, "", total, "dc-pareto-legend") + '<div class="dc-funnel-hint">下方图例双列展示 · 悬停查看分类全称</div>';
  }
  function treemapLayout(rows, x, y, width, height, vertical, result) {
    if (!rows.length) return result;
    if (rows.length === 1) {
      result.push({
        row: rows[0],
        x: x,
        y: y,
        width: width,
        height: height
      });
      return result;
    }
    var total = rows.reduce(function (sum, row) {
      return sum + row[1];
    }, 0) || 1;
    var ratio = Math.max(0.08, rows[0][1] / total);
    if (vertical) {
      var sliceWidth = width * ratio;
      result.push({
        row: rows[0],
        x: x,
        y: y,
        width: sliceWidth,
        height: height
      });
      return treemapLayout(rows.slice(1), x + sliceWidth, y, width - sliceWidth, height, false, result);
    }
    var sliceHeight = height * ratio;
    result.push({
      row: rows[0],
      x: x,
      y: y,
      width: width,
      height: sliceHeight
    });
    return treemapLayout(rows.slice(1), x, y + sliceHeight, width, height - sliceHeight, true, result);
  }
  function treemapChartMarkup(kind, period, rows, selected) {
    var total = rows.reduce(function (sum, row) {
      return sum + row[1];
    }, 0);
    var cells = treemapLayout(rows, 0, 0, 100, 100, true, []);
    return '<div class="dc-tree"><div class="dc-tree-canvas">' + cells.map(function (cell, index) {
      var share = total ? cell.row[1] / total * 100 : 0;
      var compact = cell.width < 15 || cell.height < 17;
      return '<button type="button" class="dc-tree-cell' + (cell.row[0] === selected ? ' is-active' : '') + (compact ? ' is-compact' : '') + '" style="left:' + cell.x.toFixed(2) + '%;top:' + cell.y.toFixed(2) + '%;width:' + cell.width.toFixed(2) + '%;height:' + cell.height.toFixed(2) + '%;background:' + chartPalette[index % chartPalette.length] + '" ' + chartAction(kind, period, cell.row[0]) + ' title="' + escapeHtml(cell.row[0]) + '，' + number(cell.row[1]) + ' 次，占命中 ' + share.toFixed(1) + '%"><strong>' + escapeHtml(cell.row[0]) + '</strong><span>' + number(cell.row[1]) + '</span><em>' + share.toFixed(1) + '%</em></button>';
    }).join("") + '</div></div>' + chartLegendMarkup(kind, period, rows, selected, total, "dc-tree-legend") + '<div class="dc-funnel-hint">小区块名称由下方完整图例补充</div>';
  }
  function rosePoint(cx, cy, radius, angle) {
    return [(cx + Math.cos(angle) * radius).toFixed(1), (cy + Math.sin(angle) * radius).toFixed(1)];
  }
  function roseSectorPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    var outerStart = rosePoint(cx, cy, outerRadius, startAngle);
    var outerEnd = rosePoint(cx, cy, outerRadius, endAngle);
    var innerEnd = rosePoint(cx, cy, innerRadius, endAngle);
    var innerStart = rosePoint(cx, cy, innerRadius, startAngle);
    return "M" + outerStart.join(" ") + " A" + outerRadius + " " + outerRadius + " 0 0 1 " + outerEnd.join(" ") + " L" + innerEnd.join(" ") + " A" + innerRadius + " " + innerRadius + " 0 0 0 " + innerStart.join(" ") + " Z";
  }
  function roseChartMarkup(kind, period, rows, selected) {
    var cx = 210,
      cy = 226,
      innerRadius = 52,
      maxRadius = 164;
    var max = Math.max.apply(null, rows.map(function (row) {
      return row[1];
    }).concat([1]));
    var step = Math.PI / rows.length;
    var grids = [0.25, 0.5, 0.75, 1].map(function (level) {
      var radius = innerRadius + (maxRadius - innerRadius) * level;
      return '<path class="dc-rose-grid" d="M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx + radius) + ' ' + cy + '"></path>';
    }).join("");
    var sectors = rows.map(function (row, index) {
      var start = Math.PI + step * index + 0.018;
      var end = Math.PI + step * (index + 1) - 0.018;
      var middle = (start + end) / 2;
      var outerRadius = innerRadius + Math.sqrt(row[1] / max) * (maxRadius - innerRadius);
      var labelPoint = rosePoint(cx, cy, maxRadius + 17, middle);
      var valuePoint = rosePoint(cx, cy, Math.min(maxRadius - 7, outerRadius + 12), middle);
      return '<g ' + chartAction(kind, period, row[0]) + '><title>' + escapeHtml(row[0]) + '：' + number(row[1]) + '</title><path class="dc-rose-sector' + (row[0] === selected ? ' is-active' : '') + '" d="' + roseSectorPath(cx, cy, innerRadius, outerRadius, start, end) + '" fill="url(#dcRoseGradient' + index + ')"></path><text class="dc-rose-value" x="' + valuePoint[0] + '" y="' + valuePoint[1] + '">' + number(row[1]) + '</text><text class="dc-rose-label" x="' + labelPoint[0] + '" y="' + labelPoint[1] + '">' + escapeHtml(shortChartLabel(row[0], 6)) + '</text></g>';
    }).join("");
    var gradients = rows.map(function (_, index) {
      var color = chartPalette[index % chartPalette.length];
      return '<linearGradient id="dcRoseGradient' + index + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + color + '" stop-opacity=".66"></stop><stop offset="1" stop-color="' + color + '"></stop></linearGradient>';
    }).join("");
    return '<svg class="dc-rose" viewBox="0 0 420 276" role="img" aria-label="半圆玫瑰图"><defs>' + gradients + '</defs>' + grids + '<line class="dc-rose-axis" x1="28" y1="' + cy + '" x2="392" y2="' + cy + '"></line>' + sectors + '<text class="dc-rose-caption" x="' + cx + '" y="250">扇区半径表示分类命中数量</text></svg><div class="dc-funnel-hint">点击扇区联动右侧明细</div>';
  }
  function chartMarkup(kind, mode, period, rows, selected, baseRows) {
    if (mode === "rose") return roseChartMarkup(kind, period, rows, selected);
    if (mode === "pareto") return paretoChartMarkup(kind, period, rows);
    if (mode === "radar") return radarChartMarkup(kind, period, rows, selected);
    if (mode === "donut") return donutChartMarkup(kind, period, rows, selected);
    if (mode === "treemap") return treemapChartMarkup(kind, period, rows, selected);
    return rankChartMarkup(kind, period, rows, selected, baseRows);
  }
  function violationChartsMarkup() {
    var item = periods[selectedViolationPeriod];
    var selected = selectedViolationByPeriod[selectedViolationPeriod];
    var rows = item.violations.slice().sort(function (a, b) {
      return b[1] - a[1];
    });
    return '<article class="dc-funnel-card"><div class="dc-funnel-head"><h3 class="dc-funnel-title">' + selectedRangeLabel("violation", item.label) + '风控账号违规类型</h3>' + periodPickerMarkup("violation", selectedViolationPeriod) + '</div>' + chartMarkup("violation", "rose", selectedViolationPeriod, rows, selected, item.rows) + '</article>';
  }
  function statusChartsMarkup() {
    var item = periods[selectedStatusPeriod];
    var selected = selectedStatusByPeriod[selectedStatusPeriod];
    var rows = item.statuses.slice().sort(function (a, b) {
      return b[1] - a[1];
    });
    return '<article class="dc-funnel-card"><div class="dc-funnel-head"><h3 class="dc-funnel-title">' + selectedRangeLabel("status", item.label) + '风险账号处理状态及数量</h3>' + periodPickerMarkup("status", selectedStatusPeriod) + '</div>' + chartMarkup("status", "rose", selectedStatusPeriod, rows, selected, item.rows) + '</article>';
  }
  function inlineDetailMarkup(kind) {
    var detailPeriod = kind === "status" ? selectedStatusPeriod : selectedViolationPeriod;
    var period = periods[detailPeriod];
    var isStatus = kind === "status";
    var selected = isStatus ? selectedStatusByPeriod[detailPeriod] : selectedViolationByPeriod[detailPeriod];
    var source = isStatus ? statusDetails : violationDetails;
    var series = isStatus ? period.statuses : period.violations;
    var rows = source[detailPeriod] && source[detailPeriod][selected] || [];
    var countRow = series.filter(function (row) {
      return row[0] === selected;
    })[0];
    var total = countRow ? countRow[1] : rows.length;
    var head = '<th class="dc-row-no"></th>' + detailColumns.map(function (column) {
      return '<th>' + escapeHtml(column) + '</th>';
    }).join("");
    var body = rows.map(function (row, index) {
      return '<tr><td class="dc-row-no">' + (index + 1) + '</td>' + row.map(function (cell, cellIndex) {
        var text = escapeHtml(cell === "" || cell === null || cell === undefined ? "--" : cell);
        if (cellIndex === 1) text = '<span class="dc-detail-person">' + text + '</span>';
        if (cellIndex === 3) text = '<span class="dc-detail-server">' + text + '</span>';
        if (cellIndex === 8) text = '<span class="dc-detail-pill">' + text + '</span>';
        return '<td title="' + escapeHtml(cell) + '">' + text + '</td>';
      }).join("") + '</tr>';
    }).join("");
    return '<article class="dc-inline-detail"><div class="dc-inline-detail-head"><div><strong>' + period.label + ' · ' + escapeHtml(selected) + '明细</strong><span>字段来自本系统源记录</span></div><span class="dc-inline-detail-count">图表计数 ' + number(total) + ' 条<br>展示 ' + rows.length + ' 条真实记录</span></div><div class="dc-inline-detail-scroll"><table class="dc-pro-table"><thead><tr>' + head + '</tr></thead><tbody>' + (body || '<tr><td class="dc-inline-empty" colspan="10">暂无对应明细</td></tr>') + '</tbody></table></div></article>';
  }
  function detailModalMarkup() {
    if (!detailOpen) return "";
    var period = periods[selectedDetailPeriod] || periods.week;
    var detailSource = selectedDetailKind === "status" ? statusDetails : violationDetails;
    var detailSeries = selectedDetailKind === "status" ? period.statuses : period.violations;
    var detailLabel = selectedDetailKind === "status" ? "处理状态" : "违规类型";
    var sourceRows = detailSource[selectedDetailPeriod] && detailSource[selectedDetailPeriod][selectedViolation] || [];
    var keyword = detailKeyword.trim().toLowerCase();
    var rows = sourceRows.filter(function (row) {
      return !keyword || row.some(function (cell) {
        return String(cell).toLowerCase().indexOf(keyword) >= 0;
      });
    });
    var countRow = detailSeries.filter(function (row) {
      return row[0] === selectedViolation;
    })[0];
    var total = countRow ? countRow[1] : sourceRows.length;
    var head = '<th class="dc-row-no"></th>' + detailColumns.map(function (column) {
      return '<th>' + escapeHtml(column) + '</th>';
    }).join("");
    var body = rows.map(function (row, index) {
      return '<tr><td class="dc-row-no">' + (index + 1) + '</td>' + row.map(function (cell, cellIndex) {
        var text = escapeHtml(cell === "" || cell === null || cell === undefined ? "--" : cell);
        if (cellIndex === 1) text = '<span class="dc-detail-person">' + text + '</span>';
        if (cellIndex === 3) text = '<span class="dc-detail-server">' + text + '</span>';
        if (cellIndex === 8) text = '<span class="dc-detail-pill">' + text + '</span>';
        return '<td title="' + escapeHtml(cell) + '">' + text + '</td>';
      }).join("") + '</tr>';
    }).join("");
    return '<div class="dc-detail-overlay" data-detail-overlay><section class="dc-detail-modal" role="dialog" aria-modal="true" aria-label="数据详情"><div class="dc-detail-head"><h2>数据详情</h2><button type="button" class="dc-detail-close" data-detail-close aria-label="关闭">×</button></div><div class="dc-detail-context"><span>统计周期：<strong>' + period.label + '</strong></span><span>' + detailLabel + '：<strong>' + escapeHtml(selectedViolation) + '</strong></span><span class="dc-detail-summary">图表计数 ' + number(total) + ' 条 · 当前展示 ' + rows.length + ' 条真实样例</span></div><div class="dc-detail-search"><input type="search" value="' + escapeHtml(detailKeyword) + '" placeholder="请输入关键词搜索" data-detail-search></div><div class="dc-detail-scroll"><table class="dc-pro-table dc-detail-table"><thead><tr>' + head + '</tr></thead><tbody>' + (body || '<tr><td class="dc-detail-empty" colspan="10">没有匹配的数据</td></tr>') + '</tbody></table></div></section></div>';
  }
  function riskSignalMarkup() {
    var wordCloud = '<div class="dc-ban-word-cloud-fallback">' + (riskWordCloudData.length ? '词云加载中' : '当前范围无规则命中词') + '</div>';
    var points = scatterData.map(function (row) {
      return [row[0], row[1], row[2], Math.max(7, Math.min(14, 6 + Math.sqrt(row[2] || 1)))];
    });
    var x0 = 58,
      x1 = 500,
      y0 = 218,
      y1 = 28,
      xMax = Math.max.apply(null, points.map(function (row) {
        return row[1];
      }).concat([1])),
      yMax = Math.max.apply(null, points.map(function (row) {
        return row[2];
      }).concat([1]));
    var yGrid = [0, .25, .5, .75, 1].map(function (ratio) {
      var value = Math.round(yMax * ratio);
      var y = y0 - value / yMax * (y0 - y1);
      return '<line class="dc-scatter-grid" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"></line><text class="dc-scatter-label" x="48" y="' + (y + 3) + '" text-anchor="end">' + value + '</text>';
    }).join("");
    var xGrid = [0, .25, .5, .75, 1].map(function (ratio) {
      var value = Math.round(xMax * ratio);
      var x = x0 + value / xMax * (x1 - x0);
      return '<line class="dc-scatter-grid" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y0 + '"></line><text class="dc-scatter-label" x="' + x + '" y="236" text-anchor="middle">' + value + '</text>';
    }).join("");
    var dots = points.map(function (row) {
      var x = x0 + row[1] / xMax * (x1 - x0);
      var y = y0 - row[2] / yMax * (y0 - y1);
      return '<g><circle class="dc-scatter-dot" cx="' + x + '" cy="' + y + '" r="' + row[3] + '"><title>' + escapeHtml(row[0]) + '：风险角色 ' + row[1] + '，信号 ' + row[2] + ' 条</title></circle><text class="dc-scatter-name" x="' + x + '" y="' + (y - row[3] - 7) + '">' + escapeHtml(row[0]) + '</text><text class="dc-scatter-count" x="' + x + '" y="' + (y + 3) + '">' + row[2] + '</text></g>';
    }).join("");
    var scatter = '<svg class="dc-server-scatter" viewBox="0 0 530 265" role="img" aria-label="服务器风险角色与风险记录数散点图"><defs><linearGradient id="dcScatterDot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#36cfc9"></stop><stop offset="1" stop-color="#1677ff"></stop></linearGradient></defs>' + yGrid + xGrid + '<line class="dc-scatter-axis" x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '"></line><line class="dc-scatter-axis" x1="' + x0 + '" y1="' + y1 + '" x2="' + x0 + '" y2="' + y0 + '"></line>' + dots + '<text class="dc-scatter-axis-title" x="278" y="255" text-anchor="middle">风险角色数</text><text class="dc-scatter-axis-title" x="15" y="125" text-anchor="middle" transform="rotate(-90 15 125)">风险记录数</text></svg>';
    return '<section class="dc-risk-signal-section"><div class="dc-pro-section-title"><span>风险触发分布</span><small>当前筛选范围</small></div><div class="dc-risk-signal-grid"><article class="dc-risk-signal-card"><div class="dc-risk-signal-head"><strong>封禁词触发词云</strong><span>字号与颜色反映触发次数</span></div><div class="dc-ban-word-cloud">' + wordCloud + '</div></article><article class="dc-risk-signal-card"><div class="dc-risk-signal-head"><strong>服务器风险记录分布</strong><span>横轴风险角色 · 纵轴风险记录数</span></div>' + scatter + '</article></div></section>';
  }
  function loadWordCloudScript(src, marker) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-' + marker + ']');
      if (existing && existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      var script = existing || document.createElement("script");
      function done() {
        script.dataset.loaded = "1";
        resolve();
      }
      script.addEventListener("load", done, {
        once: true
      });
      script.addEventListener("error", reject, {
        once: true
      });
      if (!existing) {
        script.src = src;
        script.setAttribute("data-" + marker, "1");
        document.head.appendChild(script);
      }
    });
  }
  function ensureWordCloudEngine() {
    if (riskWordCloudEnginePromise) return riskWordCloudEnginePromise;
    riskWordCloudEnginePromise = (window.echarts ? Promise.resolve() : loadWordCloudScript("/assets/echarts-risk-wordcloud-v26.min.js", "dc-echarts-risk")).then(function () {
      return loadWordCloudScript("/assets/echarts-wordcloud-risk-v26.min.js", "dc-echarts-wordcloud-risk");
    });
    return riskWordCloudEnginePromise;
  }
  function createRiskWordCloudMask() {
    if (riskWordCloudMask) return Promise.resolve(riskWordCloudMask);
    return new Promise(function (resolve) {
      var canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      var ctx = canvas.getContext("2d", {
        willReadFrequently: true
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(400, 240, 170, 0, Math.PI * 2);
      ctx.arc(240, 270, 120, 0, Math.PI * 2);
      ctx.arc(560, 270, 120, 0, Math.PI * 2);
      ctx.arc(310, 160, 100, 0, Math.PI * 2);
      ctx.arc(490, 160, 100, 0, Math.PI * 2);
      ctx.arc(560, 370, 100, 0, Math.PI * 2);
      ctx.arc(240, 370, 100, 0, Math.PI * 2);
      ctx.arc(400, 340, 100, 0, Math.PI * 2);
      ctx.rect(240, 240, 320, 200);
      ctx.fill();
      var maskImage = new Image();
      maskImage.onload = function () {
        riskWordCloudMask = maskImage;
        resolve(maskImage);
      };
      maskImage.src = canvas.toDataURL("image/png");
    });
  }
  function riskWordCloudOption(container, maskImage) {
    var dynamicMaxSize = Math.max(45, Math.min(100, Math.floor(container.clientWidth / 800 * 85)));
    var palette = ["#45B39D", "#FF7F50", "#FFD54F", "#D81B60", "#78909C", "#81C784", "#9575CD"];
    return {
      tooltip: {
        show: true,
        backgroundColor: "rgba(255,255,255,0.95)",
        textStyle: {
          color: "#333"
        },
        formatter: function (params) {
          return params.name + '<br/>触发次数: <span style="font-weight:bold;color:#165DFF">' + params.value + "</span> 次";
        }
      },
      series: [{
        type: "wordCloud",
        maskImage: maskImage,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        sizeRange: [10, dynamicMaxSize],
        rotationRange: [0, 0],
        rotationStep: 0,
        gridSize: 2,
        drawOutOfBound: false,
        shrinkToFit: true,
        layoutAnimation: true,
        textStyle: {
          fontFamily: "'Source Han Sans CN', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          fontWeight: "bolder",
          color: function () {
            return palette[Math.floor(Math.random() * palette.length)];
          }
        },
        emphasis: {
          focus: "self",
          textStyle: {
            textShadowBlur: 8,
            textShadowColor: "rgba(0,0,0,0.15)"
          }
        },
        data: riskWordCloudData.map(function (row) {
          return {
            name: row[0],
            value: row[1]
          };
        })
      }]
    };
  }
  function mountRiskWordCloud(root) {
    var token = ++riskWordCloudRenderToken;
    var container = root.querySelector(".dc-ban-word-cloud");
    if (!container) return;
    Promise.all([ensureWordCloudEngine(), createRiskWordCloudMask()]).then(function (results) {
      if (token !== riskWordCloudRenderToken || !document.contains(container)) return;
      if (riskWordCloudChart) riskWordCloudChart.dispose();
      container.innerHTML = "";
      riskWordCloudChart = window.echarts.init(container);
      riskWordCloudChart.setOption(riskWordCloudOption(container, results[1]));
    }).catch(function () {
      if (document.contains(container)) container.innerHTML = '<div class="dc-ban-word-cloud-fallback">词云加载失败</div>';
    });
  }
  function dashboardMarkup() {
    var p = periods[selectedPeriod];
    var overviewLabel = selectedRangeLabel("overview", p.label);
    var statusTotal = p.statuses.reduce(function (sum, row) {
      return sum + row[1];
    }, 0);
    function table(rows, color) {
      var max = Math.max.apply(null, rows.map(function (row) {
        return row[1];
      }).concat([1]));
      return '<div class="dc-pro-table-wrap"><table class="dc-pro-table"><thead><tr><th>分类</th><th>记录数</th><th>密度</th></tr></thead><tbody>' + rows.map(function (row) {
        return '<tr><td>' + row[0] + '</td><td class="num">' + number(row[1]) + '</td><td><div class="dc-pro-cellbar"><i style="width:' + Math.max(3, row[1] / max * 100) + '%;background:' + color + '"></i><span>' + (row[1] / p.rows * 100).toFixed(1) + '%</span></div></td></tr>';
      }).join("") + '</tbody></table></div>';
    }
    return '<section class="dc-pro-section"><div class="dc-pro-section-title"><span>1、风险总体态势</span><small>统计周期：' + overviewLabel + '</small></div><div class="dc-risk-overview-layout"><div class="dc-risk-overview-data"><div class="dc-pro-insight">📌 分析结论：共发现 <strong>' + number(p.rows) + '</strong> 条风险记录，涉及 <strong>' + number(p.roles) + '</strong> 个去重角色；记录与角色差值为 <strong>' + number(p.rows - p.roles) + '</strong>，需按角色ID归并后再执行处置。</div><div class="dc-risk-overview-metrics">' + '<article class="dc-hr-card dc-hr-metric"><div class="label">' + overviewLabel + '风控记录</div><div class="value">' + number(p.rows) + '</div><div class="hint">聊天、物品、IP模型命中记录</div></article>' + '<article class="dc-hr-card dc-hr-metric"><div class="label">' + overviewLabel + '去重风险角色</div><div class="value">' + number(p.roles) + '</div><div class="hint">按角色ID去重</div></article>' + '<article class="dc-hr-card dc-hr-metric"><div class="label">重复记录差值</div><div class="value">' + number(p.rows - p.roles) + '</div><div class="hint">记录数 − 去重角色数</div></article>' + '<article class="dc-hr-card dc-hr-metric"><div class="label">待人工复核角色</div><div class="value">' + number(statusTotal) + '</div><div class="hint">没有真实处置结果时不推断封禁状态</div></article></div></div>' + riskDetailFeedMarkup() + '</div><div class="dc-hr-grid">' + trendMarkup() + '</div></section>' + '<section class="dc-pro-section"><div class="dc-pro-section-title"><span>2、即时风险处置</span><small>一小时滚动窗口 · 点击案件查看证据</small></div>' + riskQueueMarkup() + '</section>' + '<section class="dc-pro-section"><div class="dc-pro-section-title"><span>3、违规类型与数据明细</span><small>独立日期范围 · 点击分类联动明细</small></div><div class="dc-analysis-pair">' + violationChartsMarkup() + inlineDetailMarkup("violation") + '</div></section>' + '<section class="dc-pro-section"><div class="dc-pro-section-title"><span>4、处理状态与数据明细</span><small>独立日期范围 · 点击分类联动明细</small></div><div class="dc-analysis-pair">' + statusChartsMarkup() + inlineDetailMarkup("status") + '</div></section>';
  }
  function dictionaryMarkup() {
    return '<div class="dc-dict"><h1>数据字典</h1><p class="dc-dict-sub">系统字段、数据来源与跨表索引关系</p><section class="dc-dict-card"><h2>风控看板数据索引</h2><div class="dc-hr-flow"><div class="dc-hr-source-list">' + sources.map(function (source) {
      return '<div class="dc-hr-source"><strong>' + source[0] + '</strong><span>' + source[1] + ' → ' + source[2] + '</span></div>';
    }).join("") + '</div><div class="dc-hr-arrow">→</div><div class="dc-hr-node"><strong>幻斗异常账号汇总</strong><span>连接键：角色ID</span><span>预警星级=充值+聊天+IP+行为四类命中数</span><span>建议状态：1项追踪，2–3项待排查，4项待封禁</span></div><div class="dc-hr-arrow">→</div><div class="dc-hr-node"><strong>人工巡查闭环</strong><span>是否巡查 / 巡查人员</span><span>是否封禁：是 / 否，证据链未闭环</span></div></div></section>' + '<section class="dc-dict-card"><h2>风控看板展示口径</h2><table class="dc-hr-table"><tbody><tr><th>数据表</th><td>幻斗英雄风控表</td></tr><tr><th>时间窗口</th><td>昨日=Yesterday；上周=LastWeek；上月=LastMonth（文档时区自然周/月）</td></tr><tr><th>风控记录</th><td>日期筛选后按记录行计数</td></tr><tr><th>风险角色</th><td>日期筛选后对角色ID去重计数</td></tr><tr><th>违规/处理分布</th><td>多选字段按每个选项展开后分组计数</td></tr><tr><th>明细唯一键</th><td>记录ID用于定位；角色ID用于跨表归并，不用账号ID或角色名代替</td></tr></tbody></table></section><p class="dc-hr-foot">口径核对日期：2026-09-15。当前只读飞书数据，未写入飞书。</p></div>';
  }
  async function loadRiskRules(root) {
    riskConfigBusy = true;
    riskConfigError = "";
    renderRoot(root);
    try {
      var response = await fetch("/api/v1/risk-dashboard/rules", {
        cache: "no-store",
        headers: authHeaders()
      });
      var body = await response.json();
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "规则读取失败");
      var payload = body.data || {};
      var rules = payload.rules || {};
      riskRuleDefaults = payload.defaults || null;
      riskRuleEngine = payload.engine || null;
      riskRuleDraft = {
        chat: (rules.chat || []).map(function (row) {
          return [row[0] || "", row[1] || "", row[2] || "medium"];
        }),
        guides: (rules.guides || []).map(function (row) {
          return [row[0] || "", row[1] || "引流", row[2] || "medium"];
        }),
        trade: (rules.trade || []).slice(),
        whitelist: (rules.whitelist || []).slice(),
        item_actions: (rules.item_actions || []).slice(),
        ip_role_threshold: rules.ip_role_threshold || 4,
        recharge_threshold: rules.recharge_threshold == null ? 200 : rules.recharge_threshold,
        segment_window_sec: rules.segment_window_sec || 300,
        segment_max_msgs: rules.segment_max_msgs || 10,
        repeat_threshold: rules.repeat_threshold || 3,
        limits: payload.limits || {}
      };
    } catch (error) {
      riskConfigError = error.message || "规则读取失败";
      riskRuleDraft = null;
    } finally {
      riskConfigBusy = false;
      renderRoot(root);
    }
  }
  function riskRuleChipHtml(row, index) {
    return '<span class="dc-risk-rule-chip" title="分类：' + escapeHtml(row[1] || "未分类") + '；等级：' + escapeHtml(row[2] || "medium") + '">' + escapeHtml(row[0]) + ' · ' + escapeHtml(row[1] || "未分类") + '<button type="button" class="dc-risk-rule-x" data-risk-rule-remove="' + index + '" aria-label="删除">×</button></span>';
  }
  function riskItemChipHtml(word, index) {
    return '<span class="dc-risk-rule-chip dc-risk-rule-item">' + escapeHtml(word) + '<button type="button" class="dc-risk-rule-x" data-risk-item-remove="' + index + '" aria-label="删除">×</button></span>';
  }
  function riskListValues(name) {
    var list = riskRuleDraft && riskRuleDraft[name] || [];
    if (name === "guides") {
      return list.map(function (row) {
        return String(row && row[0] || "");
      });
    }
    return list.map(function (row) {
      return String(row || "");
    });
  }
  function riskListSection(title, name, placeholder, hint) {
    var values = riskListValues(name);
    var chips = values.map(function (word, index) {
      return '<span class="dc-risk-rule-chip dc-risk-rule-item">' + escapeHtml(word) + '<button type="button" class="dc-risk-rule-x" data-risk-list-remove="' + name + ':' + index + '" aria-label="删除">×</button></span>';
    }).join("");
    return '<section class="dc-risk-config-block"><h3>' + title + '（' + values.length + '）</h3>' + (hint ? '<p class="dc-risk-config-note">' + hint + '</p>' : '') + '<div class="dc-risk-rule-list">' + (chips || '<em>暂无</em>') + '</div>' + '<div class="dc-risk-rule-add"><input data-risk-list-input="' + name + '" placeholder="' + placeholder + '" style="width:240px" />' + '<button type="button" class="dc-hr-btn" data-risk-list-add="' + name + '">添加</button></div></section>';
  }
  function riskEngineMarkup() {
    var engine = riskRuleEngine;
    var draft = riskRuleDraft || {};
    if (!engine) {
      return '<section class="dc-risk-config-block"><h3>风险引擎规则</h3>' + '<div class="dc-risk-config-note">引擎规则说明暂不可用（接口未返回）。</div></section>';
    }
    var types = engine.types || [];
    var order = (engine.priority || []).map(function (key) {
      var found = types.filter(function (item) {
        return item.key === key;
      })[0];
      return found ? found.label : key;
    }).join(" &gt; ");
    var segment = engine.segment || {};
    var cards = types.map(function (item) {
      var levelText = item.level === "high" ? "高" : item.level === "low" ? "低" : "中";
      return '<div class="dc-risk-engine-item"><div class="dc-risk-engine-head"><strong>' + escapeHtml(item.label) + '</strong><span class="dc-risk-engine-level">' + levelText + '</span></div>' + '<div class="dc-risk-engine-line">判定：' + escapeHtml(item.rule) + '</div>' + '<div class="dc-risk-engine-line dc-risk-engine-guard">防误判：' + escapeHtml(item.guard) + '</div></div>';
    }).join("");
    return '<section class="dc-risk-config-block"><h3>风险引擎规则（判定顺序：' + order + '）</h3>' + '<div class="dc-risk-engine-grid">' + cards + '</div>' + '<div class="dc-risk-rule-add" style="margin-top:10px">' + '<label>分片聚合：同一角色 <input type="number" min="30" max="3600" data-risk-segment-window value="' + (draft.segment_window_sec || segment.window_sec || 300) + '" /> 秒内、最多 ' + '<input type="number" min="1" max="100" data-risk-segment-max value="' + (draft.segment_max_msgs || segment.max_msgs || 10) + '" /> 条拼成一段</label>' + '<label>刷屏阈值：同段相同内容重复 ≥ <input type="number" min="2" max="20" data-risk-repeat-threshold value="' + (draft.repeat_threshold || 3) + '" /> 次</label></div></section>';
  }
  function riskConfigMarkup() {
    if (!riskConfigOpen) return "";
    var draft = riskRuleDraft;
    var counts = sourceCounts || {
      chat: 0,
      item: 0,
      ip: 0
    };
    var body;
    if (riskConfigError) {
      body = '<div class="dc-risk-config-error">' + escapeHtml(riskConfigError) + '</div>';
    } else if (!draft) {
      body = '<div class="dc-risk-config-loading">正在读取规则…</div>';
    } else {
      var limits = draft.limits || {};
      body = '<section class="dc-risk-config-block"><h3>数据路径（本次查询）</h3><div class="dc-risk-path">' + '<div class="dc-risk-path-row"><strong>聊天</strong>读取 ' + number(counts.chat) + ' 条 → 命中关键词规则 ' + draft.chat.length + ' 条 → 输出违规类型 / 词云</div>' + '<div class="dc-risk-path-row"><strong>物品</strong>读取 ' + number(counts.item) + ' 条 → 命中动作 ' + escapeHtml(draft.item_actions.join(" / ") || "—") + ' → 输出物品丢弃</div>' + '<div class="dc-risk-path-row"><strong>IP</strong>读取 ' + number(counts.ip) + ' 条 → 同区服同IP角色数 ≥ ' + draft.ip_role_threshold + ' → 输出同IP多角色</div>' + '<div class="dc-risk-path-row"><strong>充值</strong>累计充值 &lt; ' + draft.recharge_threshold + ' 元 → 输出低充值关联</div>' + '<div class="dc-risk-path-row"><strong>读取上限</strong>单次最多 ' + (limits.max_days || 7) + ' 天、每类最多 ' + (limits.max_records_per_source || 500) + ' 条、每页 ' + (limits.page_size || 100) + ' 条</div>' + '</div></section>' + riskEngineMarkup() + '<section class="dc-risk-config-block"><h3>聊天敏感词（命中即入违规类型）</h3><div class="dc-risk-rule-list">' + (draft.chat.map(riskRuleChipHtml).join("") || '<em>暂无规则</em>') + '</div><div class="dc-risk-rule-add"><input data-risk-rule-word placeholder="关键词；多个词用 · 连接表示需同时命中" style="width:260px" />' + '<select data-risk-rule-category><option value="引流">引流</option><option value="联系方式">联系方式</option><option value="交易风险">交易风险</option><option value="手拉">手拉</option><option value="商人">商人</option><option value="工作室">工作室</option></select>' + '<select data-risk-rule-level><option value="medium">中</option><option value="high">高</option><option value="low">低</option></select>' + '<button type="button" class="dc-hr-btn" data-risk-rule-add>添加</button></div></section>' + '<section class="dc-risk-config-block"><h3>物品动作规则</h3><div class="dc-risk-rule-list">' + (draft.item_actions.map(riskItemChipHtml).join("") || '<em>暂无规则</em>') + '</div><div class="dc-risk-rule-add"><input data-risk-item-word placeholder="物品动作关键词，如 丢弃" style="width:200px" />' + '<button type="button" class="dc-hr-btn" data-risk-item-add>添加</button></div></section>' + riskListSection("引流引导词", "guides", "如 微信、vx、绿泡泡", "必须与“像账号的串”同时出现才判命中") + riskListSection("交易意图词", "trade", "如 收、卖、代练、回收") + riskListSection("系统消息白名单", "whitelist", "如 mapName（命中整段跳过）") + '<section class="dc-risk-config-block"><h3>阈值</h3><div class="dc-risk-rule-add">' + '<label>同IP角色数 ≥ <input type="number" min="2" max="200" data-risk-ip-threshold value="' + draft.ip_role_threshold + '" /></label>' + '<label>低充值线 &lt; <input type="number" min="0" max="1000000" data-risk-recharge-threshold value="' + draft.recharge_threshold + '" /> 元</label>' + '</div></section>';
    }
    return '<div class="dc-risk-config-mask" data-risk-config-close></div>' + '<aside class="dc-risk-config" role="dialog" aria-label="风控配置">' + '<div class="dc-risk-config-head"><h2>风控配置 · 数据路径</h2>' + '<button type="button" class="dc-risk-config-close" data-risk-config-close aria-label="关闭">×</button></div>' + '<div class="dc-risk-config-body">' + body + '</div>' + '<div class="dc-risk-config-foot">' + '<button type="button" class="dc-hr-btn" data-risk-config-reset>恢复默认</button>' + '<button type="button" class="dc-hr-btn primary" data-risk-config-save' + (riskConfigBusy ? " disabled" : "") + '>' + (riskConfigBusy ? "处理中…" : "保存规则") + '</button></div></aside>';
  }
  async function saveRiskRules(root) {
    if (!riskRuleDraft || riskConfigBusy) return;
    var ipInput = root.querySelector("[data-risk-ip-threshold]");
    var rechargeInput = root.querySelector("[data-risk-recharge-threshold]");
    var windowInput = root.querySelector("[data-risk-segment-window]");
    var maxMsgsInput = root.querySelector("[data-risk-segment-max]");
    var repeatInput = root.querySelector("[data-risk-repeat-threshold]");
    var payload = {
      chat: riskRuleDraft.chat,
      guides: riskRuleDraft.guides,
      trade: riskRuleDraft.trade,
      whitelist: riskRuleDraft.whitelist,
      item_actions: riskRuleDraft.item_actions,
      ip_role_threshold: Number(ipInput ? ipInput.value : riskRuleDraft.ip_role_threshold) || 4,
      recharge_threshold: Number(rechargeInput ? rechargeInput.value : riskRuleDraft.recharge_threshold) || 0,
      segment_window_sec: Number(windowInput ? windowInput.value : riskRuleDraft.segment_window_sec) || 300,
      segment_max_msgs: Number(maxMsgsInput ? maxMsgsInput.value : riskRuleDraft.segment_max_msgs) || 10,
      repeat_threshold: Number(repeatInput ? repeatInput.value : riskRuleDraft.repeat_threshold) || 3
    };
    riskConfigBusy = true;
    riskConfigError = "";
    renderRoot(root);
    var failed = "";
    try {
      var response = await fetch("/api/v1/risk-dashboard/rules", {
        method: "PUT",
        cache: "no-store",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      var body = await response.json();
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "规则保存失败");
    } catch (error) {
      failed = error.message || "规则保存失败";
    }
    riskConfigBusy = false;
    if (failed) {
      riskConfigError = failed;
      renderRoot(root);
      return;
    }
    riskConfigError = "";
    await loadRiskRules(root);
    if (selectedGameId && !queryBusy) await queryRiskDashboard(root);
  }
  function pageMarkup() {
    var gameOptions = '<option value="">请选择游戏</option>' + sourceGames.map(function (game) {
      var label = game.project ? game.project + ' · ' + game.name : game.name;
      return '<option value="' + escapeHtml(game.id) + '"' + (selectedGameId === game.id ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
    }).join("");
    var zoneOptions = '<option value="">全部区服</option>' + sourceZones.map(function (zone) {
      return '<option value="' + escapeHtml(zone.id) + '"' + (selectedZoneId === zone.id ? ' selected' : '') + '>' + escapeHtml(zone.name) + '</option>';
    }).join("");
    var fetchedText = sourceFetchedAt ? '；更新 ' + escapeHtml(sourceFetchedAt.replace('T', ' ').slice(0, 19)) : '';
    var stateText = queryBusy ? '正在读取真实数据并执行风险模型…' : queryError ? escapeHtml(queryError) : loaded ? '当前系统已联动 · 聊天 ' + sourceCounts.chat + ' / 物品 ' + sourceCounts.item + ' / IP ' + sourceCounts.ip + (sourceComplete ? '' : '（达到单次读取上限）') + fetchedText : selectedGameId ? '已选择项目，点击“查询”出图' : sourceGames.length ? '请选择「当前项目」后点击查询' : '首次使用请点击“查询”加载项目列表';
    var body = queryError ? '<section class="dc-hr-empty"><div><strong>查询失败</strong><span>' + escapeHtml(queryError) + '</span></div></section>' : !loaded ? '<section class="dc-hr-empty"><div><strong>' + (queryBusy ? '正在评估真实风险数据' : '等待查询') + '</strong><span>' + (queryBusy ? '正在读取聊天、物品和IP记录' : '选择「当前项目」、日期范围与区服后，点击“查询”出图') + '</span></div></section>' : riskSignalMarkup() + dashboardMarkup();
    return '<header class="dc-hr-head"><div><div class="dc-hr-title"><h1>风控看板</h1><span class="dc-hr-badge">真实数据</span></div><p class="dc-hr-sub">风险态势、处置分布与处置集中度分析</p></div></header>' + '<div class="dc-pro-notice">风险记录由本系统聊天、物品、IP与充值信号汇总；处理状态为多选字段，查看账号规模时以角色ID去重结果为准。</div>' + '<div class="dc-pro-filter"><label>当前项目<select data-risk-game aria-label="当前项目">' + gameOptions + '</select></label>' + periodPickerMarkup("overview", selectedPeriod) + '<label>区服范围<select data-risk-zone aria-label="区服范围">' + zoneOptions + '</select></label><button class="dc-hr-btn" data-risk-config type="button">风控配置</button><button class="dc-hr-btn" data-risk-query type="button"' + (queryBusy ? ' disabled' : '') + '>' + (queryBusy ? loaded ? '刷新中' : '查询中' : loaded ? '刷新' : '查询') + '</button><span class="dc-pro-filter-state"><span class="dc-pro-source">' + stateText + '</span></span></div><div data-body>' + body + '</div>' + riskConfigMarkup();
  }
  function renderRoot(root) {
    if (riskWordCloudChart) {
      riskWordCloudChart.dispose();
      riskWordCloudChart = null;
    }
    root.dataset.page = "dashboard";
    root.innerHTML = pageMarkup();
    if (loaded && riskWordCloudData.length) mountRiskWordCloud(root);
    markEvidenceJumps(root);
  }
  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "")
    };
  }
  var gamesLoading = false;
  var gamesSettled = false;
  async function loadRiskGames(root) {
    // manual-query-marker 只准备项目列表：看板必须由用户点击“查询”后才出图，不再自动选项目或自动出图。
    // 项目列表一次请求只要一个结论：请求中或已有结论（含空列表、失败）都不再自动重发。
    if (gamesLoading || gamesSettled) return;
    gamesLoading = true;
    try {
      var response = await fetch("/api/v1/risk-dashboard/games", {
        method: "POST",
        cache: "no-store",
        headers: authHeaders(),
        body: "{}"
      });
      var body = await response.json();
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "游戏列表读取失败");
      sourceGames = body.data.games || [];
      queryError = sourceGames.length ? "" : "当前账号没有可查询的项目，请联系管理员确认项目权限";
    } catch (error) {
      queryError = error.message || "游戏列表读取失败";
    } finally {
      gamesLoading = false;
      gamesSettled = true;
      renderRoot(root);
    }
  }
  async function loadRiskZones(root) {
    sourceZones = [];
    selectedZoneId = "";
    if (!selectedGameId) {
      renderRoot(root);
      return;
    }
    renderRoot(root);
    try {
      var response = await fetch("/api/v1/risk-dashboard/options", {
        method: "POST",
        cache: "no-store",
        headers: authHeaders(),
        body: JSON.stringify({
          gameId: Number(selectedGameId)
        })
      });
      var body = await response.json();
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "区服列表读取失败");
      sourceZones = body.data.zones || [];
      renderRoot(root);
    } catch (error) {
      queryError = error.message || "区服列表读取失败";
      renderRoot(root);
    }
  }
  async function queryRiskDashboard(root) {
    if (queryBusy) return;
    if (!selectedGameId) {
      queryError = "请先选择「当前项目」，再点击查询";
      renderRoot(root);
      return;
    }
    queryBusy = true;
    queryError = "";
    loaded = false;
    renderRoot(root);
    try {
      var range = dateRanges.overview;
      var response = await fetch("/api/v1/risk-dashboard/query", {
        method: "POST",
        cache: "no-store",
        headers: authHeaders(),
        body: JSON.stringify({
          gameId: Number(selectedGameId),
          serverId: selectedZoneId,
          start: range[0],
          end: range[1]
        })
      });
      var body = await response.json();
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "真实风险数据查询失败");
      var data = body.data;
      periods = {};
      violationDetails = {};
      statusDetails = {};
      periods[selectedPeriod] = data.period;
      selectedViolationPeriod = selectedPeriod;
      selectedStatusPeriod = selectedPeriod;
      dateRanges.violation = range.slice();
      dateRanges.status = range.slice();
      violationDetails[selectedPeriod] = data.violationDetails || {};
      statusDetails[selectedPeriod] = data.statusDetails || {};
      selectedViolationByPeriod[selectedPeriod] = data.period.violations.length ? data.period.violations[0][0] : "暂无命中";
      selectedStatusByPeriod[selectedPeriod] = data.period.statuses.length ? data.period.statuses[0][0] : "暂无状态";
      riskWordCloudData = data.wordCloud || [];
      scatterData = data.scatter || [];
      trendData = data.trend || [];
      riskCases = data.riskCases || [];
      selectedRiskCaseId = riskCases.length ? riskCases[0].id : "";
      sourceCounts = data.sources || {
        chat: 0,
        item: 0,
        ip: 0
      };
      sourceComplete = data.complete === true;
      sourceFetchedAt = data.fetchedAt || "";
      loaded = true;
    } catch (error) {
      queryError = error.message || "真实风险数据查询失败";
    } finally {
      queryBusy = false;
      renderRoot(root);
    }
  }
  function setPeriod(kind, period, start, end) {
    var from = start,
      to = end;
    if (from && to) {
      var span = Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86400000) + 1;
      if (span > 7) {
        var shifted = new Date(Date.parse(to + "T00:00:00Z") - 6 * 86400000);
        from = shifted.getUTCFullYear() + "-" + String(shifted.getUTCMonth() + 1).padStart(2, "0") + "-" + String(shifted.getUTCDate()).padStart(2, "0");
      }
    }
    dateRanges.overview = [from, to];
    dateRanges.violation = [from, to];
    dateRanges.status = [from, to];
    selectedPeriod = periodForDates(from, to);
    selectedViolationPeriod = selectedPeriod;
    selectedStatusPeriod = selectedPeriod;
    loaded = false;
    queryError = "";
  }
  function periodForDates(start, end) {
    var days = Math.round((Date.parse(end + "T00:00:00Z") - Date.parse(start + "T00:00:00Z")) / 86400000) + 1;
    if (days <= 1) return "yesterday";
    if (days <= 7) return "week";
    return "month";
  }
  function bindRoot(root) {
    if (root.dataset.bound) return;
    root.dataset.bound = "1";
    root.addEventListener("click", function (event) {
      var queryButton = event.target.closest("[data-risk-query]");
      if (queryButton) {
        if (!sourceGames.length) {
          gamesSettled = false;
          loadRiskGames(root);
          return;
        }
        queryRiskDashboard(root);
        return;
      }
      if (event.target.closest("[data-risk-config]")) {
        riskConfigOpen = true;
        renderRoot(root);
        if (!riskRuleDraft && !riskConfigBusy) loadRiskRules(root);
        return;
      }
      if (event.target.closest("[data-risk-config-close]")) {
        riskConfigOpen = false;
        renderRoot(root);
        return;
      }
      if (event.target.closest("[data-risk-config-save]")) {
        saveRiskRules(root);
        return;
      }
      if (event.target.closest("[data-risk-config-reset]")) {
        if (riskRuleDefaults) {
          riskRuleDraft = {
            chat: (riskRuleDefaults.chat || []).map(function (row) {
              return [row[0] || "", row[1] || "", row[2] || "medium"];
            }),
            guides: (riskRuleDefaults.guides || []).map(function (row) {
              return [row[0] || "", row[1] || "引流", row[2] || "medium"];
            }),
            trade: (riskRuleDefaults.trade || []).slice(),
            whitelist: (riskRuleDefaults.whitelist || []).slice(),
            item_actions: (riskRuleDefaults.item_actions || []).slice(),
            ip_role_threshold: riskRuleDefaults.ip_role_threshold,
            recharge_threshold: riskRuleDefaults.recharge_threshold,
            segment_window_sec: riskRuleDefaults.segment_window_sec || 300,
            segment_max_msgs: riskRuleDefaults.segment_max_msgs || 10,
            repeat_threshold: riskRuleDefaults.repeat_threshold || 3,
            limits: riskRuleDraft ? riskRuleDraft.limits : {}
          };
        }
        renderRoot(root);
        return;
      }
      if (event.target.closest("[data-risk-rule-add]")) {
        var ruleWordInput = root.querySelector("[data-risk-rule-word]");
        var ruleCategoryInput = root.querySelector("[data-risk-rule-category]");
        var ruleLevelInput = root.querySelector("[data-risk-rule-level]");
        var ruleWord = ruleWordInput ? ruleWordInput.value.trim() : "";
        if (ruleWord && riskRuleDraft) {
          riskRuleDraft.chat.push([ruleWord, ruleCategoryInput ? ruleCategoryInput.value : "引流", ruleLevelInput ? ruleLevelInput.value : "medium"]);
        }
        renderRoot(root);
        return;
      }
      var ruleRemove = event.target.closest("[data-risk-rule-remove]");
      if (ruleRemove && riskRuleDraft) {
        riskRuleDraft.chat.splice(Number(ruleRemove.dataset.riskRuleRemove), 1);
        renderRoot(root);
        return;
      }
      if (event.target.closest("[data-risk-item-add]")) {
        var itemWordInput = root.querySelector("[data-risk-item-word]");
        var itemWord = itemWordInput ? itemWordInput.value.trim() : "";
        if (itemWord && riskRuleDraft) riskRuleDraft.item_actions.push(itemWord);
        renderRoot(root);
        return;
      }
      var itemRemove = event.target.closest("[data-risk-item-remove]");
      if (itemRemove && riskRuleDraft) {
        riskRuleDraft.item_actions.splice(Number(itemRemove.dataset.riskItemRemove), 1);
        renderRoot(root);
        return;
      }
      var listAdd = event.target.closest("[data-risk-list-add]");
      if (listAdd && riskRuleDraft) {
        var listName = listAdd.dataset.riskListAdd;
        var listInput = root.querySelector('[data-risk-list-input="' + listName + '"]');
        var listValue = listInput ? listInput.value.trim() : "";
        if (listValue && riskRuleDraft[listName]) {
          if (listName === "guides") riskRuleDraft.guides.push([listValue, "引流", "medium"]);else riskRuleDraft[listName].push(listValue);
        }
        renderRoot(root);
        return;
      }
      var listRemove = event.target.closest("[data-risk-list-remove]");
      if (listRemove && riskRuleDraft) {
        var removeParts = String(listRemove.dataset.riskListRemove || "").split(":");
        var removeName = removeParts[0];
        var removeIndex = Number(removeParts[1]);
        if (riskRuleDraft[removeName] && !isNaN(removeIndex)) {
          riskRuleDraft[removeName].splice(removeIndex, 1);
        }
        renderRoot(root);
        return;
      }
      var periodToggle = event.target.closest("[data-period-toggle]");
      if (periodToggle) {
        var toggleKind = periodToggle.dataset.periodToggle;
        openPeriodPicker = openPeriodPicker === toggleKind ? "" : toggleKind;
        pendingRangeStart = "";
        calendarMonthOffset = 0;
        renderRoot(root);
        return;
      }
      var shortcut = event.target.closest("[data-period-shortcut]");
      if (shortcut) {
        setPeriod(shortcut.dataset.kind, shortcut.dataset.periodShortcut, shortcut.dataset.start, shortcut.dataset.end);
        openPeriodPicker = "";
        pendingRangeStart = "";
        renderRoot(root);
        return;
      }
      var shift = event.target.closest("[data-calendar-shift]");
      if (shift) {
        calendarMonthOffset += Number(shift.dataset.calendarShift || 0);
        renderRoot(root);
        return;
      }
      var day = event.target.closest("[data-range-day]");
      if (day) {
        var dayKind = day.dataset.kind;
        var dayValue = day.dataset.rangeDay;
        if (!pendingRangeStart) {
          pendingRangeStart = dayValue;
          dateRanges[dayKind] = [dayValue, dayValue];
        } else {
          var start = pendingRangeStart < dayValue ? pendingRangeStart : dayValue;
          var end = pendingRangeStart < dayValue ? dayValue : pendingRangeStart;
          setPeriod(dayKind, periodForDates(start, end), start, end);
          pendingRangeStart = "";
          openPeriodPicker = "";
        }
        renderRoot(root);
        return;
      }
      var queueFilter = event.target.closest("[data-risk-queue-filter]");
      if (queueFilter) {
        selectedRiskQueueFilter = queueFilter.dataset.riskQueueFilter || "all";
        renderRoot(root);
        return;
      }
      var riskCase = event.target.closest("[data-risk-case]");
      if (riskCase) {
        selectedRiskCaseId = riskCase.dataset.riskCase || "";
        renderRoot(root);
        return;
      }
      var evidenceJump = event.target.closest(".dc-risk-evidence-item.is-jump");
      if (evidenceJump) {
        openChatEvidence(evidenceJump);
        return;
      }
      var violationChart = event.target.closest("[data-violation-chart]");
      if (violationChart) {
        selectedViolationChart = violationChart.dataset.violationChart || "rank";
        renderRoot(root);
        return;
      }
      var statusChart = event.target.closest("[data-status-chart]");
      if (statusChart) {
        selectedStatusChart = statusChart.dataset.statusChart || "rank";
        renderRoot(root);
        return;
      }
      var violation = event.target.closest("[data-violation-open]");
      if (violation) {
        selectedViolationByPeriod[selectedViolationPeriod] = violation.dataset.violation || "IP关联商人";
        renderRoot(root);
        return;
      }
      var status = event.target.closest("[data-status-open]");
      if (status) {
        selectedStatusByPeriod[selectedStatusPeriod] = status.dataset.status || "永久封禁";
        renderRoot(root);
        return;
      }
      var close = event.target.closest("[data-detail-close]");
      if (close || event.target.matches("[data-detail-overlay]")) {
        detailOpen = false;
        renderRoot(root);
        return;
      }
      if (openPeriodPicker && !event.target.closest(".dc-period-field")) {
        openPeriodPicker = "";
        pendingRangeStart = "";
        renderRoot(root);
      }
    });
    root.addEventListener("change", function (event) {
      if (event.target.matches("[data-risk-game]")) {
        selectedGameId = event.target.value;
        loaded = false;
        queryError = "";
        loadRiskZones(root);
      } else if (event.target.matches("[data-risk-zone]")) {
        selectedZoneId = event.target.value;
        loaded = false;
        queryError = "";
        renderRoot(root);
      }
    });
    root.addEventListener("input", function (event) {
      if (!event.target.matches("[data-detail-search]")) return;
      detailKeyword = event.target.value || "";
      renderRoot(root);
    });
  }
  function openPage(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (!isRoute()) history.pushState({}, "", ROUTE);
    renderRoute();
  }
  function openRiskPage(path, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (location.pathname !== path) history.pushState({}, "", path);
    renderRoute();
  }
  function ensureTopMenu() {
    var existing = Array.prototype.find.call(document.querySelectorAll("header .ant-menu-item"), function (item) {
      return (item.textContent || "").trim() === "风控质检";
    });
    if (existing) {
      if (existing.dataset.dcRiskDefaultBound) {
        existing.removeEventListener("click", openPage, true);
        delete existing.dataset.dcRiskDefaultBound;
      }
      return existing;
    }
    var menu = document.querySelector("header ul.ant-menu");
    if (!menu) return null;
    var item = document.createElement("li");
    item.id = TOP_ID;
    item.className = "ant-menu-overflow-item ant-menu-item";
    item.setAttribute("role", "menuitem");
    item.innerHTML = '<span class="ant-menu-title-content">风控质检</span>';
    item.addEventListener("click", openPage, true);
    var first = menu.querySelector(".ant-menu-item");
    if (first && first.nextSibling) menu.insertBefore(item, first.nextSibling);else menu.appendChild(item);
    return item;
  }
  function ensureSideMenu() {
    var side = document.querySelector("aside ul.ant-menu,.ant-layout-sider ul.ant-menu");
    if (!side) return null;
    Array.prototype.forEach.call(side.children, function (child) {
      if (!child.classList.contains("dc-hero-risk-nav")) child.classList.add("dc-risk-original-menu-hidden");
    });
    var allowed = riskItems;
    if (window.__DC_NAVIGATION__ && typeof window.__DC_NAVIGATION__.items === "function") {
      allowed = window.__DC_NAVIGATION__.items(riskItems);
    }
    allowed.forEach(function (config, index) {
      var itemId = config.key === ROUTE ? MENU_ID : "dc-risk-nav-" + index;
      var item = document.getElementById(itemId);
      if (!item || item.parentNode !== side) {
        item = document.createElement("li");
        item.id = itemId;
        item.className = "ant-menu-item dc-hero-risk-nav";
        item.setAttribute("role", "menuitem");
        item.dataset.route = config.key;
        item.innerHTML = '<span class="dc-risk-nav-icon" aria-hidden="true">' + config.icon + '</span><span class="ant-menu-title-content">' + config.label + '</span>';
        item.addEventListener("click", function (event) {
          openRiskPage(config.key, event);
        }, true);
        side.appendChild(item);
      }
      item.classList.toggle("ant-menu-item-selected", location.pathname === config.key);
    });
    return document.querySelector('.dc-hero-risk-nav[data-route="' + location.pathname + '"]');
  }
  function restoreSideMenu() {
    document.querySelectorAll(".dc-risk-original-menu-hidden").forEach(function (item) {
      item.classList.remove("dc-risk-original-menu-hidden");
    });
    document.querySelectorAll(".dc-hero-risk-nav").forEach(function (item) {
      item.remove();
    });
  }
  function promoteQualityMenuItem() {
    var side = document.querySelector("aside ul.ant-menu,.ant-layout-sider ul.ant-menu");
    if (!side) return;
    var quality = Array.prototype.find.call(side.children, function (item) {
      var text = (item.textContent || "").trim();
      return text === "员工质检" || text === "风控看板";
    });
    if (quality) {
      var title = quality.querySelector(".ant-menu-title-content");
      if (title) title.textContent = "\u98ce\u63a7\u770b\u677f";
    }
    if (quality && side.firstElementChild !== quality) side.insertBefore(quality, side.firstElementChild);
  }
  function showPage() {
    var content = host();
    if (!content) return;
    var root = document.getElementById(ROOT_ID);
    if (!root || root.parentNode !== content) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      renderRoot(root);
      bindRoot(root);
      content.appendChild(root);
    }
    if (root.dataset.page !== "dashboard") renderRoot(root);
    Array.prototype.forEach.call(content.children, function (child) {
      if (child !== root) child.classList.add("dc-hero-risk-host-hidden");
    });
    root.hidden = false;
    var top = ensureTopMenu();
    restoreSideMenu();
    promoteQualityMenuItem();
    document.querySelectorAll("header .ant-menu-item-selected").forEach(function (item) {
      if (item !== top) item.classList.remove("ant-menu-item-selected");
    });
    if (top) top.classList.add("ant-menu-item-selected");
  }
  function hidePage(keepRiskNavigation) {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) {
        if (child !== root) child.classList.remove("dc-hero-risk-host-hidden");
      });
      root.hidden = true;
    }
    restoreSideMenu();
    if (!keepRiskNavigation) {
      [document.getElementById(TOP_ID), document.getElementById(MENU_ID)].forEach(function (item) {
        if (item) item.classList.remove("ant-menu-item-selected");
      });
    }
  }
  function installModuleTransition() {
    if (window.__dcRiskModuleTransitionInstalled) return;
    window.__dcRiskModuleTransitionInstalled = true;
    document.addEventListener("click", function (event) {
      var item = event.target && event.target.closest && event.target.closest("header .ant-menu-item");
      if (!item || item.classList.contains("ant-menu-item-selected")) return;
      clearTimeout(window.__dcRiskModuleTransitionTimer);
      clearTimeout(window.__dcRiskModuleTransitionEnterTimer);
      document.body.classList.remove("dc-module-transition-enter");
      document.body.classList.add("dc-module-transition-leave");
      window.__dcRiskModuleTransitionTimer = setTimeout(function () {
        document.body.classList.remove("dc-module-transition-leave");
        document.body.classList.add("dc-module-transition-enter");
        window.__dcRiskModuleTransitionEnterTimer = setTimeout(function () {
          document.body.classList.remove("dc-module-transition-enter");
        }, 180);
      }, 72);
    }, true);
  }
  function showIpPage() {
    var content = host();
    if (!content) return;
    var root = document.getElementById(ROOT_ID);
    if (!root || root.parentNode !== content) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      bindRoot(root);
      content.appendChild(root);
    }
    if (root.dataset.page !== "ip") {
      root.dataset.page = "ip";
      root.innerHTML = '<section class="dc-hr-empty"><div><strong>正在读取IP日志查询条件...</strong></div></section>';
      if (window.DCIpLibrary) window.DCIpLibrary.mount(root);else {
        var script = document.createElement("script");
        script.src = "/ip-library.js?v=20261006-rate-limit-lazy-v1";
        script.onload = function () {
          window.DCIpLibrary.mount(root);
        };
        script.onerror = function () {
          root.innerHTML = '<section class="dc-hr-empty"><div><strong>IP库资源加载失败</strong><span>请刷新后重试。</span></div></section>';
        };
        document.head.appendChild(script);
      }
    }
    Array.prototype.forEach.call(content.children, function (child) {
      if (child !== root) child.classList.add("dc-hero-risk-host-hidden");
    });
    root.hidden = false;
  }
  function installDictionaryTab() {
    var tablist = document.querySelector('[role="tablist"]');
    var content = host();
    if (!tablist || !content) return;
    var tab = document.getElementById("dc-risk-dictionary-tab");
    if (!tab) {
      var sourceTab = tablist.querySelector('[role="tab"]');
      if (!sourceTab || !sourceTab.parentElement) return;
      var item = sourceTab.parentElement.cloneNode(true);
      item.classList.remove("ant-tabs-tab-active");
      tab = item.querySelector('[role="tab"]');
      tab.id = "dc-risk-dictionary-tab";
      tab.removeAttribute("aria-controls");
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "0");
      tab.textContent = "风控索引";
      item.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelectorAll('.ant-tabs-tab').forEach(function (node) {
          node.classList.remove("ant-tabs-tab-active");
        });
        document.querySelectorAll('[role="tab"]').forEach(function (node) {
          node.setAttribute("aria-selected", "false");
        });
        item.classList.add("ant-tabs-tab-active");
        tab.setAttribute("aria-selected", "true");
        var holder = content.querySelector(".ant-tabs-content-holder");
        if (holder) holder.hidden = true;
        var panel = document.getElementById("dc-risk-dictionary-panel");
        if (panel) panel.hidden = false;
      }, true);
      tablist.appendChild(item);
    }
    var panel = document.getElementById("dc-risk-dictionary-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "dc-risk-dictionary-panel";
      panel.hidden = true;
      panel.innerHTML = dictionaryMarkup();
      content.appendChild(panel);
      content.addEventListener("click", function (event) {
        var selected = event.target.closest && event.target.closest('[role="tab"]');
        if (!selected || selected.id === "dc-risk-dictionary-tab") return;
        setTimeout(function () {
          panel.hidden = true;
          var holder = content.querySelector(".ant-tabs-content-holder");
          if (holder) holder.hidden = false;
        }, 0);
      }, true);
    }
  }
  function renderRoute() {
    ensureTopMenu();
    if (restoreEntryRoute && host()) {
      restoreEntryRoute = false;
      if (location.pathname === "/") history.replaceState({}, "", ROUTE);
    }
    if (isRiskRoute()) {
      var top = ensureTopMenu();
      if (top) top.classList.add("ant-menu-item-selected");
    }
    if (isRoute()) showPage();else if (location.pathname === "/risk/ip-library") showIpPage();else if (isDictionaryRoute()) {
      hidePage(false);
      installDictionaryTab();
    } else hidePage(isRiskRoute());
  }
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(renderRoute, 40);
  }
  installStyle();
  installModuleTransition();
  window.addEventListener("resize", function () {
    if (riskWordCloudChart) riskWordCloudChart.resize();
  });
  window.addEventListener("popstate", scheduleSync);
  document.addEventListener("click", function (event) {
    if (event.target && event.target.closest && !event.target.closest("#" + TOP_ID + ",#" + MENU_ID)) scheduleSync();
  }, true);
  new MutationObserver(scheduleSync).observe(document.body, {
    childList: true,
    subtree: true
  });
  renderRoute();
})();
