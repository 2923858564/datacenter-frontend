export default function createRegisteredAccountsPage(runtime){
const {Xr,C,Me,dr,Tr}=runtime;

function dcUseProgressiveQuery(endpoint, query, enabled=true){
  const [rows,setRows]=Xr.useState([]),[meta,setMeta]=Xr.useState({total:null});
  const [loading,setLoading]=Xr.useState(false),[error,setError]=Xr.useState("");
  const cache=Xr.useRef(new Map()),flights=Xr.useRef(new Map()),lifetime=Xr.useRef(null);
  Xr.useEffect(()=>{const controller=new AbortController();lifetime.current=controller;
    return()=>{controller.abort();cache.current.clear();flights.current.clear()}},[]);
  Xr.useEffect(()=>{
    if(!enabled){setRows([]);setMeta({total:null});setLoading(false);setError("");return}
    let alive=true;setError("");
    const q=new URLSearchParams(query);q.set("part","rows");
    const url=endpoint+"?"+q.toString();
    const load=(target,force=false)=>{
      const saved=cache.current.get(target);
      if(!force&&saved&&Date.now()-saved.at<60000)return Promise.resolve(saved.body);
      const active=flights.current.get(target);
      if(active&&!active.signal.aborted)return active;
      const signal=lifetime.current.signal;
      const pending=fetch(force?target+"&fresh=true":target,{signal,cache:force?"no-store":"default"})
        .then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.detail||"数据加载失败");return body})
        .then(body=>{if(signal.aborted)throw new DOMException("Cancelled","AbortError");cache.current.delete(target);cache.current.set(target,{body,at:Date.now()});
          while(cache.current.size>8)cache.current.delete(cache.current.keys().next().value);return body})
        .finally(()=>{if(flights.current.get(target)===pending)flights.current.delete(target)});
      pending.signal=signal;
      flights.current.set(target,pending);return pending;
    };
    const show=body=>{if(!alive)return;setRows(body.data||[]);setMeta(body.meta||{total:null});setLoading(false)};
    const saved=cache.current.get(url);
    if(saved&&Date.now()-saved.at<60000)show(saved.body);else setLoading(true);
    load(url).then(async body=>{
      if(!alive)return;show(body);
      if(body.meta?.has_more){const next=new URLSearchParams(q);next.set("page",String(Number(q.get("page")||1)+1));
        load(endpoint+"?"+next.toString()).catch(()=>{})}
      const summary=new URLSearchParams(q);summary.set("part","summary");summary.set("page","1");
      try{
        let result=await load(endpoint+"?"+summary.toString());
        if(!alive)return;
        if(result.meta?.data_version!==body.meta?.data_version){
          body=await load(url,true);if(!alive)return;show(body);
          result=await load(endpoint+"?"+summary.toString(),true);
        }
        if(alive&&result.meta?.data_version===body.meta?.data_version)
          setMeta({...body.meta,...result.meta,page:body.meta.page,page_size:body.meta.page_size,has_more:body.meta.has_more});
      }catch(err){if(alive&&err.name!=="AbortError")setError("数据已显示，统计加载失败："+err.message)}
    }).catch(err=>{if(alive&&err.name!=="AbortError"){setError(err.message);setLoading(false)}});
    return()=>{alive=false};
  },[endpoint,query,enabled]);
  return {rows,meta,loading,error,setError};
}

