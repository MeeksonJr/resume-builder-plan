import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  normalizeInstitutionSlug,
  isCampusStaffOrAdmin,
  CampusUserRole,
  CampusMemberPermissions,
  getDefaultPermissions,
  InstitutionalMemberRecord,
} from "@/lib/university/access-control";
import { VIRGINIA_INSTITUTIONS } from "@/lib/university/virginia-institutions";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Resolves institution title from slug
 */
function resolveSchoolName(slug: string): string {
  const norm = normalizeInstitutionSlug(slug);
  const found = VIRGINIA_INSTITUTIONS.find(
    (v) => normalizeInstitutionSlug(v.slug) === norm || v.slug === norm
  );
  if (found) return found.name;

  return norm
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Helper to check caller permissions for a specific school
 */
async function checkCallerAuthorization(schoolSlug: string) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, user: null, role: "student" as CampusUserRole };
    }

    // Check user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, settings, university_slug, school_verified")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { authorized: false, user, role: "student" as CampusUserRole };
    }

    if (profile.role === "admin") {
      return { authorized: true, user, profile, role: "admin" as CampusUserRole };
    }

    const normTarget = normalizeInstitutionSlug(schoolSlug);
    const customRole = profile.settings?.institutional_roles?.[normTarget];
    if (customRole && isCampusStaffOrAdmin(customRole)) {
      return { authorized: true, user, profile, role: customRole as CampusUserRole };
    }

    if (profile.role && isCampusStaffOrAdmin(profile.role)) {
      return { authorized: true, user, profile, role: profile.role as CampusUserRole };
    }

    // Also check institutional_memberships table
    try {
      const { data: membership } = await supabaseAdmin
        .from("institutional_memberships")
        .select("role, status, permissions")
        .eq("user_id", user.id)
        .eq("school_slug", normTarget)
        .maybeSingle();

      if (membership && membership.status === "active" && isCampusStaffOrAdmin(membership.role)) {
        return { authorized: true, user, profile, role: membership.role as CampusUserRole };
      }
    } catch {
      // ignore if table does not exist
    }

    return { authorized: false, user, profile, role: "student" as CampusUserRole };
  } catch (err) {
    console.warn("[MEMBERS_AUTH_CHECK_ERROR]", err);
    return { authorized: false, user: null, role: "student" as CampusUserRole };
  }
}

/**
 * Reads pending invited members from persistent cache
 */
async function getPendingInvites(schoolSlug: string): Promise<InstitutionalMemberRecord[]> {
  try {
    const { data } = await supabaseAdmin
      .from("university_insights_cache")
      .select("raw_search_data")
      .eq("school_slug", schoolSlug)
      .maybeSingle();

    const raw = data?.raw_search_data as any;
    if (Array.isArray(raw?.pending_invites)) {
      return raw.pending_invites;
    }
  } catch (e) {
    console.warn("[PENDING_INVITES_READ_WARN]", e);
  }
  return [];
}

/**
 * Saves pending invited members to persistent cache
 */
async function savePendingInvites(schoolSlug: string, invites: InstitutionalMemberRecord[]) {
  try {
    const { data } = await supabaseAdmin
      .from("university_insights_cache")
      .select("raw_search_data")
      .eq("school_slug", schoolSlug)
      .maybeSingle();

    const currentRaw = (data?.raw_search_data as any) || {};
    const updatedRaw = {
      ...currentRaw,
      pending_invites: invites,
    };

    await supabaseAdmin
      .from("university_insights_cache")
      .upsert(
        {
          school_slug: schoolSlug,
          raw_search_data: updatedRaw,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "school_slug" }
      );
  } catch (e) {
    console.warn("[PENDING_INVITES_SAVE_WARN]", e);
  }
}

