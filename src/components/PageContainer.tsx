export default function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div style={{maxWidth: 960, margin: "0 auto", padding: "0 16px"}}>
            {children}
        </div>
    );
}
