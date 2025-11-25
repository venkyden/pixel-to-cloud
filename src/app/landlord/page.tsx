import { LandlordDashboard } from "@/components/landlord/landlord-dashboard";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Landlord Dashboard | Roomivo",
    description: "Manage your properties and tenants with AI insights.",
};

export default function LandlordPage() {
    return <LandlordDashboard />;
}
