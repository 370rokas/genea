"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import CategoryView from "./CategoryView";
import TagView from "./TagsView";
import ProposalView from "./ProposalView";
import SourceView from "./SourceView";

export default function SourcesAdminPage() {
    const [activeTab, setActiveTab] = useState("saltiniai");

    useEffect(() => {
        const savedTab = localStorage.getItem("sourcesAdminActiveTab");
        if (savedTab) {
            setActiveTab(savedTab);
        }
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        localStorage.setItem("sourcesAdminActiveTab", value);
    };

    return (
        <main className="flex min-h-screen w-full flex-col">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full justify-start border-b">
                    <TabsTab value="saltiniai" className="flex-1 text-center">
                        Šaltiniai
                    </TabsTab>
                    <TabsTab value="kategorijos" className="flex-1 text-center">
                        Kategorijos
                    </TabsTab>
                    <TabsTab value="zymos" className="flex-1 text-center">
                        Žymos
                    </TabsTab>
                    <TabsTab value="pasiulymai" className="flex-1 text-center">
                        Pasiūlymai
                    </TabsTab>
                </TabsList>
                <TabsPanel value="saltiniai" className="w-full p-6">
                    <SourceView />
                </TabsPanel>
                <TabsPanel value="kategorijos" className="w-full p-6">
                    <CategoryView />
                </TabsPanel>
                <TabsPanel value="zymos" className="w-full p-6">
                    <TagView />
                </TabsPanel>
                <TabsPanel value="pasiulymai" className="w-full p-6">
                    <ProposalView />
                </TabsPanel>
            </Tabs>
        </main>
    );
}