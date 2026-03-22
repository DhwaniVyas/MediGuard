import Papa from 'papaparse';
import symptomRaw from '../assets/symptom.csv?raw';
import medicineRaw from '../assets/medicine.csv?raw';

export function loadSymptomData() {
  const result = Papa.parse(symptomRaw, { header: true, skipEmptyLines: true });
  return result.data.filter(r => r.Disease && r.Disease !== 'Disease');
}

export function loadMedicineData() {
  const result = Papa.parse(medicineRaw, { header: true, skipEmptyLines: true });
  return result.data.filter(r => r.Disease_Key && r.Disease_Key !== 'Disease_Key');
}
