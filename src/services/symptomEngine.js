import { loadSymptomData } from '../utils/csvLoader'

export const ALL_SYMPTOMS = [
  'Fever','Cough','Dry_Cough','Headache','Fatigue','Nausea','Vomiting',
  'Diarrhea','Constipation','Body_Pain','Muscle_Pain','Joint_Pain',
  'Chest_Pain','Shortness_of_Breath','Sore_Throat','Runny_Nose',
  'Nasal_Congestion','Loss_of_Smell','Loss_of_Taste','Loss_of_Appetite',
  'Weight_Loss','Abdominal_Pain','Back_Pain','Dizziness','Lightheadedness',
  'Blurred_Vision','Skin_Rash','Itching','Chills','Sweating',
  'Cold_Hands_Feet','Swelling','High_Blood_Pressure','Low_Blood_Pressure',
  'Palpitations','Heartburn','Indigestion','Bloating','Frequent_Urination',
  'Painful_Urination','Blood_in_Urine','Anxiety','Depression','Insomnia',
  'Confusion','Memory_Loss','Seizures','Tremor','Bruising'
]

export const SYMPTOM_CATEGORIES = {
  'General & Fever':      ['Fever','Fatigue','Chills','Sweating','Weight_Loss','Loss_of_Appetite','Body_Pain'],
  'Respiratory':          ['Cough','Dry_Cough','Shortness_of_Breath','Chest_Pain','Sore_Throat','Runny_Nose','Nasal_Congestion'],
  'Digestive':            ['Nausea','Vomiting','Diarrhea','Constipation','Abdominal_Pain','Heartburn','Indigestion','Bloating'],
  'Neurological':         ['Headache','Dizziness','Lightheadedness','Blurred_Vision','Confusion','Memory_Loss','Seizures','Tremor'],
  'Musculoskeletal':      ['Muscle_Pain','Joint_Pain','Back_Pain','Swelling','Cold_Hands_Feet'],
  'Skin':                 ['Skin_Rash','Itching','Bruising'],
  'Urinary':              ['Frequent_Urination','Painful_Urination','Blood_in_Urine'],
  'Cardiovascular':       ['High_Blood_Pressure','Low_Blood_Pressure','Palpitations'],
  'Sensory':              ['Loss_of_Smell','Loss_of_Taste'],
  'Mental Health':        ['Anxiety','Depression','Insomnia']
}

export function predictDisease(selectedSymptoms) {
  const csvData = loadSymptomData()
  if (!selectedSymptoms.length) return []

  const scores = csvData.map(row => {
    const matchCount = selectedSymptoms.filter(s => row[s] === '1').length
    const totalInRow  = ALL_SYMPTOMS.filter(s => row[s] === '1').length
    const recall    = matchCount / selectedSymptoms.length
    const precision = matchCount / (totalInRow || 1)
    const f1 = (2 * precision * recall) / (precision + recall + 0.0001)
    const prognosisScore = parseFloat(row.Prognosis_Score) || 0
    return {
      disease: (row.Disease || '').replace(/_/g, ' '),
      diseaseKey: row.Disease || '',
      probability: Math.round(f1 * 100),
      prognosisScore,
      severity: prognosisScore >= 0.75 ? 'High' : prognosisScore >= 0.5 ? 'Medium' : 'Low'
    }
  })

  const sorted = scores.filter(s => s.probability > 0).sort((a, b) => b.probability - a.probability);
  
  const uniqueDiseases = [];
  const seen = new Set();
  
  for (const s of sorted) {
    if (!seen.has(s.diseaseKey)) {
      seen.add(s.diseaseKey);
      uniqueDiseases.push(s);
    }
  }

  return uniqueDiseases.slice(0, 6);
}
