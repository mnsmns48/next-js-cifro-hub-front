import {WarningOutlined} from "@ant-design/icons";


export default function ServerError() {
    return (
        <div style={{
            textAlign: "center",
            padding: "30px 20px",
            background: "#fff4f4",
            border: "1px solid #ffd6d6",
            borderRadius: 12,
            fontSize: 20,
            fontWeight: 500,
            maxWidth: 600,
            margin: "40px auto"
        }}>
            База недоступна
            <div style={{marginTop: 12, fontSize: 28}}>
                <WarningOutlined/>
            </div>
        </div>
    )
}