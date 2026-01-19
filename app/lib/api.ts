import { db } from "./firebase";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, getDoc, writeBatch } from "firebase/firestore";

export interface NPOProfile {
  organization_name: string;
  organization_type: string;
  registration_status?: string;
  issue_areas: string[];
  project_types: string[];
  funding_min: number;
  funding_max: number;
  funding_urgency?: string;
  years_operating: number;
  staff_size: number;
  mission: string;
  description?: string;
}

export interface FirebaseGrant {
  id?: string;
  firestore_id?: string;
  source: string;
  source_url: string;
  title: string;
  agency: string;
  about: string;
  who_can_apply: string;
  when_to_apply: string;
  funding: string;
  how_to_apply: string;
  grant_profile: {
    issue_areas: string[];
    scope_tags: string[];
    funding: {
      cap_amount_sgd?: number;
      min_amount_sgd?: number;
      raw?: string;
    };
    eligibility: {
      organization_types: string[];
      requirements: string[];
    };
    application_window: {
      is_open_all_year: boolean;
      start_date?: string;
      end_date?: string;
      dates?: string[];
      raw?: string;
    };
  };
  features?: any;
  sections?: any[];
  others?: any[];
  documents_required?: string[];
  metadata?: any;
}

export interface GrantMatch {
  grant_id: string;
  grant_name: string;
  agency: string;
  match_score: number;
  confidence: string;
  component_scores: Record<string, number>;
  detailed_scores?: any;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  action_items: string[];
  grant_url: string;
}

/**
 * Fetch all grants from Firestore
 */
export async function fetchGrants(): Promise<FirebaseGrant[]> {
  if (!db) {
    console.warn('Firebase not initialized');
    return [];
  }
  try {
    const grantsRef = collection(db, "grants");
    const snapshot = await getDocs(grantsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      firestore_id: doc.id,
      ...doc.data()
    })) as FirebaseGrant[];
  } catch (error) {
    console.error('Error fetching grants:', error);
    throw error;
  }
}

export async function saveNPOProfile(profile: NPOProfile) {
  if (!db) {
    // Return success with a mock ID when Firebase is not available
    const mockUserId = `user_${Date.now()}`;
    return {
      status: "success",
      user_id: mockUserId,
      message: "Profile saved successfully"
    };
  }
  try {
    const profileRef = doc(collection(db, "npo_profiles"));
    const userId = profileRef.id;
    
    await setDoc(profileRef, {
      ...profile,
      created_at: serverTimestamp(),
      user_id: userId,
    });
    
    return {
      status: "success",
      user_id: userId,
      message: "Profile saved successfully"
    };
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

export async function getNPOProfile(userId: string) {
  if (!db) {
    return null;
  }
  try {
    const profileRef = doc(db, "npo_profiles", userId);
    const snapshot = await getDoc(profileRef);
    
    if (!snapshot.exists()) {
      throw new Error("Profile not found");
    }
    
    return snapshot.data();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function calculateMatches(profile: NPOProfile, limit: number = 20) {
  const grants = await fetchGrants();

  const intersectCount = (a: string[] = [], b: string[] = []) => {
    const setB = new Set(b);
    return a.filter((x) => setB.has(x)).length;
  };

  const scoreGrant = (g: FirebaseGrant): number => {
    const gp = g.grant_profile || ({} as any);
    const areas: string[] = gp.issue_areas || [];
    const scopes: string[] = gp.scope_tags || [];
    const funding = gp.funding || {};
    const window = gp.application_window || {};

    const areaOverlap = intersectCount(profile.issue_areas || [], areas);
    const areaDenom = Math.max(1, (profile.issue_areas || []).length);
    const areaScore = areaOverlap / areaDenom; // 0..1

    const scopeOverlap = intersectCount(profile.project_types || [], scopes);
    const scopeDenom = Math.max(1, (profile.project_types || []).length);
    const scopeScore = scopeOverlap / scopeDenom; // 0..1

    const cap = Number(funding.cap_amount_sgd || funding.min_amount_sgd || 0);
    let fundingScore = 0.5; // baseline
    const minNeed = Number(profile.funding_min || 0);
    const maxNeed = Number(profile.funding_max || 0);
    if (cap > 0 && (minNeed > 0 || maxNeed > 0)) {
      if (cap >= minNeed && (maxNeed === 0 || cap <= maxNeed)) fundingScore = 1.0;
      else if (cap >= minNeed && maxNeed > 0 && cap > maxNeed) fundingScore = 0.8;
      else if (cap < minNeed) fundingScore = 0.3;
    }

    const windowScore = window.is_open_all_year ? 1.0 : 0.6;

    // Weighted components → 0..100
    const total = areaScore * 40 + scopeScore * 25 + fundingScore * 25 + windowScore * 10;
    return Math.max(0, Math.min(100, total));
  };

  const ranked = grants
    .map((g) => ({ grant: g, match_score: scoreGrant(g) }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

  return { matches: ranked };
}

export async function getRecommendations(userId: string, limit: number = 20) {
  if (!db) {
    return [];
  }
  // Fetch saved swipes for this user
  try {
    const swipesRef = collection(db, "swipes");
    const q = query(swipesRef, where("user_id", "==", userId));
    const snapshot = await getDocs(q);
    
    const likedGrantIds = new Set(
      snapshot.docs
        .filter(doc => doc.data().action === "like")
        .map(doc => doc.data().grant_id)
    );
    
    const grants = await fetchGrants();
    return grants
      .filter(grant => !likedGrantIds.has(grant.firestore_id))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    const grants = await fetchGrants();
    return grants.slice(0, limit);
  }
}

export async function saveSwipe(userId: string, grantId: string, action: 'like' | 'dislike', matchScore: number) {
  if (!db) {
    return {
      status: "success",
      message: "Swipe saved successfully"
    };
  }
  try {
    const swipeRef = doc(collection(db, "swipes"));
    
    await setDoc(swipeRef, {
      user_id: userId,
      grant_id: grantId,
      action,
      match_score: matchScore,
      created_at: serverTimestamp(),
    });
    
    return {
      status: "success",
      message: "Swipe saved successfully"
    };
  } catch (error) {
    console.error('Error saving swipe:', error);
    throw error;
  }
}

export async function getGrantsSummary() {
  try {
    const grants = await fetchGrants();
    return {
      total_grants: grants.length,
      agencies: [...new Set(grants.map(g => g.agency))].length,
      issue_areas: [...new Set(grants.flatMap(g => g.grant_profile?.issue_areas || []))].length,
    };
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

export async function getSavedGrants(userId: string): Promise<FirebaseGrant[]> {
  if (!db) {
    return [];
  }
  try {
    const swipesRef = collection(db, "swipes");
    const q = query(swipesRef, where("user_id", "==", userId), where("action", "==", "like"));
    const snapshot = await getDocs(q);

    // Allow matching by firestore_id, id, or source_url to cover legacy saves
    const likedGrantIds = new Set(
      snapshot.docs.map(doc => String(doc.data().grant_id || "")).filter(Boolean)
    );

    const grants = await fetchGrants();
    return grants.filter((grant) => {
      const candidates = [grant.firestore_id, grant.id, grant.source_url].map((v) => String(v || ""));
      return candidates.some((c) => likedGrantIds.has(c));
    });
  } catch (error) {
    console.error('Error fetching saved grants:', error);
    throw error;
  }
}

