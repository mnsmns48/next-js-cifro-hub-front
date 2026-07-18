"use client";
import {useState, useEffect} from "react";
import {Image} from "antd";

export default function InfoSlider() {
    const slides = [
        <Image src="https://i.pinimg.com/736x/4b/25/4b/4b254b59645199a41d534a1124953df0.jpg" alt="img"
               preview={false}/>,
        <Image src="https://i.pinimg.com/736x/16/0f/2d/160f2dd44cace3fedffb97136449212e.jpg" alt="img2"
               preview={false}/>,
        <Image src="https://i.pinimg.com/736x/f8/09/f2/f809f26fa0160c1b9adc8be3cb1a7f98.jpg" alt="img3"
               preview={false}/>,
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setIndex(i => (i + 1) % slides.length);
        }, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{padding: "20px 20px"}}>
            <div style={{height: 40, overflow: "hidden", borderRadius: 18,}}>
                <div style={{
                    display: "flex",
                    fontSize: 18,
                    fontWeight: 600,
                    transition: "opacity 0.5s",
                    opacity: 1,
                }}>
                    {slides[index]}
                </div>
            </div>
        </div>
    );
}
