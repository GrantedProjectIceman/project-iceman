"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import { fetchGrants, type FirebaseGrant } from "../../lib/api";
import { formatCurrency } from "../../lib/types";

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;

  const [grant, setGrant] = useState<FirebaseGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGrant() {
      try {
        setLoading(true);
        const grants = await fetchGrants();
        const found = grants.find(
          (g) => g.firestore_id === grantId || g.id === grantId
        );

        if (!found) {
          setError("Grant not found");
          return;
        }

        setGrant(found);
      } catch (err) {
        console.error("Error loading grant:", err);
        setError("Failed to load grant details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadGrant();
  }, [grantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !grant) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold"
          >
            ← Back
          </button>
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold">{error || "Grant not found"}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const profile = grant.grant_profile || ({} as any);
  const funding = profile.funding || {};
  const applicationWindow = profile.application_window || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition"
          >
            ← Back
          </button>
          <a
            href={grant.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Apply Now
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Title & Agency */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{grant.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{grant.agency}</p>

          {/* Issue Areas */}
          <div className="flex flex-wrap gap-2">
            {profile.issue_areas?.map((area: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        {grant.about && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <ul className="space-y-3">
              {(() => {
                const lines = grant.about.split(/\n+/);
                const cutoffIndex = lines.findIndex((line) =>
                  line.toLowerCase().includes("who can apply")
                );
                const filteredLines =
                  cutoffIndex !== -1 ? lines.slice(0, cutoffIndex) : lines;
                return filteredLines
                  .filter((line) => {
                    const lowerLine = line.toLowerCase();
                    return line.trim() && !lowerLine.includes("click here for more information");
                  })
                  .map((line, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-indigo-600 mr-3 font-bold text-lg">•</span>
                      <span className="text-gray-700 leading-relaxed">{line.trim()}</span>
                    </li>
                  ));
              })()}
            </ul>
          </div>
        )}

        {/* Funding */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm p-6 mb-6 border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-4">💰 Funding</h2>
          {funding.cap_amount_sgd || funding.min_amount_sgd ? (
            <div>
              {funding.min_amount_sgd && funding.cap_amount_sgd ? (
                <p className="text-lg text-green-900 font-semibold mb-2">
                  {formatCurrency(funding.min_amount_sgd)} - {formatCurrency(funding.cap_amount_sgd)}
                </p>
              ) : funding.cap_amount_sgd ? (
                <p className="text-lg text-green-900 font-semibold mb-2">
                  Up to {formatCurrency(funding.cap_amount_sgd)}
                </p>
              ) : null}
            </div>
          ) : null}
          {grant.funding && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {grant.funding}
            </p>
          )}
        </div>

        {/* Who Can Apply */}
        {grant.who_can_apply && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Who Can Apply?</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {grant.who_can_apply}
            </p>

            {/* Eligibility Requirements */}
            {profile.eligibility?.requirements?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  {profile.eligibility.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-indigo-600 mr-3 font-bold">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* When to Apply */}
        {grant.when_to_apply && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm p-6 mb-6 border border-orange-200">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">📅 When to Apply?</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {grant.when_to_apply}
            </p>

            {/* Application Window Details */}
            {applicationWindow && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {applicationWindow.start_date && (
                  <div>
                    <p className="text-sm text-gray-600">Starts</p>
                    <p className="text-lg font-semibold text-orange-900">
                      {new Date(applicationWindow.start_date).toLocaleDateString('en-SG')}
                    </p>
                  </div>
                )}
                {applicationWindow.end_date && (
                  <div>
                    <p className="text-sm text-gray-600">Ends</p>
                    <p className="text-lg font-semibold text-orange-900">
                      {new Date(applicationWindow.end_date).toLocaleDateString('en-SG')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* How to Apply */}
        {grant.how_to_apply && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 How to Apply?</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {grant.how_to_apply}
            </p>
          </div>
        )}

        {/* Source URL */}
        {grant.source_url && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <a
              href={grant.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Visit Original Grant Page →
            </a>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
