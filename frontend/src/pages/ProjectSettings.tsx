import {useNavigate} from "@tanstack/react-router";
import {
    ArrowLeft,
    FileDown,
    LayoutList,
    Settings,
    Sliders,
    Users,
} from "lucide-react";
import {useState} from "react";
import {AlgorithmSettingsTab} from "@/components/projectSettings/AlgorithmSettingsTab";
import {ExportDataTab} from "@/components/projectSettings/ExportDataTab";
import {FormBuilderTab} from "@/components/projectSettings/FormBuilderTab";
import {ProjectMembersTab} from "@/components/projectSettings/ProjectMembersTab";
import {ProjectSettingsTab} from "@/components/projectSettings/ProjectSettingsTab";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const getTabItems = () => [
    {
        value: "form",
        label: "Form Builder",
        icon: LayoutList,
        children: <FormBuilderTab />,
    },
    {
        value: "triage",
        label: "Algorithm Settings",
        icon: Sliders,
        children: <AlgorithmSettingsTab />,
    },
    {
        value: "export",
        label: "Export Data",
        icon: FileDown,
        children: <ExportDataTab />,
    },
    {
        value: "members",
        label: "Members",
        icon: Users,
        children: <ProjectMembersTab />,
    },
    {
        value: "settings",
        label: "Settings",
        icon: Settings,
        children: <ProjectSettingsTab />,
    },
];

export function ProjectSettings() {
    const [activeTab, setActiveTab] = useState("form");
    const navigate = useNavigate();
    const tabItems = getTabItems();

    return (
        <div className="bg-background mb-24">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-2 mb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate({to: "/dashboard"})}
                        aria-label="Back to projects dashboard"
                        className="w-fit px-0 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        Back to Projects
                    </Button>
                    <h1 className="text-4xl font-bold text-foreground">
                        Project Management
                    </h1>
                    <p className="text-muted-foreground">
                        Configure data sources, review forms, algorithm settings
                        and export settings for your project.
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-card border border-border rounded-xl gap-1">
                        {tabItems.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="py-3 data-[state=active]:!bg-primary/20 data-[state=active]:!text-primary hover:!bg-secondary cursor-pointer"
                            >
                                <tab.icon
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                />
                                <span>{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabItems.map((tab) => (
                        <TabsContent
                            key={tab.value}
                            value={tab.value}
                            className="mt-6"
                        >
                            {tab.children}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
