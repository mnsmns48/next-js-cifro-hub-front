export default function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div style={{width: "100%", background: "#FBFBFBFF", borderRadius: "22px", border: "1px solid #e8e8e8",}}>
            {children}
        </div>
    );
}
