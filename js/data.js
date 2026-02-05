const LS_KEYS = {
  ENTRIES: "pb_entries_v1",
  INCOME: "pb_income_v1"
};

export function money(n){
  const val = Number(n || 0);
  // Indian grouping format
  return val.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function getMonthKey(dateStr){
  // returns YYYY-MM
  return (dateStr || new Date().toISOString().slice(0,10)).slice(0,7);
}

export function loadEntries(){
  try{ return JSON.parse(localStorage.getItem(LS_KEYS.ENTRIES)) || []; }
  catch{ return []; }
}

export function saveEntries(entries){
  localStorage.setItem(LS_KEYS.ENTRIES, JSON.stringify(entries));
}

export function addEntry(entry){
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
}

export function updateEntry(id, patch){
  const entries = loadEntries();
  const idx = entries.findIndex(e => e.id === id);
  if(idx >= 0){
    entries[idx] = { ...entries[idx], ...patch };
    saveEntries(entries);
    return true;
  }
  return false;
}

export function deleteEntry(id){
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
}

export function loadIncome(){
  try{ return JSON.parse(localStorage.getItem(LS_KEYS.INCOME)) || {}; }
  catch{ return {}; }
}

export function saveIncome(incomeObj){
  localStorage.setItem(LS_KEYS.INCOME, JSON.stringify(incomeObj || {}));
}

export function getIncomeForMonth(monthKey){
  const income = loadIncome();
  return income[monthKey] || { mithun: 0, priya: 0, other: 0 };
}

export function setIncomeForMonth(monthKey, values){
  const income = loadIncome();
  income[monthKey] = { mithun: Number(values.mithun||0), priya: Number(values.priya||0), other: Number(values.other||0) };
  saveIncome(income);
}