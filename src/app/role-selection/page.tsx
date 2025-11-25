import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RoleSelectionClient } from "@/components/auth/role-selection-client";

export default async function RoleSelectionPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth");
    }

    // Check if user already has a role
    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (roleData?.role) {
        return redirect("/dashboard");
    }

    return <RoleSelectionClient />;
}
