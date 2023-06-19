import {useData, useProducts} from "../../data";

export const path = "/products";
export const anonymous = true;
export const cache = true;

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export function ListProducts() {
    const products = useProducts();
    const { isAnonymous } = useData();
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href="/product/create" className={LINK_CLASS}>Create Product</a> : undefined}
            <div className="flex flex-col divide-y">
                {products.map(product => (
                    <div key={product.productId} className="flex flex-row justify-between">
                        <div>{product.productName}</div>
                        {
                            !isAnonymous ? (
                                <div>
                                    <a href={`/offers?productId=${product.productId}`} className={LINK_CLASS}>
                                        Offers
                                    </a>
                                </div>
                            ) : undefined
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListProducts;