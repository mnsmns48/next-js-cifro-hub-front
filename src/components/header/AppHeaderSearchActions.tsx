import HeaderSearch from "@/components/header/HeaderSearch";
import HeaderActions from "@/components/header/HeaderActions";

export default function AppHeaderSearchActions() {
    return (
        <div
            style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: 22,
                height: 90,
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: 12,
            }}
        >
            <div style={{ flex: 1 }}>
                <HeaderSearch />
            </div>

            <HeaderActions />
        </div>
    );
}
