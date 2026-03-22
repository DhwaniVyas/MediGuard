import { loadMedicineData } from '../utils/csvLoader'

export function getMedicineNames() {
  const data = loadMedicineData()
  return [...new Set(data.map(r => r.Medicine_Name))].sort()
}

export function getMedicinesForDisease(diseaseKey) {
  const data = loadMedicineData()
  return data.filter(r =>
    r.Disease_Key?.toLowerCase() === diseaseKey?.toLowerCase() ||
    r.Disease_Key?.toLowerCase() === diseaseKey?.replace(/ /g, '_').toLowerCase()
  )
}

export function hydrateMedicineStrings(medNamesArray = []) {
  const data = loadMedicineData();
  return medNamesArray.map(name => {
    const found = data.find(r => r.Medicine_Name?.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
    return {
      Medicine_Name: name,
      Active_Ingredient: name, // AI fallback assumption
      Allergy_Group: 'Unknown/External API',
      Side_Effects: 'Consult physician. Information generated remotely.',
      Contraindications: 'Unknown'
    };
  });
}

export function checkCompatibility(med1Name, med2Name) {
  const data = loadMedicineData()
  const m1 = data.find(r => r.Medicine_Name?.toLowerCase() === med1Name?.toLowerCase())
  const m2 = data.find(r => r.Medicine_Name?.toLowerCase() === med2Name?.toLowerCase())

  if (!m1 && !m2) return { found: false, message: 'Neither medicine found in database.' }
  if (!m1) return { found: false, message: `"${med1Name}" not found in database.` }
  if (!m2) return { found: false, message: `"${med2Name}" not found in database.` }

  const sameAllergy = m1.Allergy_Group === m2.Allergy_Group
  const sameIngredient = m1.Active_Ingredient?.toLowerCase() === m2.Active_Ingredient?.toLowerCase()

  const contra1Words = m1.Contraindications?.toLowerCase().split(/[\s,]+/) || []
  const contra2Words = m2.Contraindications?.toLowerCase().split(/[\s,]+/) || []
  const ingredient1 = m1.Active_Ingredient?.toLowerCase() || ''
  const ingredient2 = m2.Active_Ingredient?.toLowerCase() || ''
  
  const contraConflict =
    contra1Words.some(w => w.length > 3 && ingredient2.includes(w)) ||
    contra2Words.some(w => w.length > 3 && ingredient1.includes(w))

  let riskScore = 0
  const riskFactors = []

  if (sameIngredient) {
    riskScore += 45
    riskFactors.push({ label: 'Same active ingredient', impact: 'Very High', score: 45 })
  }
  if (sameAllergy) {
    riskScore += 30
    riskFactors.push({ label: 'Same drug/allergy group', impact: 'High', score: 30 })
  }
  if (contraConflict) {
    riskScore += 25
    riskFactors.push({ label: 'Contraindication conflict', impact: 'Moderate', score: 25 })
  }
  if (riskFactors.length === 0) {
    riskFactors.push({ label: 'No direct conflicts detected', impact: 'None', score: 0 })
  }

  riskScore = Math.min(riskScore, 100)
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 30 ? 'Moderate' : 'Low'
  const compatible = riskScore < 30

  let interaction_reason = 'These medications are generally safe to take together based on our database records.';
  if (sameIngredient) {
    interaction_reason = `Both medications contain ${m1.Active_Ingredient || 'the same active ingredient'}. Taking them together significantly increases the risk of overdose.`;
  } else if (sameAllergy) {
    interaction_reason = `These medicines belong to the same drug family (${m1.Allergy_Group}). Using multiple drugs from this class simultaneously can lead to cumulative side effects.`;
  } else if (contraConflict) {
    interaction_reason = `There is a chemical conflict detected between the active ingredients. One medication contains components that are explicitly listed as contraindications for the other.`;
  }

  return {
    found: true, m1, m2,
    riskScore, riskLevel, compatible,
    sameAllergy, sameIngredient, contraConflict,
    riskFactors, interaction_reason
  }
}
