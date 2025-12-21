"use client";

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxPopup,
    ComboboxValue,
} from "@/components/ui/combobox";

import { Permission, PERMISSIONS } from "@/types";

interface PermSelectorProps {
    selectedPermissions: Permission[];
    setSelectedPermissions: (perms: Permission[]) => void;
}

type ComboboxItemType = {
    label: string;
    value: Permission;
};

const items: ComboboxItemType[] = PERMISSIONS.map((perm) => ({
    label: perm,
    value: perm,
}));

export default function PermissionSelector({
    selectedPermissions,
    setSelectedPermissions,
}: PermSelectorProps) {
    const selectedItems = items.filter((item) =>
        selectedPermissions.includes(item.value)
    );

    return (
        <Combobox
            items={items}
            multiple
            value={selectedItems}
            onValueChange={(value: ComboboxItemType[]) => {
                setSelectedPermissions(value.map((v) => v.value));
            }}
        >
            <ComboboxChips>
                <ComboboxValue>
                    {(value: ComboboxItemType[]) => (
                        <>
                            {value.map((item) => (
                                <ComboboxChip key={item.value} aria-label={item.label}>
                                    {item.label}
                                </ComboboxChip>
                            ))}

                            <ComboboxInput
                                aria-label="Select permissions"
                                placeholder={
                                    value.length > 0 ? undefined : "Select permissions..."
                                }
                            />
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>

            <ComboboxPopup>
                <ComboboxEmpty>No permissions found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: ComboboxItemType) => (
                        <ComboboxItem key={item.value} value={item}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxPopup>
        </Combobox>
    );
}