function dcRegisteredAccountsPage(){
  Xr.useEffect(()=>{if(new URLSearchParams(location.search).get("embedded")!=="1")return;const s=document.createElement("style");s.textContent="body.dc-ra-embedded .ant-layout-header,body.dc-ra-embedded .ant-layout-sider{display:none!important}body.dc-ra-embedded .dc-ra-page{min-height:100vh}";document.head.appendChild(s);document.body.classList.add("dc-ra-embedded");return()=>{document.body.classList.remove("dc-ra-embedded");s.remove()}},[]);
  Xr.useEffect(()=>{const s=document.createElement("style");s.textContent=".dc-ra-page{padding:20px 24px 28px;background:#f4f7fb;min-height:calc(100vh - 56px);color:#1d2939}.dc-ra-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px}.dc-ra-heading h1{font-size:22px;line-height:1.4;margin:0 0 4px}.dc-ra-heading p{margin:0;color:#7a8699;font-size:13px}.dc-ra-count{font-size:13px;color:#5b6b82}.dc-ra-filter,.dc-ra-table-card{background:#fff;border:1px solid #e5eaf1;border-radius:10px;box-shadow:0 2px 10px rgba(15,35,65,.04)}.dc-ra-filter{padding:16px;margin-bottom:14px}.dc-ra-grid{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:12px}.dc-ra-field{display:flex;flex-direction:column;gap:6px;min-width:0}.dc-ra-date-range{grid-column:span 2}.dc-ra-field span{font-size:12px;color:#5d6b7e}.dc-ra-field input,.dc-ra-field select,.dc-ra-pagination select{height:34px;border:1px solid #d7dee8;border-radius:6px;background:#fff;padding:0 10px;color:#1d2939;outline:none;min-width:0}.dc-ra-field .ant-select-selector{min-height:34px!important;border-color:#d7dee8!important;border-radius:6px!important}.dc-ra-field input:focus,.dc-ra-field select:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.1)}.dc-ra-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.dc-ra-actions button,.dc-ra-pagination button{height:34px;border:1px solid #d7dee8;border-radius:6px;background:#fff;padding:0 18px;cursor:pointer;color:#344054}.dc-ra-actions .dc-ra-primary{background:#1677ff;border-color:#1677ff;color:#fff}.dc-ra-error{margin:0 0 14px;padding:10px 14px;border:1px solid #ffccc7;background:#fff2f0;color:#cf1322;border-radius:8px}.dc-ra-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.dc-ra-summary>div{background:#fff;border:1px solid #e5eaf1;border-radius:9px;padding:13px 16px}.dc-ra-summary span{display:block;color:#7a8699;font-size:12px;margin-bottom:4px}.dc-ra-summary strong{font-size:20px}.dc-ra-table-card{overflow:hidden}.dc-ra-table-wrap{overflow-x:auto}.dc-ra-table-wrap table{border-collapse:collapse;width:100%;min-width:1500px;font-size:12px}.dc-ra-table-wrap th{background:#f7f9fc;color:#536174;font-weight:600;text-align:left;padding:11px 12px;border-bottom:1px solid #e5eaf1;white-space:nowrap}.dc-ra-table-wrap td{padding:10px 12px;border-bottom:1px solid #eef1f5;color:#344054;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dc-ra-table-wrap tr:hover td{background:#f8fbff}.dc-ra-table-wrap .number{text-align:right}.dc-ra-table-wrap .money{color:#cf1322;font-weight:600}.dc-ra-tag{display:inline-flex;padding:2px 8px;border-radius:10px;background:#e6f4ff;color:#1677ff}.dc-ra-tag.recharge{background:#fff1f0;color:#cf1322}.dc-ra-empty{text-align:center!important;color:#98a2b3!important;padding:48px!important}.dc-ra-pagination{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:12px 16px;color:#667085;font-size:12px}.dc-ra-pagination select{height:30px}.dc-ra-pagination button{height:30px;padding:0 12px}.dc-ra-pagination button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:1200px){.dc-ra-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}}@media(max-width:760px){.dc-ra-page{padding:14px}.dc-ra-grid{grid-template-columns:1fr 1fr}.dc-ra-date-range{grid-column:span 2}.dc-ra-summary{grid-template-columns:1fr 1fr}.dc-ra-heading{align-items:flex-start;gap:12px}.dc-ra-count{white-space:nowrap}}\n.dc-ra-actions button:disabled{opacity:.55;cursor:not-allowed}\n.dc-ra-table-wrap table{table-layout:fixed;min-width:1280px}.dc-ra-table-wrap th,.dc-ra-table-wrap td{padding-left:10px;padding-right:10px}.dc-ra-table-wrap th:nth-child(10),.dc-ra-table-wrap th:nth-child(11){text-align:right}.dc-ra-sort{display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;width:100%;padding:0;border:0;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.dc-ra-sort span{color:#1677ff;font-size:13px}.dc-ra-sort:focus-visible{outline:2px solid #1677ff;outline-offset:2px;border-radius:3px}\n.dc-ra-table-wrap table{min-width:1260px}\n.dc-ra-grid{grid-template-columns:repeat(6,minmax(140px,1fr))}\n@media(max-width:1200px){.dc-ra-grid{grid-template-columns:repeat(3,minmax(150px,1fr))}}\n@media(max-width:760px){.dc-ra-grid{grid-template-columns:1fr 1fr}}\n.dc-ra-summary{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}\n.dc-ra-table-wrap th.number{text-align:right}\n.dc-ra-page-jump{display:inline-flex;align-items:center;gap:6px}.dc-ra-page-jump input{width:68px;height:30px;border:1px solid #d7dee8;border-radius:6px;background:#fff;padding:0 8px;color:#1d2939;outline:none}.dc-ra-page-jump input:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.1)}\n@media(max-width:760px){.dc-ra-pagination{justify-content:flex-start;flex-wrap:wrap}}\n\n.dc-ra-table-wrap th:nth-child(10){text-align:left}.dc-ra-table-wrap td:nth-child(10){font-weight:600}.dc-ra-heading p{margin-top:4px}\n";document.head.appendChild(s);return()=>s.remove()},[]);
  Xr.useEffect(()=>{const s=document.createElement("style");s.textContent=".dc-ra-heading{margin-bottom:12px}.dc-ra-tabs{display:flex;gap:24px;border-bottom:1px solid #e5eaf1;margin-bottom:16px}.dc-ra-tab{position:relative;border:0;background:transparent;padding:10px 2px 12px;color:#667085;cursor:pointer;font-size:14px}.dc-ra-tab.active{color:#1677ff;font-weight:600}.dc-ra-tab.active:after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#1677ff;border-radius:2px}";document.head.appendChild(s);return()=>s.remove()},[]);
  const defaults=()=>({project:"",package:[],promoter_account:"",promoter:"",platform:"",classification:"",channel:"",business_type:"",role_name:"",role_id:"",date_from:"",date_to:""});
  const [draft,setDraft]=Xr.useState(()=>defaults()),[filters,setFilters]=Xr.useState(()=>defaults()),[queried,setQueried]=Xr.useState(false);
  const [activeTab,setActiveTab]=Xr.useState("all");
  const [options,setOptions]=Xr.useState({projects:[],packages:[],project_packages:{},promoters:[],promoter_accounts:{},platforms:[],channels:[]});
  const [page,setPage]=Xr.useState(1),[pageSize,setPageSize]=Xr.useState(20),[jumpPage,setJumpPage]=Xr.useState(""),[amountSort,setAmountSort]=Xr.useState(""),[exporting,setExporting]=Xr.useState(false);
  const set=(key,value)=>setDraft(prev=>({...prev,[key]:value}));
  const queryString=(source,withPage)=>{const q=new URLSearchParams();Object.entries(source).forEach(([k,v])=>{if(k==="classification"||k==="wechat_friend_status")return;if(Array.isArray(v)){v.forEach(item=>item!==""&&q.append(k,item))}else if(v!==""&&v!=null)q.set(k,v)});if(activeTab==="pending")q.set("wechat_friend_status","no");if(activeTab==="profile")q.set("wechat_friend_status","yes");if(amountSort){q.set("sort_by","cumulative_recharge");q.set("sort_order",amountSort)}if(withPage){q.set("page",String(page));q.set("page_size",String(pageSize))}return q.toString()};
  Xr.useEffect(()=>{let alive=true;const controller=new AbortController();fetch("/api/v1/registered-accounts/options",{signal:controller.signal}).then(async r=>{const body=await r.json();if(!r.ok)throw new Error(body.detail||"筛选项加载失败");return body}).then(body=>{if(alive)setOptions(body.data||{})}).catch(err=>{if(alive)setError(err.message)});return()=>{alive=false;controller.abort()}},[]);
  const {rows,meta,loading,error,setError}=dcUseProgressiveQuery("/api/v1/registered-accounts/records",queryString(filters,true),queried);
  const apply=()=>{setPage(1);setFilters({...draft});setQueried(true)};
  const reset=()=>{const next=defaults();setDraft(next);setPage(1);setAmountSort("");setFilters(next);setQueried(false)};
  const exportData=async()=>{setExporting(true);setError("");try{const response=await fetch("/api/v1/registered-accounts/export?"+queryString(filters,false));if(!response.ok){let message="导出失败";try{const body=await response.json();message=body.detail||message}catch{}throw new Error(message)}const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement("a"),label="用户池";link.href=url;link.download=label+"数据明细_"+Me().format("YYYYMMDD_HHmmss")+".csv";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}catch(err){setError(err.message||"导出失败")}finally{setExporting(false)}};
  const option=(value,label)=>C.jsx("option",{value,children:label},String(value)||"empty");
  const input=(label,key,type="text",placeholder="")=>C.jsxs("label",{className:"dc-ra-field",children:[C.jsx("span",{children:label}),C.jsx("input",{type,value:draft[key],placeholder,onChange:e=>set(key,e.target.value)})]});
  const textFilter=(label,key,items,placeholder,listId,onValue)=>C.jsxs("label",{className:"dc-ra-field",children:[C.jsx("span",{children:label}),C.jsx("input",{value:draft[key],placeholder,list:listId,autoComplete:"off",onChange:e=>(onValue||set)(key,e.target.value)}),C.jsx("datalist",{id:listId,children:(items||[]).map(v=>C.jsx("option",{value:v},v))})]});
  const money=value=>"¥"+Number(value||0).toLocaleString("zh-CN",{minimumFractionDigits:2,maximumFractionDigits:2});
  const packages=options.packages||[];
  const promoterAccounts=(options.promoter_account_options||[]).slice().sort((a,b)=>a.localeCompare(b,"zh-CN"));
  const changeProject=(_,value)=>set("project",value);
  const changePromoter=value=>setDraft(prev=>({...prev,promoter:value||""}));
  const changePromoterAccount=value=>set("promoter_account",value);
  const changeClassification=(_,value)=>setDraft(prev=>({...prev,classification:value,business_type:value==="聚玩"?"juwan":value==="渠道分类"?"channel":"",channel:value&&value!=="聚玩"&&value!=="渠道分类"?value:""}));
  const rangeValue=draft.date_from&&draft.date_to?[Me(draft.date_from),Me(draft.date_to)]:null;
  const dailyValue=draft.date_from&&draft.date_from===draft.date_to?Me(draft.date_from):null;
  const rangePresets=[{label:"昨日",value:[Me().subtract(1,"d"),Me().subtract(1,"d")]},{label:"今日",value:[Me(),Me()]},{label:"上周",value:[Me().subtract(1,"w").startOf("w"),Me().subtract(1,"w").endOf("w")]},{label:"本周",value:[Me().startOf("w"),Me()]},{label:"上月",value:[Me().subtract(1,"month").startOf("month"),Me().subtract(1,"month").endOf("month")]},{label:"本月",value:[Me().startOf("month"),Me()]},{label:"最近30天",value:[Me().subtract(30,"d"),Me()]},{label:"最近90天",value:[Me().subtract(90,"d"),Me()]}];
  const pages=meta.total==null?null:Math.max(1,Math.ceil(meta.total/pageSize));
  const jumpToPage=()=>{if(pages===null)return;const value=Math.trunc(Number(jumpPage));if(!Number.isFinite(value)||value<1)return;setPage(Math.min(value,pages));setJumpPage("")};
  const tableColumns=[{"key": "product", "label": "游戏名", "width": 150}, {"key": "reg_time", "label": "注册时间", "width": 150}, {"key": "last_login", "label": "最后登录时间", "width": 150}, {"key": "package", "label": "包体", "width": 190}, {"key": "promoter_account", "label": "推广员账号", "width": 130}, {"key": "promoter", "label": "推广员", "width": 80}, {"key": "platform", "label": "平台", "width": 70}, {"key": "user_name", "label": "玩家账号", "width": 120}, {"key": "role_name", "label": "角色名", "width": 110}, {"key": "role_id", "label": "角色ID", "width": 185}, {"key": "cumulative_recharge", "label": "累计充值", "width": 120, "number": true}, {"key": "server_name", "label": "区服", "width": 110},activeTab==="all"?{"key":"wechat_friend","label":"微信关系","width":125}:{"key":"wechat_number","label":"微信号","width":125}];
  const tableMinWidth=tableColumns.reduce((sum,column)=>sum+column.width,0);
  const toggleAmountSort=()=>{setPage(1);setAmountSort(value=>value==="desc"?"asc":"desc")};
  const selectedSingleDay=filters.date_from&&filters.date_from===filters.date_to?filters.date_from:"";
  const summary=[{label:selectedSingleDay?selectedSingleDay+" 新增用户":"用户池记录",value:Number(meta.total||0).toLocaleString("zh-CN")+" 条"}];
  const renderCell=(row,column)=>{const value=row[column.key];if(column.key==="cumulative_recharge")return value==null||value===""?"-":money(value);if(column.key==="promoter")return value||"未匹配";return value===0?"0":value||"-"};
  return C.jsxs("div",{className:"dc-ra-page",children:[
    C.jsxs("div",{className:"dc-ra-heading",children:[C.jsxs("div",{children:[C.jsx("h1",{children:"用户池"}),C.jsx("p",{children:"游戏、注册、登录、推广归属及累计充值"})]}),C.jsx("div",{className:"dc-ra-count",children:!queried?"等待查询":meta.total==null?"统计中…":"共 "+Number(meta.total||0).toLocaleString("zh-CN")+" 条"})]}),
    C.jsx("nav",{className:"dc-ra-tabs","aria-label":"用户池分页",children:[["all","数据明细（全部）"],["pending","代引入清单（不是微信好友）"],["profile","用户画像（是微信好友）"]].map(([key,label])=>C.jsx("button",{type:"button",className:"dc-ra-tab"+(activeTab===key?" active":""),onClick:()=>{setPage(1);setActiveTab(key);setQueried(false)},children:label},key))}),
    C.jsxs("section",{className:"dc-ra-filter",children:[
      C.jsxs("div",{className:"dc-ra-grid",children:[
        textFilter("项目","project",options.projects,"输入或选择项目","dc-ra-project-options",changeProject),C.jsxs("label",{className:"dc-ra-field",children:[C.jsx("span",{children:"包体"}),C.jsx(dr,{mode:"tags",tokenSeparators:[",","，"],value:draft.package,onChange:v=>set("package",v),options:packages.map(v=>({value:v,label:v})),placeholder:"输入或选择包体",allowClear:true,showSearch:true,optionFilterProp:"label",maxTagCount:2,maxTagPlaceholder:v=>"+"+v.length+"个",style:{width:"100%"}})]}),
        textFilter("推广员","promoter",options.promoters,"输入或选择推广员","dc-ra-promoter-options",(_,value)=>changePromoter(value)),textFilter("推广员账号","promoter_account",promoterAccounts,"输入或选择推广员账号","dc-ra-promoter-account-options",(_,value)=>changePromoterAccount(value)),
        textFilter("平台","platform",options.platforms,"输入或选择平台","dc-ra-platform-options"),textFilter("包体分类 / 渠道","classification",["聚玩","渠道分类",...(options.channels||[])],"输入或选择分类 / 渠道","dc-ra-classification-options",changeClassification),
        C.jsxs("label",{className:"dc-ra-field dc-ra-date-range",children:[C.jsx("span",{children:"注册日期范围"}),C.jsx(Tr.RangePicker,{value:rangeValue,onChange:v=>setDraft(prev=>({...prev,date_from:v&&v.length===2?v[0].format("YYYY-MM-DD"):"",date_to:v&&v.length===2?v[1].format("YYYY-MM-DD"):""})),placeholder:["开始注册日期","结束注册日期"],presets:rangePresets,format:"YYYY-MM-DD",allowClear:true,style:{width:"100%"}})]}),input("角色名","role_name","text","输入角色名"),input("角色ID","role_id","text","输入角色ID"),C.jsxs("label",{className:"dc-ra-field",children:[C.jsx("span",{children:"每日新增明细"}),C.jsx(Tr,{value:dailyValue,onChange:v=>setDraft(prev=>({...prev,date_from:v?v.format("YYYY-MM-DD"):"",date_to:v?v.format("YYYY-MM-DD"):""})),placeholder:"选择注册日期",presets:[{label:"今日",value:Me()},{label:"昨日",value:Me().subtract(1,"d")}],format:"YYYY-MM-DD",allowClear:true,style:{width:"100%"}})]})
      ]}),
      C.jsxs("div",{className:"dc-ra-actions",children:[C.jsx("button",{className:"dc-ra-primary",onClick:apply,children:"查询"}),C.jsx("button",{onClick:reset,children:"重置"}),C.jsx("button",{onClick:exportData,disabled:exporting||loading,children:exporting?"正在导出…":"导出数据"})]})
    ]}),
    error&&C.jsx("div",{className:"dc-ra-error",children:error}),
    C.jsx("div",{className:"dc-ra-summary",children:summary.map(item=>C.jsxs("div",{children:[C.jsx("span",{children:item.label}),C.jsx("strong",{children:!queried?"—":meta.total==null?"统计中…":item.value})]},item.label))}),
    C.jsx("section",{className:"dc-ra-table-card",children:C.jsxs("div",{className:"dc-ra-table-wrap",children:[C.jsxs("table",{style:{minWidth:tableMinWidth},children:[
      C.jsx("colgroup",{children:tableColumns.map(column=>C.jsx("col",{style:{width:column.width}},column.key))}),
      C.jsx("thead",{children:C.jsx("tr",{children:tableColumns.map(column=>C.jsx("th",{className:column.number?"number":"",children:column.key==="cumulative_recharge"?C.jsxs("button",{type:"button",className:"dc-ra-sort",onClick:toggleAmountSort,"aria-label":"累计充值排序，"+(amountSort==="desc"?"当前从高到低":amountSort==="asc"?"当前从低到高":"当前按时间"),children:[loading&&amountSort?"排序中…":column.label,C.jsx("span",{children:amountSort==="desc"?"↓":amountSort==="asc"?"↑":"⇅"})]}):column.key==="role_id"?C.jsx("strong",{children:column.label}):column.label},column.key))})}),
      C.jsx("tbody",{children:rows.length?rows.map(row=>C.jsx("tr",{children:tableColumns.map(column=>C.jsx("td",{className:(column.number?"number ":"")+(column.key==="cumulative_recharge"?"money":""),title:column.key==="wechat_friend"?row.wechat_friend_reason:String(renderCell(row,column)),children:renderCell(row,column)},column.key))},row.record_id)):C.jsx("tr",{children:C.jsx("td",{colSpan:tableColumns.length,className:"dc-ra-empty",children:!queried?"等待查询":loading?"正在加载数据…":"没有符合条件的数据"})})})
    ]}),C.jsxs("div",{className:"dc-ra-pagination",children:[
      C.jsxs("label",{children:["每页 ",C.jsx("select",{value:pageSize,onChange:e=>{setPage(1);setPageSize(Number(e.target.value))},children:[20,50,100].map(v=>option(v,String(v)))})," 条"]}),
      C.jsx("span",{children:"第 "+page+" / "+(pages===null?"…":pages)+" 页"}),C.jsx("button",{disabled:page<=1||loading,onClick:()=>setPage(v=>v-1),children:"上一页"}),C.jsx("button",{disabled:(pages===null?!meta.has_more:page>=pages)||loading,onClick:()=>setPage(v=>v+1),children:"下一页"}),
      C.jsxs("label",{className:"dc-ra-page-jump",children:["跳至",C.jsx("input",{type:"number",min:1,max:pages,value:jumpPage,placeholder:String(page),onChange:e=>setJumpPage(e.target.value),onKeyDown:e=>{if(e.key==="Enter")jumpToPage()},"aria-label":"跳转页码"}),"页"]}),C.jsx("button",{disabled:loading||pages===null||!jumpPage,onClick:jumpToPage,children:"跳转"})
    ]})]})})
  ]})
}

return dcRegisteredAccountsPage;
}
