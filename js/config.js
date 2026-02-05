export const CATEGORY_MAP = {
  "Home": ["House Rent/EMI","Electricity","Gas","Maintenance","Utilities"],
  "Daily Living": ["Groceries","Child care","Dining out","Housekeeping","Pets"],
  "Transportation": ["Fuel","Public transport","Parking","Repairs","Insurance"],
  "Health": ["Medicines","Doctor","Insurance","Gym"],
  "Vacations": ["Travel","Stay","Food","Shopping"],
  "Recreation": ["Movies","Subscriptions","Sports"],
  "Personal": ["Clothing","Salon/Barber","Gifts","Books"],
  "Financial": ["SIP","RD","Loan Payment","Credit Card","Tax"],
  "Misc": ["Other"]
};

export function allCategories(){
  return Object.keys(CATEGORY_MAP);
}

export function subCategoriesFor(category){
  return CATEGORY_MAP[category] || ["Other"];
}