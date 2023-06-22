import {useData, useInput, useProducts} from "../../data";
import {listProductFiles, File} from "../../../../data";
import {isAnonymous} from "../../../../authentication";
import {FastifyRequest} from "fastify";
import {ok} from "../../../../is";
import {useMemo} from "react";

export const path = "/products";
export const anonymous = true;
export const cache = true;


export interface ProductInfo {
    images600: File[]
    productImages: Record<string, File>
}

type Params = {
    productId: string;
}

type Schema = {
    Params: Params
}

export async function handler(): Promise<ProductInfo> {
    const images600 = (
        await listProductFiles({
            public: isAnonymous(),
            size: 600,
        })
    ).filter(file => file.pinned);
    const productImages = Object.fromEntries(
        images600.map(
            image => {
                const { productId } = image;
                ok(typeof productId === "string");
                return [productId, image] as const;
            }
        )
    )
    return { images600, productImages };
}

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export function ListProducts() {
    const products = useProducts();
    const { isAnonymous } = useData();
    const { images600, productImages } = useInput<ProductInfo>();
    const sorted = useMemo(() => {
        return [...products]
            .sort((a, b) => {
                if (productImages[a.productId] && !productImages[b.productId]) {
                    return -1;
                }
                if (!productImages[a.productId] && productImages[b.productId]) {
                    return 1;
                }
                return products.indexOf(a) < products.indexOf(b) ? -1 : 1;
            })
    }, [products, productImages])
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                {!isAnonymous ? <a href="/product/create" className={LINK_CLASS}>Create Product</a> : undefined}
                <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                    {sorted.map(product => {
                        const image = images600.find(file => file.productId === product.productId);
                        return (
                            <div key={product.productId}>
                                <div className="relative">
                                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                                        {
                                            image ? (
                                                <img
                                                    src={image.url}
                                                    alt={String(image.alt || product.productName)}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            ) : undefined
                                        }
                                    </div>
                                    <div className="relative mt-4">
                                        <h3 className="text-sm font-medium text-gray-900">{product.productName}</h3>
                                        <p className="mt-1 text-sm text-gray-500"></p>
                                    </div>
                                    <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
                                        />
                                        <p className="relative text-lg font-semibold text-white">$PRICE</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <a
                                        href={`/order/product/${product.productId}`}
                                        className="relative flex items-center justify-center rounded-md border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                                    >
                                        Add to bag<span className="sr-only">, {product.productName}</span>
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export const Component = ListProducts;