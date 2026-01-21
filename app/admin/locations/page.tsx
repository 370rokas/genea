"use client";

import { useLocations } from "@/hooks/dataFetching";
import { LocationsTable } from "./LocationsTable";
import CreateLocationDialog from "@/components/admin/locationCreateDialog";

export default function ManageLocationsPage() {
    const { data: locations, isLoading: locationsLoading } = useLocations();


    return (
        <div>
            <LocationsTable locationData={locations || []} />

            <CreateLocationDialog />
        </div>
    )
}