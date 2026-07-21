const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

function fixture() {
  return {
  mandate:{id:'m1',tenantId:'t1',clientId:'c1',ownerAdvisorId:'owner',ipsVersion:'ips1',permissionVersion:'p1',consentVersion:'c1',effectiveFrom:'2026-07-18',periodLockVersion:'lock1',baseCurrency:'USD'},
  inputs:[{id:'i1',kind:'custodian',sourceVersion:'s1',asOf:'2026-07-18T00:00:00Z',currency:'USD',provenanceRef:'custodian:1',reconciled:true,corrected:false}],
  calculation:{id:'calc1',engineVersion:'e1',ruleVersion:'r1',inputIds:['i1'],feeAmount:100,feeCurrency:'USD',cashFlows:[{amount:1000}],taxAssumptions:['not tax advice'],explanation:'policy allocation',uncertainty:'market outcomes vary',targetAllocation:[{asset:'equity',weight:0.6},{asset:'fixed',weight:0.4}],guaranteedOutcome:false},
  proposal:{id:'p1',calculationId:'calc1',version:'p1',effectiveFrom:'2026-07-19',status:'approved',autonomousTrade:false},
  review:{advisorReviewerId:'advisor2',complianceReviewerId:'compliance1',approved:true,reviewedAt:'2026-07-18T01:00:00Z',overrideApplied:false},
  validation:{fixtureVersion:'fx1',goldenCaseError:0,historicalOutcomeError:0.03,lateDataHandled:true,correctionsHandled:true,boundaryConditionsPassed:true,reconciled:true},
  fixtures:{marketCorrection:true,custodianCorrection:true,periodLock:true,reversal:true,lateData:true,boundaryAllocation:true}
};
}

test('accepts governed wealth advisory proposal', () => {
  const result = evaluate(fixture(), { tenant: 't1', actor: 'owner' });
  assert.deepEqual(result.errors, []);
});

test('blocks unsafe or ungoverned wealth advisory proposal', () => {
  const input = fixture();
  input.proposal.autonomousTrade = true;
  assert.ok(evaluate(input, { tenant: 't1', actor: 'owner' }).errors.length > 0);
  assert.ok(evaluate(fixture(), { tenant: 'other', actor: 'owner' }).errors.length > 0);
});
