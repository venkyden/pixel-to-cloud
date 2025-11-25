import { TenantDashboard } from "@/components/tenant/tenant-dashboard";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tenant Dashboard | Roomivo",
    description: "Manage your rental profile, view matches, and track applications.",
};

export default function TenantPage() {
    return <TenantDashboard />;
}
