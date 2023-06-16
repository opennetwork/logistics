import {useData, useProducts} from "../../data";

export const path = "/products";
export const anonymous = true;
export const cache = true;

export function ListProducts() {
    const products = useProducts();
    const { isAnonymous } = useData();
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href="/product/create">Create Product</a> : undefined}
            <div className="flex flex-col divide-y">
                {products.map(product => (
                    <div key={product.productId}>
                        {product.productName}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListProducts;