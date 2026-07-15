export default function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div style={{width: "100%", background: "#ffffff", borderRadius: "18px"}}>
            {children}
        </div>
    );
}
