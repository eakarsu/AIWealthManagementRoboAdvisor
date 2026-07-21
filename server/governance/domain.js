'use strict';
function evaluate(input = {}, context = {}) {
  const errors = [];
  const mandate = input.mandate || {};
  const inputs = input.inputs || [];
  const calculation = input.calculation || {};
  const proposal = input.proposal || {};
  const review = input.review || {};
  const validation = input.validation || {};
  if (!mandate.id || !mandate.tenantId || mandate.tenantId !== context.tenant || !mandate.clientId || !mandate.ownerAdvisorId || mandate.ownerAdvisorId !== context.actor || !mandate.ipsVersion
      || !mandate.permissionVersion || !mandate.consentVersion || !mandate.effectiveFrom || !mandate.periodLockVersion
      || !mandate.baseCurrency) errors.push('versioned permissioned investment mandate required');
  const inputIds = new Set();
  for (const item of inputs) {
    if (!item.id || inputIds.has(String(item.id)) || !['ledger','custodian','banking','billing','crm','market-data','document','filing'].includes(item.kind)
        || !item.sourceVersion || !item.asOf || !item.currency || !item.provenanceRef || item.reconciled !== true
        || (item.corrected && !item.supersedesId)) errors.push('reconciled authoritative financial input invalid');
    inputIds.add(String(item.id));
  }
  const weights = calculation.targetAllocation || [];
  const weightTotal = weights.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  if (!calculation.id || !calculation.engineVersion || !calculation.ruleVersion || !calculation.inputIds?.every((id) => inputIds.has(String(id)))
      || !Number.isFinite(calculation.feeAmount) || !calculation.feeCurrency || !calculation.cashFlows
      || !calculation.taxAssumptions || !calculation.explanation || !calculation.uncertainty
      || Math.abs(weightTotal - 1) > 0.000001 || calculation.guaranteedOutcome) errors.push('deterministic explained financial calculation invalid');
  if (!proposal.id || proposal.calculationId !== calculation.id || !proposal.version || !proposal.effectiveFrom
      || !['draft','submitted','approved','rejected','reversed','corrected'].includes(proposal.status)
      || proposal.autonomousTrade || (['reversed','corrected'].includes(proposal.status) && !proposal.supersedesId)) errors.push('versioned reversible proposal state invalid');
  if (!review.advisorReviewerId || !review.complianceReviewerId || review.advisorReviewerId === review.complianceReviewerId
      || review.advisorReviewerId === mandate.ownerAdvisorId || review.approved !== true || !review.reviewedAt
      || (review.overrideApplied && (!review.overridePermissionRef || !review.overrideReason))) errors.push('segregated advisor/compliance review required');
  for (const key of ['fixtureVersion','goldenCaseError','historicalOutcomeError','lateDataHandled','correctionsHandled','boundaryConditionsPassed','reconciled']) {
    if (validation[key] === undefined) errors.push(`validation ${key} required`);
  }
  for (const key of ['marketCorrection','custodianCorrection','periodLock','reversal','lateData','boundaryAllocation']) {
    if (input.fixtures?.[key] !== true) errors.push(`fixture ${key} required`);
  }
  return { errors, result: { mandateId: mandate.id, proposalVersion: proposal.version, disposition: errors.length ? 'review' : 'human-reviewed' },
    assumptions: ['This workflow supports qualified financial review and does not guarantee performance'],
    uncertainty: { institutionsConnected: false, financialProfessionalReviewRequired: true } };
}
module.exports = { evaluate };
