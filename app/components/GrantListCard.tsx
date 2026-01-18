import { Grant, formatCurrency, formatDeadline } from "../lib/types";

export default function GrantListCard({
  grant,
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
}: {
  grant: Grant;
  isSaved?: boolean;
  onToggleSave?: () => void;
  showSaveButton?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 hover:shadow-md transition">
      {/* Title + Save button row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-gray-900 leading-snug">
            {grant.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{grant.organization}</p>
        </div>

        {showSaveButton && typeof onToggleSave === "function" && (
  <button
    onClick={onToggleSave}
    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95
      ${
        isSaved
          ? "bg-gradient-to-r from-emerald-500 to-indigo-500 text-white shadow-[0_10px_30px_-15px_rgba(99,102,241,0.8)]"
          : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm"
      }
    `}
    title={isSaved ? "Saved" : "Save"}
  >
    {isSaved ? "Saved ✓" : "Save"}
  </button>
)}

      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3 mb-3">
        {grant.issueAreas.map((area, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100"
          >
            {area}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {grant.description}
      </p>

      {/* Footer row */}
      <div className="flex items-start justify-between text-sm gap-4">
        <span className="text-emerald-700 font-semibold flex-1">
          {grant.fundingMax > 0 ? (
            grant.fundingMin > 0 ? (
              `${formatCurrency(grant.fundingMin)} – ${formatCurrency(grant.fundingMax)}`
            ) : (
              `Up to ${formatCurrency(grant.fundingMax)}`
            )
          ) : (
            <span className="text-xs text-gray-600 line-clamp-2">
              {grant.fundingRaw || "Funding details in application"}
            </span>
          )}
        </span>

        <span className="text-orange-600 font-semibold flex-shrink-0">
          {formatDeadline(grant.deadline)}
        </span>
      </div>
    </div>
  );
}
