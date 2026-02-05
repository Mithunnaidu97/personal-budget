import { money, loadEntries, getMonthKey, getIncomeForMonth, setIncomeForMonth } from "./data.js";
import { allCategories } from "./config.js";

const monthSelect = document.getElementById("monthSelect");
const incomeMithun = document.getElementById("incomeMithun");
const incomePriya = document.getElementById("incomePriya");
const incomeOther = document.getElementById("incomeOther");
const saveIncomeBtn = document.getElementById("saveIncomeBtn");

const kpiIncome = document.getElementById("kpiIncome");
const kpiExpense = document.getElementById("kpiExpense");
const kpiBalance = document.getElementById("kpiBalance");
const kpiSavings = document.getElementById("kpiSavings");
const kpiTopCat = document.getElementById("kpiTopCat");
const kpiEntries = document.getElementById("kpiEntries");

const tableBody = document.getElementById("categoryTableBody");
const recentBody = document.getElementById("recentTableBody");

let pieChart, lineChart;

function monthOptions(){
  const now = new Date();
  const year = now.getFullYear();
  const months = [];
  for(let i=0;i<12;i++){
    const d = new Date(year, i, 1);
    months.push(d.toISOString().slice(0,7));
  }
  return months;
}

function formatMonthLabel(monthKey){
  const [y,m] = monthKey.split("-");
  const d = new Date(Number(y), Number(m)-1, 1);
  return d.toLocaleString("en-IN", { month:"short", year:"numeric" });
}

function initMonthSelect(){
  const opts = monthOptions();
  const current = getMonthKey();
  monthSelect.innerHTML = "";
  for(const mk of opts){
    const o = document.createElement("option");
    o.value = mk;
    o.textContent = formatMonthLabel(mk);
    if(mk === current) o.selected = true;
    monthSelect.appendChild(o);
  }
}

function groupByCategory(entries){
  const sums = {};
  for(const e of entries){
    sums[e.category] = (sums[e.category] || 0) + Number(e.amount || 0);
  }
  // Ensure stable categories appear even if 0
  for(const c of allCategories()){
    if(!(c in sums)) sums[c] = 0;
  }
  return sums;
}

function computeMonth(entries, monthKey){
  const monthEntries = entries.filter(e => e.month === monthKey);
  const catSums = groupByCategory(monthEntries);
  const totalExpense = Object.values(catSums).reduce((a,b)=>a+b,0);
  const income = getIncomeForMonth(monthKey);
  const totalIncome = Number(income.mithun||0)+Number(income.priya||0)+Number(income.other||0);
  const balance = totalIncome - totalExpense;

  // savings heuristic: treat "Financial" category as savings/investments + loans
  const financial = Number(catSums["Financial"] || 0);
  const savings = financial;

  // top category
  let topCat = "—", topVal = 0;
  for(const [c,v] of Object.entries(catSums)){
    if(v > topVal){
      topVal = v;
      topCat = c;
    }
  }

  return { monthEntries, catSums, totalExpense, totalIncome, balance, savings, topCat, topVal };
}

function renderIncomeForm(monthKey){
  const inc = getIncomeForMonth(monthKey);
  incomeMithun.value = inc.mithun || 0;
  incomePriya.value = inc.priya || 0;
  incomeOther.value = inc.other || 0;
}

function renderCategoryTable(catSums, totalExpense){
  tableBody.innerHTML = "";
  const entries = Object.entries(catSums).sort((a,b)=>b[1]-a[1]);
  for(const [cat, amt] of entries){
    const pct = totalExpense > 0 ? (amt/totalExpense*100) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cat}</td>
      <td class="right">₹ ${money(amt)}</td>
      <td class="right muted">${pct.toFixed(1)}%</td>
    `;
    tableBody.appendChild(tr);
  }
}

function renderRecentTable(monthEntries){
  recentBody.innerHTML = "";
  const recent = [...monthEntries].sort((a,b)=> (b.date||"").localeCompare(a.date||"")).slice(0,10);
  for(const e of recent){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="muted">${e.date}</td>
      <td>${e.category}</td>
      <td class="muted">${e.subCategory || "—"}</td>
      <td class="right">₹ ${money(e.amount)}</td>
      <td class="muted">${e.note ? e.note.slice(0,24) : ""}</td>
    `;
    recentBody.appendChild(tr);
  }
}

function setKpis({ totalIncome, totalExpense, balance, savings, topCat, monthEntries }){
  kpiIncome.textContent = money(totalIncome);
  kpiExpense.textContent = money(totalExpense);
  kpiBalance.textContent = money(balance);

  kpiBalance.className = "value " + (balance >= 0 ? "good" : "bad");
  kpiSavings.textContent = money(savings);
  kpiTopCat.textContent = topCat;
  kpiEntries.textContent = String(monthEntries.length);
}

function ensureCharts(){
  const pieCtx = document.getElementById("pieChart");
  const lineCtx = document.getElementById("lineChart");
  if(!pieCtx || !lineCtx) return;

  if(!window.Chart){
    console.warn("Chart.js not loaded");
    return;
  }

  if(!pieChart){
    pieChart = new Chart(pieCtx, {
      type: "doughnut",
      data: { labels: [], datasets: [{ data: [] }] },
      options: { responsive:true, plugins:{ legend:{ position:"bottom" } } }
    });
  }
  if(!lineChart){
    lineChart = new Chart(lineCtx, {
      type: "line",
      data: { labels: [], datasets: [{ label:"Monthly Expenses", data: [], tension:0.3, fill:false }] },
      options: { responsive:true, plugins:{ legend:{ display:true } } }
    });
  }
}

function updateCharts(catSums, monthKey){
  ensureCharts();
  if(!pieChart || !lineChart) return;

  const labels = Object.keys(catSums);
  const values = Object.values(catSums);

  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = values;
  pieChart.update();

  // Line chart for year monthly totals
  const entries = loadEntries();
  const year = monthKey.slice(0,4);
  const months = [];
  for(let i=1;i<=12;i++){
    const mk = `${year}-${String(i).padStart(2,"0")}`;
    months.push(mk);
  }
  const totals = months.map(mk => {
    const monthEntries = entries.filter(e => e.month === mk);
    return monthEntries.reduce((s,e)=>s+Number(e.amount||0),0);
  });
  lineChart.data.labels = months.map(mk => formatMonthLabel(mk));
  lineChart.data.datasets[0].data = totals;
  lineChart.update();
}

function refresh(){
  const monthKey = monthSelect.value;
  const entries = loadEntries();
  const result = computeMonth(entries, monthKey);

  renderIncomeForm(monthKey);
  renderCategoryTable(result.catSums, result.totalExpense);
  renderRecentTable(result.monthEntries);
  setKpis(result);
  updateCharts(result.catSums, monthKey);

  // small helper
  document.getElementById("monthPill").textContent = formatMonthLabel(monthKey);
}

saveIncomeBtn.addEventListener("click", () => {
  const monthKey = monthSelect.value;
  setIncomeForMonth(monthKey, {
    mithun: incomeMithun.value,
    priya: incomePriya.value,
    other: incomeOther.value
  });
  refresh();
  alert("Income saved for " + formatMonthLabel(monthKey));
});

monthSelect.addEventListener("change", refresh);

initMonthSelect();
refresh();