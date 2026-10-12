(function () {
  "use strict";
  var ROUTE = "/business/sdk-game-analysis";
  var DETAIL_ROUTE = "/business/sdk-game-analysis/game-detail";
  var MENU_ID = "dc-sdk-analysis-menu";
  var ROOT_ID = "dc-sdk-analysis-root";
  var STYLE_ID = "dc-sdk-analysis-style";
  var timer = 0;

  function css() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-sdk-hidden{display:none!important}",
      "#dc-sdk-analysis-root{min-height:calc(100vh - 56px);padding:18px 22px 28px;background:#f3f5f8;color:#303744;box-sizing:border-box}",
      "#dc-sdk-analysis-root *{box-sizing:border-box}",
      ".dc-sdk-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}",
      ".dc-sdk-title{display:flex;align-items:center;gap:9px}.dc-sdk-title svg{width:22px;color:#1677ff}.dc-sdk-title h1{margin:0;font-size:20px}",
      ".dc-sdk-back{width:34px;height:34px;border:1px solid #d9dfe8;border-radius:6px;background:#fff;color:#475467;cursor:pointer;font-size:18px}.dc-sdk-back:hover{border-color:#1677ff;color:#1677ff}",
      ".dc-sdk-source{font-size:12px;color:#8b95a5;text-align:right}",
      ".dc-sdk-toolbar{display:flex;justify-content:flex-end;gap:10px;padding:12px 16px;background:#fff;border:1px solid #e8ebf0;border-radius:8px 8px 0 0}",
      ".dc-sdk-control{height:34px;min-width:190px;padding:0 10px;border:1px solid #d9dfe8;border-radius:5px;background:#fff;color:#3b4453;outline:none}",
      ".dc-sdk-control:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.1)}",
      ".dc-sdk-tabs{display:flex;gap:30px;padding:0 16px;background:#fff;border:1px solid #e8ebf0;border-top:0}",
      ".dc-sdk-tab{height:48px;border:0;border-bottom:2px solid #1677ff;background:transparent;color:#1677ff;font-weight:600}",
      ".dc-sdk-notice{margin:12px 0;padding:10px 13px;border-radius:6px;background:#fff7e6;color:#ad6800;font-size:13px}",
      ".dc-sdk-cards{display:grid;grid-template-columns:repeat(4,minmax(210px,1fr));gap:12px;margin:14px 0}",
      ".dc-sdk-card{min-height:142px;padding:17px 18px;background:#fff;border:1px solid #e8ebf0;border-radius:7px;box-shadow:0 1px 4px rgba(16,24,40,.04)}",
      ".dc-sdk-card-label{font-size:14px;color:#5c6573}.dc-sdk-card-date{margin-top:6px;font-size:12px;color:#9aa3af}",
      ".dc-sdk-card-value{margin:8px 0 10px;font-size:28px;line-height:32px;color:#2f3742}.dc-sdk-card-value small{font-size:15px;margin-left:4px}",
      ".dc-sdk-card-meta{display:flex;gap:16px;color:#a0a7b2;font-size:12px;white-space:nowrap}.dc-sdk-card-meta b{color:#667085;font-weight:500}",
      ".dc-sdk-panel{background:#fff;border:1px solid #e8ebf0;border-radius:7px;overflow:hidden}",
      ".dc-sdk-panel-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid #eef0f3}",
      ".dc-sdk-panel-head strong{font-size:16px}.dc-sdk-range{display:flex;align-items:center;gap:8px;color:#98a2b3;font-size:13px}",
      ".dc-sdk-range input{width:140px}.dc-sdk-btn{height:34px;padding:0 15px;border:1px solid #d9dfe8;border-radius:5px;background:#fff;color:#475467;cursor:pointer}",
      ".dc-sdk-btn:hover{border-color:#1677ff;color:#1677ff}.dc-sdk-table-wrap{overflow:auto;max-height:520px}",
      ".dc-sdk-table{width:100%;min-width:1480px;border-collapse:separate;border-spacing:0;font-size:13px}",
      ".dc-sdk-table th{position:sticky;top:0;z-index:2;padding:12px 10px;background:#f7f8fa;border-bottom:1px solid #e8ebf0;color:#3e4652;text-align:right;white-space:nowrap}",
      ".dc-sdk-table td{padding:11px 10px;border-bottom:1px solid #eef0f3;text-align:right;white-space:nowrap}.dc-sdk-table th:nth-child(2),.dc-sdk-table td:nth-child(2){text-align:left}",
      ".dc-sdk-game-link{padding:0;border:0;background:transparent;color:#1677ff;cursor:pointer;font:inherit}.dc-sdk-game-link:hover{text-decoration:underline}",
      ".dc-sdk-eval-hero{display:flex;align-items:center;gap:18px;margin:14px 0;padding:18px 20px;background:#fff;border:1px solid #e8ebf0;border-radius:7px}",
      ".dc-sdk-grade{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:#e8f3ff;color:#1677ff;font-size:28px;font-weight:700}",
      ".dc-sdk-eval-score{font-size:28px;font-weight:700;color:#273142}.dc-sdk-eval-score small{font-size:14px;color:#8b95a5;font-weight:500}",
      ".dc-sdk-eval-meta{display:flex;flex-wrap:wrap;gap:18px;color:#667085;font-size:13px}.dc-sdk-eval-meta b{color:#344054}",
      ".dc-sdk-eval-section{margin-top:14px}.dc-sdk-module-table{min-width:900px}.dc-sdk-module-table th,.dc-sdk-module-table td{text-align:left!important;vertical-align:top}",
      ".dc-sdk-module-name{font-weight:650;color:#1677ff;cursor:help}.dc-sdk-grade-tag{display:inline-flex;min-width:26px;justify-content:center;padding:2px 7px;border-radius:10px;background:#e8f3ff;color:#1677ff;font-weight:650}",
      ".dc-sdk-logic{margin:12px 16px 16px;padding:12px 14px;border:1px solid #e8ebf0;border-radius:6px;background:#fbfcfe;color:#667085;font-size:13px}.dc-sdk-logic summary{cursor:pointer;color:#344054;font-weight:650}.dc-sdk-logic p{margin:10px 0 0;line-height:1.6}",
      ".dc-sdk-eval-table{min-width:2100px}.dc-sdk-history-table{min-width:460px;width:100%}.dc-sdk-history-table th,.dc-sdk-history-table td{text-align:center!important}",
      ".dc-sdk-table tbody tr:hover td{background:#f7fbff}.dc-sdk-table tr.summary td{position:sticky;top:41px;z-index:1;background:#fbfcfe;font-weight:650}",
      ".dc-sdk-empty{padding:70px;text-align:center;color:#98a2b3}",
      "@media(max-width:1100px){.dc-sdk-cards{grid-template-columns:repeat(2,1fr)}}"
    ].join("");
    document.head.appendChild(style);
  }

  function esc(value) { return String(value == null ? "--" : value).replace(/[&<>\"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]; }); }
  function number(value, digits) { if (value == null || value === "") return "--"; return Number(value).toLocaleString("zh-CN", {maximumFractionDigits: digits == null ? 0 : digits}); }
  function money(value) { if (value == null) return "--"; var n=Number(value); return Math.abs(n)>=10000?number(n/10000,2)+"万":number(n,2); }
  function percent(value) { return value == null ? "--" : (Number(value)*100).toFixed(2).replace(/\.00$/,"")+"%"; }
  function metric(card, key) { var value=card[key]; return card.money?money(value):number(value,0); }
  function cardMarkup(card, date) {
    var month=card.month, unit=card.money&&card.value!=null&&Math.abs(card.value)<10000?" 元":"";
    return '<article class="dc-sdk-card"><div class="dc-sdk-card-label">'+esc(card.title)+'</div><div class="dc-sdk-card-date">'+esc(month?date.slice(0,7)+"月":date)+'</div><div class="dc-sdk-card-value">'+metric(card,"value")+'<small>'+unit+'</small></div><div class="dc-sdk-card-meta"><span>'+esc(month?"上月累计":"昨日同期")+' <b>'+metric(card,"previous")+'</b></span><span>'+esc(month?"历史累计":"七日均值")+' <b>'+metric(card,"seven_average")+'</b></span></div></article>';
  }
  var columns=[
    ["rank","排序"],["game_name","游戏名称"],["game_id","游戏ID"],["new_accounts","新账号数"],["new_paid_accounts","新账号付费数"],["new_paid_amount","新账号付费总额"],["new_paid_rate","新账号付费率"],["active_accounts","活跃账号数"],["paid_accounts","账号付费数"],["paid_times","账号付费次数"],["paid_amount","账号付费总额"],["paid_rate","付费率"],["arpu","ARPU"],["arppu","ARPPU"]
  ];
  var detailColumns=[
    ["date","日期"],["new_accounts","新账号数"],["new_paid_accounts","新账号付费数"],["new_paid_amount","新账号付费总额"],["new_paid_rate","新账号付费率"],["active_accounts","活跃账号数"],["paid_accounts","账号付费数"],["paid_times","账号付费次数"],["paid_amount","账号付费总额"],["paid_rate","付费率"],["arpu","ARPU"],["arppu","ARPPU"]
  ];
  function cell(row,key){ if(key.indexOf("rate")>=0)return percent(row[key]); if(key.indexOf("amount")>=0||key==="arpu"||key==="arppu")return number(row[key],2); return esc(row[key]); }
  function tableCell(row,key){if(key==="game_name"&&!row.is_summary)return '<button class="dc-sdk-game-link" data-game-link="'+esc(row.game_key||row.game_id)+'">'+esc(row.game_name)+'</button>';return cell(row,key);}
  function tableMarkup(rows){return '<table class="dc-sdk-table"><thead><tr>'+columns.map(function(c){return '<th>'+c[1]+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(row){return '<tr class="'+(row.is_summary?'summary':'')+'">'+columns.map(function(c){return '<td>'+tableCell(row,c[0])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}
  function detailTableMarkup(rows){return '<table class="dc-sdk-table"><thead><tr>'+detailColumns.map(function(c){return '<th>'+c[1]+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(row){return '<tr class="'+(row.is_summary?'summary':'')+'">'+detailColumns.map(function(c){return '<td>'+cell(row,c[0])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}
  var evaluationDailyColumns=[
    ["date","日期","text"],["dau","DAU","count"],["new_users","新用户","count"],["new_pay_rate","新用户付费率","pct"],["total_pay_rate","总付费率","pct"],["day1_ret_reg","次日留存","pct"],["day7_ret_reg","7日留存","pct"],["ltv1_mult","LTV1","decimal"],["old_user_ratio","老用户占比","pct"],["old_pay_rate","老付费率","pct"],["new_arpu","新账号ARPU","decimal"],["active_arpu","活跃ARPU","decimal"],["old_arpu","老账号ARPU","decimal"],["arppu","ARPPU","decimal"],["first_pay_count","首充账号数","count"],["new_first_pay_count","新账号首充数","count"],["behave_payers","付费人数","count"],["behave_pay_count","付费次数","count"]
  ];
  function plainMetric(value,digits){if(value==null||value==='')return '--';if(typeof value==='number')return number(value,digits==null?2:digits);return esc(value);}
  function dailyMetric(row,column){var value=row[column[0]],type=column[2];if(type==='pct')return value==null?'--':number(value,2)+'%';if(type==='count')return number(value,0);if(type==='decimal')return number(value,2);return esc(value);}
  function evaluationMarkup(data,dateFrom,dateTo,error){
    if(!data)return '<div class="dc-sdk-notice">'+esc(error||'评估模块数据暂不可用')+'</div>';
    var modules=data.modules||[],history=data.history||[],daily=(data.daily_metrics||[]).filter(function(row){return(!dateFrom||row.date>=dateFrom)&&(!dateTo||row.date<=dateTo);});
    var moduleRows=modules.map(function(module){var subs=module.sub_scores&&module.sub_scores.length?module.sub_scores:[{name:'暂无子指标',value:'--',grade:'--',def:''}];return subs.map(function(sub,index){return '<tr>'+(index===0?'<td rowspan="'+subs.length+'"><span class="dc-sdk-module-name" title="'+esc(module.def||'')+'">'+esc(module.name)+'</span></td><td rowspan="'+subs.length+'">'+plainMetric(module.weight_pct,0)+'%</td><td rowspan="'+subs.length+'">'+plainMetric(module.module_score_0_10,1)+'</td><td rowspan="'+subs.length+'"><span class="dc-sdk-grade-tag">'+esc(module.grade||'待')+'</span></td>':'')+'<td title="'+esc(sub.def||'')+'">'+esc(sub.name)+'</td><td>'+plainMetric(sub.value,3)+'</td><td><span class="dc-sdk-grade-tag">'+esc(sub.grade||'待')+'</span></td></tr>';}).join('');}).join('');
    var logic=modules.map(function(module){return '<p><b>'+esc(module.name)+'：</b>'+esc(module.def||'暂无口径说明')+'</p>';}).join('');
    var dailyRows=daily.map(function(row){return '<tr>'+evaluationDailyColumns.map(function(column){return '<td>'+dailyMetric(row,column)+'</td>';}).join('')+'</tr>';}).join('');
    var historyRows=history.map(function(row){return '<tr><td>'+esc(row.date)+'</td><td>'+plainMetric(row.total_score,2)+'</td><td><span class="dc-sdk-grade-tag">'+esc(row.grade||'待')+'</span></td></tr>';}).join('');
    return '<div class="dc-sdk-eval-hero"><div class="dc-sdk-grade">'+esc(data.grade||'待')+'</div><div><div class="dc-sdk-eval-score">'+plainMetric(data.total_score,2)+'<small> / '+plainMetric(data.available_weight,0)+' 综合评分</small></div><div class="dc-sdk-eval-meta"><span>数据日期 <b>'+esc(data.date||'--')+'</b></span><span>注册 <b>'+number(data.reg,0)+'</b></span><span>档位 <b>'+esc(data.tier||'--')+'</b></span><span>模块 <b>'+modules.length+' 个</b></span></div></div></div>'+
      '<section class="dc-sdk-panel dc-sdk-eval-section"><div class="dc-sdk-panel-head"><strong>8 模块评分</strong><span class="dc-sdk-source">模块分满分10分</span></div><div class="dc-sdk-table-wrap"><table class="dc-sdk-table dc-sdk-module-table"><thead><tr><th>模块</th><th>权重</th><th>得分/10</th><th>档位</th><th>子指标</th><th>数值</th><th>档位</th></tr></thead><tbody>'+moduleRows+'</tbody></table></div><details class="dc-sdk-logic"><summary>评分逻辑与得分阈值</summary>'+logic+'</details></section>'+
      '<section class="dc-sdk-panel dc-sdk-eval-section"><div class="dc-sdk-panel-head"><strong>每日关键指标（'+daily.length+'天）</strong><span class="dc-sdk-source">数据来自996评估项目</span></div><div class="dc-sdk-table-wrap"><table class="dc-sdk-table dc-sdk-eval-table"><thead><tr>'+evaluationDailyColumns.map(function(column){return '<th>'+column[1]+'</th>';}).join('')+'</tr></thead><tbody>'+dailyRows+'</tbody></table></div></section>'+
      '<section class="dc-sdk-panel dc-sdk-eval-section"><div class="dc-sdk-panel-head"><strong>评分历史</strong><span class="dc-sdk-source">共 '+history.length+' 个评分点</span></div><div class="dc-sdk-table-wrap"><table class="dc-sdk-table dc-sdk-history-table"><thead><tr><th>日期</th><th>总分</th><th>评级</th></tr></thead><tbody>'+historyRows+'</tbody></table></div></section>';
  }
  function skeleton(){return '<div class="dc-sdk-head"><div class="dc-sdk-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg><h1>产品洞察</h1></div><div class="dc-sdk-source" data-source>正在读取 996 项目数据…</div></div><div class="dc-sdk-toolbar"><select class="dc-sdk-control" aria-label="游戏类型"><option>传奇游戏</option></select><select class="dc-sdk-control" data-game aria-label="游戏"><option value="">全部游戏</option></select></div><div class="dc-sdk-tabs"><button class="dc-sdk-tab">全部游戏</button></div><div data-notice></div><div class="dc-sdk-cards" data-cards></div><section class="dc-sdk-panel"><div class="dc-sdk-panel-head"><strong>游戏数据排行</strong><div class="dc-sdk-range"><input class="dc-sdk-control" type="date" data-date><button class="dc-sdk-btn" data-today>最新数据</button></div></div><div class="dc-sdk-table-wrap" data-table><div class="dc-sdk-empty">正在加载数据…</div></div></section>';}
  function detailSkeleton(){return '<div class="dc-sdk-head"><div class="dc-sdk-title"><button class="dc-sdk-back" data-back aria-label="返回游戏排行">←</button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg><h1 data-detail-title>游戏详情</h1></div><div class="dc-sdk-source" data-source>正在读取 996 项目数据…</div></div><div class="dc-sdk-toolbar"><select class="dc-sdk-control" data-game aria-label="切换游戏"><option value="">正在读取游戏…</option></select></div><div class="dc-sdk-tabs"><button class="dc-sdk-tab">综合评估</button></div><div data-notice></div><div class="dc-sdk-cards" data-cards></div><div data-evaluation><div class="dc-sdk-empty">正在加载各分析模块…</div></div><section class="dc-sdk-panel dc-sdk-eval-section"><div class="dc-sdk-panel-head"><strong>游戏数据 · 按天</strong><div class="dc-sdk-range"><input class="dc-sdk-control" type="date" data-from><span>至</span><input class="dc-sdk-control" type="date" data-to><button class="dc-sdk-btn" data-days="30">近30天</button><button class="dc-sdk-btn" data-days="14">近14天</button><button class="dc-sdk-btn" data-days="7">近7天</button></div></div><div class="dc-sdk-table-wrap" data-table><div class="dc-sdk-empty">正在加载数据…</div></div></section>';}
  function host(){return document.querySelector('main.ant-layout-content')||document.querySelector('.ant-layout-content')||document.querySelector('main');}
  function authHeaders(){var token=sessionStorage.getItem('dc_token')||'';return token?{Authorization:'Bearer '+token}:{};}
  async function load(root){var date=root.querySelector('[data-date]').value,game=root.querySelector('[data-game]').value,q=new URLSearchParams();if(date)q.set('date',date);if(game)q.set('game_id',game);root.querySelector('[data-table]').innerHTML='<div class="dc-sdk-empty">正在加载数据…</div>';try{var response=await fetch('/api/v1/business/sdk-game-analysis?'+q.toString(),{headers:authHeaders(),cache:'no-store'}),body=await response.json();if(!response.ok)throw new Error(body.detail||'数据加载失败');var data=body.data||{};root.querySelector('[data-source]').textContent=data.source+' · 更新于 '+String(data.source_updated_at||'--').replace('T',' ');root.querySelector('[data-date]').value=data.selected_date||'';var select=root.querySelector('[data-game]'),current=select.value;select.innerHTML='<option value="">全部游戏('+((data.games||[]).length)+')</option>'+(data.games||[]).map(function(g){return '<option value="'+esc(g.game_id)+'">'+esc(g.game_name)+'</option>';}).join('');select.value=current;root.querySelector('[data-cards]').innerHTML=(data.cards||[]).map(function(c){return cardMarkup(c,data.selected_date);}).join('');root.querySelector('[data-table]').innerHTML=tableMarkup(data.rows||[]);root.querySelector('[data-notice]').innerHTML=data.selected_date!==date&&date?'<div class="dc-sdk-notice">所选日期暂无采集文件，当前展示最近可用日期 '+esc(data.selected_date)+'。</div>':'';}catch(error){root.querySelector('[data-source]').textContent='996 项目数据暂不可用';root.querySelector('[data-notice]').innerHTML='<div class="dc-sdk-notice">'+esc(error.message)+'</div>';root.querySelector('[data-cards]').innerHTML='';root.querySelector('[data-table]').innerHTML='<div class="dc-sdk-empty">暂无可展示数据</div>';}}
  async function loadDetail(root){
    var query=new URLSearchParams(location.search),select=root.querySelector('[data-game]'),game=query.get('game_id')||select.value,dateFrom=root.querySelector('[data-from]').value,dateTo=root.querySelector('[data-to]').value,q=new URLSearchParams();
    if(game)q.set('game_id',game);if(dateFrom)q.set('date_from',dateFrom);if(dateTo)q.set('date_to',dateTo);
    root.querySelector('[data-table]').innerHTML='<div class="dc-sdk-empty">正在加载数据…</div>';
    root.querySelector('[data-evaluation]').innerHTML='<div class="dc-sdk-empty">正在加载各分析模块…</div>';
    try{
      var response=await fetch('/api/v1/business/sdk-game-detail?'+q.toString(),{headers:authHeaders(),cache:'no-store'}),body=await response.json();
      if(!response.ok)throw new Error(body.detail||'数据加载失败');
      var data=body.data||{};
      root.querySelector('[data-detail-title]').textContent='游戏详情 · '+data.game_name;
      root.querySelector('[data-source]').textContent=data.source+' · 更新于 '+String(data.source_updated_at||'--').replace('T',' ');
      select.innerHTML=(data.games||[]).map(function(g){return '<option value="'+esc(g.game_id)+'">'+esc(g.game_name)+'</option>';}).join('');
      select.value=data.game_id;
      root.querySelector('[data-from]').value=data.date_from||'';
      root.querySelector('[data-to]').value=data.date_to||'';
      root.querySelector('[data-cards]').innerHTML=(data.cards||[]).map(function(c){return cardMarkup(c,data.selected_date);}).join('');
      root.querySelector('[data-evaluation]').innerHTML=evaluationMarkup(data.evaluation,data.date_from,data.date_to,data.evaluation_error);
      root.querySelector('[data-table]').innerHTML=detailTableMarkup(data.rows||[]);
      root.querySelector('[data-notice]').innerHTML='';
      var next=new URLSearchParams();next.set('game_id',data.game_id);next.set('date_from',data.date_from);next.set('date_to',data.date_to);
      history.replaceState({},'',DETAIL_ROUTE+'?'+next.toString());
    }catch(error){
      root.querySelector('[data-source]').textContent='996 项目数据暂不可用';
      root.querySelector('[data-notice]').innerHTML='<div class="dc-sdk-notice">'+esc(error.message)+'</div>';
      root.querySelector('[data-cards]').innerHTML='';
      root.querySelector('[data-evaluation]').innerHTML='<div class="dc-sdk-notice">'+esc(error.message)+'</div>';
      root.querySelector('[data-table]').innerHTML='<div class="dc-sdk-empty">暂无可展示数据</div>';
    }
  }

  function open(event){if(event){event.preventDefault();event.stopPropagation();}if(location.pathname!==ROUTE)history.pushState({},'',ROUTE);render();}
  function openDetail(gameId){var q=new URLSearchParams(),root=document.getElementById(ROOT_ID),date=root&&root.querySelector('[data-date]');q.set('game_id',gameId);if(date&&date.value)q.set('date_to',date.value);history.pushState({},'',DETAIL_ROUTE+'?'+q.toString());render();}
  function openMain(){history.pushState({},'',ROUTE);render();}
  function bindMain(root){root.querySelector('[data-date]').addEventListener('change',function(){load(root);});root.querySelector('[data-game]').addEventListener('change',function(){load(root);});root.querySelector('[data-today]').addEventListener('click',function(){root.querySelector('[data-date]').value='';load(root);});root.addEventListener('click',function(e){var link=e.target&&e.target.closest&&e.target.closest('[data-game-link]');if(link)openDetail(link.getAttribute('data-game-link'));});load(root);}
  function applyDays(root,days){var end=root.querySelector('[data-to]').value;if(!end){loadDetail(root);return;}var start=new Date(end+'T00:00:00');start.setDate(start.getDate()-(days-1));root.querySelector('[data-from]').value=start.toISOString().slice(0,10);loadDetail(root);}
  function bindDetail(root){
    var query=new URLSearchParams(location.search);
    root.querySelector('[data-from]').value=query.get('date_from')||'';root.querySelector('[data-to]').value=query.get('date_to')||'';
    root.querySelector('[data-back]').addEventListener('click',openMain);
    root.querySelector('[data-game]').addEventListener('change',function(){var q=new URLSearchParams(location.search);q.set('game_id',this.value);history.replaceState({},'',DETAIL_ROUTE+'?'+q.toString());loadDetail(root);});
    root.querySelector('[data-from]').addEventListener('change',function(){loadDetail(root);});
    root.querySelector('[data-to]').addEventListener('change',function(){loadDetail(root);});
    root.querySelectorAll('[data-days]').forEach(function(button){button.addEventListener('click',function(){applyDays(root,Number(button.getAttribute('data-days')));});});
    loadDetail(root);
  }
  function show(){var content=host();if(!content)return;var root=document.getElementById(ROOT_ID),view=location.pathname===DETAIL_ROUTE?'detail':'ranking';if(!root||root.parentNode!==content){root=document.createElement('div');root.id=ROOT_ID;content.appendChild(root);}if(root.dataset.view!==view){root.dataset.view=view;root.innerHTML=view==='detail'?detailSkeleton():skeleton();if(view==='detail')bindDetail(root);else bindMain(root);}[].slice.call(content.children).forEach(function(child){if(child!==root)child.classList.add('dc-sdk-hidden');});root.hidden=false;var menu=document.getElementById(MENU_ID);if(menu){document.querySelectorAll('aside .ant-menu-item-selected,.ant-layout-sider .ant-menu-item-selected').forEach(function(i){if(i!==menu)i.classList.remove('ant-menu-item-selected');});menu.classList.add('ant-menu-item-selected');}}
  function hide(){var root=document.getElementById(ROOT_ID);if(root&&root.parentNode){[].slice.call(root.parentNode.children).forEach(function(child){if(child!==root)child.classList.remove('dc-sdk-hidden');});root.hidden=true;}var menu=document.getElementById(MENU_ID);if(menu)menu.classList.remove('ant-menu-item-selected');}
  function render(){if(location.pathname===ROUTE||location.pathname===DETAIL_ROUTE)show();else hide();}
  function schedule(){clearTimeout(timer);timer=setTimeout(render,50);}
  css();window.addEventListener('popstate',schedule);document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('a,.ant-menu-item,.ant-menu-submenu-title'))schedule();},true);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});render();
})();
