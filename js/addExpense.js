import { addEntry, loadEntries, deleteEntry, updateEntry, getMonthKey, money } from "./data.js";
import { allCategories, subCategoriesFor } from "./config.js";

const form = document.getElementById("expenseForm");
const dateEl = document.getElementById("date");
const categoryEl = document.getElementById("category");
const subCategoryEl = document.getElementById("subCategory");
const amountEl = document.getElementById("amount");
const noteEl = document.getElementById("note");

const monthSelect = document.getElementById("monthSelect");
const tableBody = document.getElementById("entriesBody");
const totalEl = document.getElementById("monthTotal");

const editIdEl = document.getElementById("editId");
const cancelEditBtn = document.getElementById("cancelEditBtn");

function formatMonthLabel(monthKey){
  const [y,m] = monthKey.split("-");
  const d = new Date(Number(y), Number(m)-1, 1);
  return d.toLocaleString("en-IN", { month:"short", year:"numeric" });
}

function initMonthSelect(){
  const now = new Date();
  const year = now.getFullYear();
  const current = getMonthKey();
  monthSelect.innerHTML = "";
  for(let i=0;i<12;i++){
    const mk = `${year}-${String(i+1).padStart(2,"0")}`;
    const o = document.createElement("option");
    o.value = mk;
    o.textContent = formatMonthLabel(mk);
    if(mk === current) o.selected = true;
    monthSelect.appendChild(o);
  }
}

function initCategories(){
  categoryEl.innerHTML = "";
  for(const c of allCategories()){
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    categoryEl.appendChild(o);
  }
  rebuildSubcats();
}

function rebuildSubcats(){
  const cat = categoryEl.value;
  const subs = subCategoriesFor(cat);
  subCategoryEl.innerHTML = "";
  for(const s of subs){
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    subCategoryEl.appendChild(o);
  }
}

categoryEl.addEventListener("change", rebuildSubcats);

function clearForm(){
  editIdEl.value = "";
  amountEl.value = "";
  noteEl.value = "";
  cancelEditBtn.style.display = "none";
  document.getElementById("submitBtn").textContent = "Add Entry";
}

function loadMonthEntries(){
  const mk = monthSelect.value;
  const entries = loadEntries().filter(e => e.month === mk).sort((a,b)=> (b.date||"").localeCompare(a.date||""));
  let total = 0;
  tableBody.innerHTML = "";
  for(const e of entries){
    total += Number(e.amount||0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="muted">${e.date}</td>
      <td>${e.category}</td>
      <td class="muted">${e.subCategory || "—"}</td>
      <td class="right">₹ ${money(e.amount)}</td>
      <td class="muted">${e.note ? e.note.slice(0,24) : ""}</td>
      <td class="center">
        <button class="mini" data-act="edit" data-id="${e.id}">Edit</button>
        <button class="mini danger" data-act="del" data-id="${e.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  }
  totalEl.textContent = money(total);
}

tableBody.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if(!btn) return;
  const id = btn.getAttribute("data-id");
  const act = btn.getAttribute("data-act");

  const entries = loadEntries();
  const e = entries.find(x => x.id === id);
  if(!e) return;

  if(act === "del"){
    if(confirm("Delete this entry?")){
      deleteEntry(id);
      loadMonthEntries();
      clearForm();
    }
    return;
  }

  if(act === "edit"){
    editIdEl.value = id;
    dateEl.value = e.date;
    monthSelect.value = e.month;
    initCategories();
    categoryEl.value = e.category;
    rebuildSubcats();
    subCategoryEl.value = e.subCategory || subCategoryEl.value;
    amountEl.value = e.amount;
    noteEl.value = e.note || "";
    cancelEditBtn.style.display = "inline-flex";
    document.getElementById("submitBtn").textContent = "Save Changes";
    loadMonthEntries();
  }
});

cancelEditBtn.addEventListener("click", clearForm);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const date = dateEl.value;
  if(!date){ alert("Please pick a date"); return; }
  const mk = getMonthKey(date);
  const entry = {
    id: editIdEl.value || crypto.randomUUID(),
    date,
    month: mk,
    category: categoryEl.value,
    subCategory: subCategoryEl.value,
    amount: Number(amountEl.value || 0),
    note: (noteEl.value || "").trim()
  };

  if(entry.amount <= 0){ alert("Amount must be greater than 0"); return; }

  if(editIdEl.value){
    updateEntry(entry.id, entry);
  }else{
    addEntry(entry);
  }

  monthSelect.value = mk;
  loadMonthEntries();
  clearForm();
  alert("Saved!");
});

monthSelect.addEventListener("change", loadMonthEntries);

initMonthSelect();
initCategories();
dateEl.value = new Date().toISOString().slice(0,10);
loadMonthEntries();