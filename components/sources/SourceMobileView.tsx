import { SearchSourcesResponseItem } from "@/types";

import {
    Collapsible,
    CollapsiblePanel,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "../ui/badge";
import { useLocations, useSourceTags } from "@/hooks/dataFetching";

interface MobileSourceViewProps {
    className?: string;
    displayData: SearchSourcesResponseItem[];
}

export default function MobileSourceView({ className, displayData }: MobileSourceViewProps) {

    const { data: tags } = useSourceTags();
    const { data: locations } = useLocations();

    function getNameFromId(id: number, type: "tag" | "location"): string {
        if (type === "tag") {
            const tag = tags?.find(t => t.id === id);
            return tag ? tag.name : `Žyma ${id}`;
        } else {
            const location = locations?.find(l => l.id == id);
            return location ? location.name : `Vietovė ${id}`;
        }
    }

    return (
        <div className={`w-full ${className}`}>
            {displayData.map((item) => (
                <Collapsible key={item.id} className="w-full border rounded-md mb-4">
                    <CollapsibleTrigger className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200">
                        {item.title}
                    </CollapsibleTrigger>
                    <CollapsiblePanel className="p-4 bg-white">
                        <p className="text-sm mb-2">{item.description}</p>

                        <p className="text-sm mb-2 text-gray-600"> Žymos: </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {item.tag_ids.map((tagId) => (
                                <Badge key={tagId} variant="outline">
                                    {getNameFromId(tagId, "tag")}
                                </Badge>
                            ))}
                        </div>

                        <p className="text-sm mb-2 text-gray-600"> Vietovardžiai: </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {item.location_ids.map((locId) => (
                                <Badge key={locId} variant="outline">
                                    {getNameFromId(locId, "location")}
                                </Badge>
                            ))}
                        </div>

                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Peržiūrėti šaltinį
                        </a>
                    </CollapsiblePanel>
                </Collapsible>
            ))}
        </div>
    );
}