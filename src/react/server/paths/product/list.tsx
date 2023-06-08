import {useData, useProducts} from "../../data";

export function ListProducts() {
    const products = useProducts();
    const { isAnonymous } = useData();
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href="/product/create">Create Product</a> : undefined}
            <div className="flex flex-col divide-y">
                {products.map(product => (
                    <div>
                        {product.productName}
                    </div>
                ))}
            </div>
        </div>
    )
}