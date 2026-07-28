import React from "react";

export default function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div >
            {children}
        </div>
    );
}
