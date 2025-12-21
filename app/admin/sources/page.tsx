import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";

export default function SourcesAdminPage() {
    return (
        <main className="flex min-h-screen w-full flex-col">
            <Tabs defaultValue="saltiniai" className="w-full">
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
                    <div>Šaltiniai turinys</div>
                </TabsPanel>

                <TabsPanel value="kategorijos" className="w-full p-6">
                    <div>Kategorijos turinys</div>
                </TabsPanel>

                <TabsPanel value="zymos" className="w-full p-6">
                    <div>Žymos turinys</div>
                </TabsPanel>

                <TabsPanel value="pasiulymai" className="w-full p-6">
                    <div>Pasiūlymai turinys</div>
                </TabsPanel>
            </Tabs>
        </main>
    );
}
