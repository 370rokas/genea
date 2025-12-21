import Topbar from "@/components/topbar";

export default function SaltiniaiLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Topbar />
            <>
                {children}
            </>
        </>
    );
}
