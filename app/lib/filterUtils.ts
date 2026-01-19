import { FilterState } from "../components/Filters";
import { Grant } from "./types";

export function applyFilters(grants: Grant[], filters: FilterState) {
  return grants.filter((grant) => {
    // Issue area filter - check if any selected issue areas match
    if (
      filters.issueArea.length > 0 &&
      grant.issueAreas.length > 0 &&
      !filters.issueArea.some((a) => grant.issueAreas.includes(a))
    ) return false;

    // Scope filter - check if the grant's scope matches any selected scopes
    if (
      filters.scopeOfGrant.length > 0 &&
      grant.scope &&
      !filters.scopeOfGrant.includes(grant.scope)
    ) return false;

    // Funding filter - only filter if grant has funding info
    if (grant.fundingMax > 0 && grant.fundingMax < filters.fundingMin) return false;
    if (grant.fundingMin > 0 && grant.fundingMin > filters.fundingMax) return false;

    // Deadline filters - handle grants with valid deadlines
    if (grant.deadline && filters.deadlineAfter) {
      const grantDate = new Date(grant.deadline);
      const afterDate = new Date(filters.deadlineAfter);
      if (grantDate < afterDate) return false;
    }

    if (grant.deadline && filters.deadlineBefore) {
      const grantDate = new Date(grant.deadline);
      const beforeDate = new Date(filters.deadlineBefore);
      if (grantDate > beforeDate) return false;
    }

    // Eligibility filter removed - no data available in grants

    return true;
  });
}
