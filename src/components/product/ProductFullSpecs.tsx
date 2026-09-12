"use client";

import {RightOutlined} from "@ant-design/icons";

import {formatSpecValue, type SpecFeature} from "./productDetail";

function SpecTable({
    feature,
    rowKey,
}: {
    feature: SpecFeature;
    rowKey: (param: string) => string;
}) {
    return (
        <table>
            <tbody>
                {feature.rows.map((row) => (
                    <tr key={rowKey(row.param)}>
                        <th>{row.param}</th>
                        <td>{formatSpecValue(row.param, row.value)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function ProductFullSpecs({features}: {features: SpecFeature[]}) {
    if (features.length === 0) return null;

    return (
        <>
            <div className="product-detail__tabs">
                <a href="#product-specs" className="product-detail__tab product-detail__tab--active">
                    Характеристики
                </a>
            </div>

            <section id="product-specs" className="product-detail__section">
                {features.map((feature) => (
                    <div key={feature.title} className="product-detail__feature-wrap">
                        <div className="product-detail__feature product-detail__feature--desktop">
                            <h3 className="product-detail__feature-title">{feature.title}</h3>
                            <SpecTable
                                feature={feature}
                                rowKey={(param) => `${feature.title}-${param}`}
                            />
                        </div>

                        <details className="product-detail__feature product-detail__feature--mobile">
                            <summary>
                                <span>{feature.title}</span>
                                <RightOutlined className="product-detail__feature-arrow"/>
                            </summary>
                            <SpecTable
                                feature={feature}
                                rowKey={(param) => `${feature.title}-mobile-${param}`}
                            />
                        </details>
                    </div>
                ))}
            </section>
        </>
    );
}