/**
 * GET: Lists all institutional members for this university
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);
    const schoolName = resolveSchoolName(normalizedSlug);

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase().trim();
    const roleFilter = searchParams.get("role")?.toLowerCase().trim();

    // 1. Fetch from institutional_memberships table (if exists)
    let dbMembers: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("institutional_memberships")
        .select("*")
        .eq("school_slug", normalizedSlug)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        dbMembers = data;
      }
    } catch (e) {
      console.warn("[MEMBERS_DB_FETCH_NOTE] institutional_memberships query:", e);
    }

    // 2. Fetch verified student/faculty profiles for this school
    let verifiedProfiles: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, school_email, role, avatar_url, experience_level, target_role, settings, updated_at")
        .eq("university_slug", normalizedSlug)
        .eq("school_verified", true);

      if (!error && Array.isArray(data)) {
        verifiedProfiles = data;
      }
    } catch (e) {
      console.warn("[MEMBERS_PROFILES_FETCH_NOTE] profiles query:", e);
    }

    // 3. Merge profiles and institutional_memberships
    const memberMap = new Map<string, InstitutionalMemberRecord>();

    // Add profile-derived members
    for (const prof of verifiedProfiles) {
      const userId = prof.id;
      const email = prof.school_email || prof.email || `${userId.slice(0, 8)}@${normalizedSlug}.edu`;
      const name = prof.full_name || email.split("@")[0] || "University Scholar";

      let role: CampusUserRole = "student";
      if (prof.role === "admin") {
        role = "admin";
      } else if (prof.role === "dean" || prof.role === "staff") {
        role = "dean";
      } else if (prof.role === "advisor") {
        role = "advisor";
      } else if (prof.settings?.institutional_roles?.[normalizedSlug]) {
        role = prof.settings.institutional_roles[normalizedSlug] as CampusUserRole;
      }

      const permissions =
        prof.settings?.institutional_permissions?.[normalizedSlug] ||
        getDefaultPermissions(role);

      memberMap.set(userId, {
        id: userId,
        user_id: userId,
        name,
        email,
        role,
        status: "active",
        department: prof.settings?.department || (prof.experience_level === "student" ? "Computer Science" : "Academic Affairs"),
        title: prof.settings?.title || prof.target_role || (role === "student" ? "Undergraduate Scholar" : "Career Staff"),
        permissions,
        created_at: prof.updated_at || new Date().toISOString(),
        updated_at: prof.updated_at || new Date().toISOString(),
        avatar_url: prof.avatar_url || null,
      });
    }

    // Overlay or add rows from institutional_memberships table
    for (const m of dbMembers) {
      const userId = m.user_id || m.id;
      const existing = memberMap.get(userId);

      const resolvedPermissions: CampusMemberPermissions = {
        can_edit_settings: m.permissions?.can_edit_settings ?? existing?.permissions.can_edit_settings ?? isCampusStaffOrAdmin(m.role),
        can_manage_roster: m.permissions?.can_manage_roster ?? existing?.permissions.can_manage_roster ?? isCampusStaffOrAdmin(m.role),
        can_review_resumes: m.permissions?.can_review_resumes ?? existing?.permissions.can_review_resumes ?? isCampusStaffOrAdmin(m.role),
      };

      memberMap.set(userId, {
        id: m.id || userId,
        user_id: userId,
        name: existing?.name || m.title || `Campus Member (${m.role})`,
        email: existing?.email || m.email || `${userId.slice(0, 8)}@${normalizedSlug}.edu`,
        role: (m.role as CampusUserRole) || existing?.role || "student",
        status: m.status || existing?.status || "active",
        department: m.department || existing?.department || "Career & Placement",
        title: m.title || existing?.title || (m.role === "dean" ? "Dean of Placement" : m.role === "advisor" ? "Career Counselor" : "Student"),
        permissions: resolvedPermissions,
        created_at: m.created_at || existing?.created_at || new Date().toISOString(),
        updated_at: m.updated_at || existing?.updated_at,
        avatar_url: existing?.avatar_url || null,
      });
    }

    // Overlay pending invitations from persistent cache
    const pendingInvites = await getPendingInvites(normalizedSlug);
    for (const inv of pendingInvites) {
      if (!memberMap.has(inv.user_id) && !memberMap.has(inv.id)) {
        memberMap.set(inv.id, inv);
      }
    }

    // If completely empty (e.g. fresh portal instance), provide clean root administrator placeholder
    if (memberMap.size === 0) {
      const defaultDeanId = `dean-${normalizedSlug}`;
      memberMap.set(defaultDeanId, {
        id: defaultDeanId,
        user_id: defaultDeanId,
        name: `${schoolName} Career Center Liaison`,
        email: `career-center@${normalizedSlug.replace(/-/g, "")}.edu`,
        role: "dean",
        status: "active",
        department: "Office of the Dean",
        title: "Executive Dean & Career Services Director",
        permissions: getDefaultPermissions("dean"),
        created_at: new Date().toISOString(),
      });
    }

    let allMembers = Array.from(memberMap.values());

    // Role filtering
    if (roleFilter && roleFilter !== "all") {
      if (roleFilter === "dean" || roleFilter === "admin") {
        allMembers = allMembers.filter((m) => m.role === "dean" || m.role === "admin");
      } else if (roleFilter === "advisor") {
        allMembers = allMembers.filter((m) => m.role === "advisor");
      } else if (roleFilter === "staff") {
        allMembers = allMembers.filter((m) => m.role === "staff");
      } else if (roleFilter === "student") {
        allMembers = allMembers.filter((m) => m.role === "student");
      } else if (roleFilter === "pending") {
        allMembers = allMembers.filter((m) => m.status === "invited" || m.status === "pending");
      }
    }

    // Search query filtering
    if (search) {
      allMembers = allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          (m.department && m.department.toLowerCase().includes(search)) ||
          (m.title && m.title.toLowerCase().includes(search))
      );
    }

    // Sort: deans/admins first, then advisors, then staff, then students
    const roleRank: Record<string, number> = {
      admin: 1,
      dean: 2,
      staff: 3,
      advisor: 4,
      student: 5,
    };

    allMembers.sort((a, b) => {
      const rankA = roleRank[a.role] || 99;
      const rankB = roleRank[b.role] || 99;
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });

    const fullList = Array.from(memberMap.values());
    const counts = {
      total: fullList.length,
      deans: fullList.filter((m) => m.role === "dean" || m.role === "admin").length,
      advisors: fullList.filter((m) => m.role === "advisor").length,
      staff: fullList.filter((m) => m.role === "staff").length,
      students: fullList.filter((m) => m.role === "student").length,
      pending: fullList.filter((m) => m.status === "invited" || m.status === "pending").length,
    };

    return NextResponse.json({
      school_slug: normalizedSlug,
      school_name: schoolName,
      members: allMembers,
      counts,
    });
  } catch (error: any) {
    console.error("[MEMBERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch institutional members" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Role Elevation & Permission Adjustment
 * Allows verified staff/deans/admins to elevate student to advisor/staff or adjust permissions.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);
    const schoolName = resolveSchoolName(normalizedSlug);

    const body = await req.json();
    const { userId, role, department, title, permissions, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing required userId" }, { status: 400 });
    }

    if (role && !["student", "staff", "advisor", "dean", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Check authorization: caller must have elevated staff/admin rights
    const authCheck = await checkCallerAuthorization(normalizedSlug);
    // Allow if caller is staff/admin or if user is modifying their self-demo in local workspace
    if (!authCheck.authorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: only institutional staff, deans, or admins can elevate user roles." },
        { status: 403 }
      );
    }

    const resolvedRole: CampusUserRole = role || "student";
    const resolvedPermissions: CampusMemberPermissions = {
      ...getDefaultPermissions(resolvedRole),
      ...(permissions || {}),
    };

    // 1. Dual-Persistence: Upsert into institutional_memberships
    let dbSuccess = false;
    try {
      const { error: upsertErr } = await supabaseAdmin
        .from("institutional_memberships")
        .upsert(
          {
            user_id: userId,
            school_slug: normalizedSlug,
            school_name: schoolName,
            role: resolvedRole,
            department: department || null,
            title: title || null,
            status: status || "active",
            permissions: resolvedPermissions,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,school_slug" }
        );

      if (!upsertErr) {
        dbSuccess = true;
      } else {
        console.warn("[MEMBERS_PATCH_DB_WARN]", upsertErr);
      }
    } catch (e) {
      console.warn("[MEMBERS_PATCH_DB_EXCEPTION]", e);
    }

    // 2. Dual-Persistence: Update profile settings so checkSchoolPortalAccess reflects role elevation
    try {
      const { data: existingProf } = await supabaseAdmin
        .from("profiles")
        .select("id, settings, role")
        .eq("id", userId)
        .maybeSingle();

      if (existingProf) {
        const currentSettings = existingProf.settings || {};
        const currentRoles = currentSettings.institutional_roles || {};
        const currentPerms = currentSettings.institutional_permissions || {};

        currentRoles[normalizedSlug] = resolvedRole;
        currentPerms[normalizedSlug] = resolvedPermissions;

        const updatePayload: Record<string, any> = {
          settings: {
            ...currentSettings,
            institutional_roles: currentRoles,
            institutional_permissions: currentPerms,
            ...(department ? { department } : {}),
            ...(title ? { title } : {}),
          },
        };

        // If promoted to dean or staff and profile role is student, upgrade profile role as well
        if (resolvedRole === "dean" || resolvedRole === "staff" || resolvedRole === "advisor") {
          if (!existingProf.role || existingProf.role === "student") {
            updatePayload.role = resolvedRole;
          }
        } else if (resolvedRole === "student" && (existingProf.role === "advisor" || existingProf.role === "staff")) {
          updatePayload.role = "student";
        }

        await supabaseAdmin.from("profiles").update(updatePayload).eq("id", userId);
      }
    } catch (e) {
      console.warn("[MEMBERS_PATCH_PROFILE_WARN]", e);
    }

    // Also update in pending invites cache if present
    try {
      const currentPending = await getPendingInvites(normalizedSlug);
      const updatedPending = currentPending.map((p) => {
        if (p.user_id === userId || p.id === userId) {
          return {
            ...p,
            role: resolvedRole,
            department: department !== undefined ? department : p.department,
            title: title !== undefined ? title : p.title,
            status: (status as any) || p.status,
            permissions: resolvedPermissions,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });
      await savePendingInvites(normalizedSlug, updatedPending);
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${resolvedRole.toUpperCase()}.`,
      updatedMember: {
        user_id: userId,
        school_slug: normalizedSlug,
        role: resolvedRole,
        department,
        title,
        status: status || "active",
        permissions: resolvedPermissions,
        db_persisted: dbSuccess,
      },
    });
  } catch (error: any) {
    console.error("[MEMBERS_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member role" },
      { status: 500 }
    );
  }
}

/**
 * POST: Member Enrollment & Invitation
 * Generates an institutional membership or invitation link for an incoming faculty or student.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing school slug" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);
    const schoolName = resolveSchoolName(normalizedSlug);

    const body = await req.json();
    const { email, name, role = "student", department, title } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing member email" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const resolvedRole: CampusUserRole = ["student", "staff", "advisor", "dean", "admin"].includes(role)
      ? (role as CampusUserRole)
      : "student";

    const defaultPermissions = getDefaultPermissions(resolvedRole);

    // 1. Check if user already has a profile by email
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, school_email, settings")
      .or(`email.ilike.${cleanEmail},school_email.ilike.${cleanEmail}`)
      .maybeSingle();

    const userId = existingProfile?.id || `invited_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const displayName = name || existingProfile?.full_name || cleanEmail.split("@")[0];

    // 2. Persist membership
    try {
      await supabaseAdmin.from("institutional_memberships").upsert(
        {
          user_id: userId,
          school_slug: normalizedSlug,
          school_name: schoolName,
          role: resolvedRole,
          department: department || (resolvedRole === "student" ? "Computer Science" : "Career Services"),
          title: title || (resolvedRole === "dean" ? "Dean" : resolvedRole === "advisor" ? "Career Advisor" : "Student"),
          status: existingProfile ? "active" : "invited",
          permissions: defaultPermissions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,school_slug" }
      );
    } catch (e) {
      console.warn("[MEMBERS_POST_DB_WARN]", e);
    }

    // If profile exists, also link institutional role in settings
    if (existingProfile) {
      try {
        const currentSettings = existingProfile.settings || {};
        const currentRoles = currentSettings.institutional_roles || {};
        currentRoles[normalizedSlug] = resolvedRole;

        await supabaseAdmin
          .from("profiles")
          .update({
            school_verified: true,
            university_slug: normalizedSlug,
            university_name: schoolName,
            settings: { ...currentSettings, institutional_roles: currentRoles },
          })
          .eq("id", existingProfile.id);
      } catch (e) {
        console.warn("[MEMBERS_POST_PROFILE_SYNC_WARN]", e);
      }
    }

    const memberRecord: InstitutionalMemberRecord = {
      id: userId,
      user_id: userId,
      name: displayName,
      email: cleanEmail,
      role: resolvedRole,
      status: existingProfile ? "active" : "invited",
      department,
      title,
      permissions: defaultPermissions,
      created_at: new Date().toISOString(),
    };

    // If user does not have an active profile yet, save to persistent pending invites cache
    if (!existingProfile) {
      try {
        const currentPending = await getPendingInvites(normalizedSlug);
        await savePendingInvites(normalizedSlug, [
          memberRecord,
          ...currentPending.filter((p) => p.email.toLowerCase() !== cleanEmail),
        ]);
      } catch (e) {
        console.warn("[POST_PENDING_SAVE_WARN]", e);
      }
    }

    // Build invite link
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const inviteUrl = `${origin}/dashboard/portal/${normalizedSlug}?invited_role=${resolvedRole}&invite_email=${encodeURIComponent(cleanEmail)}`;

    return NextResponse.json({
      success: true,
      message: `Invitation successfully created for ${cleanEmail} as ${resolvedRole.toUpperCase()}.`,
      member: memberRecord,
      inviteUrl,
    });
  } catch (error: any) {
    console.error("[MEMBERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Revoke member access or demote to student
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!slug || !userId) {
      return NextResponse.json({ error: "Missing school slug or userId" }, { status: 400 });
    }

    const normalizedSlug = normalizeInstitutionSlug(slug);

    // 1. Delete from institutional_memberships
    try {
      await supabaseAdmin
        .from("institutional_memberships")
        .delete()
        .eq("user_id", userId)
        .eq("school_slug", normalizedSlug);
    } catch (e) {
      console.warn("[MEMBERS_DELETE_DB_WARN]", e);
    }

    // 2. Remove role from profile settings
    try {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("id, settings")
        .eq("id", userId)
        .maybeSingle();

      if (prof) {
        const settings = prof.settings || {};
        if (settings.institutional_roles?.[normalizedSlug]) {
          delete settings.institutional_roles[normalizedSlug];
        }
        if (settings.institutional_permissions?.[normalizedSlug]) {
          delete settings.institutional_permissions[normalizedSlug];
        }
        await supabaseAdmin.from("profiles").update({ settings }).eq("id", userId);
      }
    } catch (e) {
      console.warn("[MEMBERS_DELETE_PROFILE_WARN]", e);
    }

    // 3. Remove from pending invites cache if present
    try {
      const currentPending = await getPendingInvites(normalizedSlug);
      await savePendingInvites(
        normalizedSlug,
        currentPending.filter((p) => p.user_id !== userId && p.id !== userId)
      );
    } catch (e) {
      console.warn("[DELETE_PENDING_SAVE_WARN]", e);
    }

    return NextResponse.json({
      success: true,
      message: "Member institutional authorization revoked successfully.",
    });
  } catch (error: any) {
    console.error("[MEMBERS_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
