import {
    addInventory,
    addInventoryProduct,
    addOrder,
    addOrderProduct,
    addShipment,
    Identifier,
    listInventoryProducts,
    listOrderProducts,
    listOrders,
    listProducts,
    setInventoryProduct,
    setOrder,
    ShipmentFrom,
    ShipmentTo
} from "../../data";
import {ok} from "../../is";
import {v4} from "uuid";
import {Chance} from "chance";
import {addLocation} from "../../data/location";

const chance = new Chance();

{

    let products = await listProducts();

    ok(products.length >= 3, "Some products should be already seeded");

    // A third party reference that can be recognised
    // In other software, this should be human-readable
    const reference = v4();

    const { locationId } = await addLocation({
        type: "place"
    });

    {
        const to: ShipmentTo = {
          address: [
              chance.address(),
              chance.city()
          ],
          countryCode: "NZL"
        };

        const from: ShipmentFrom = {
            locationId
        };

        let order = await addOrder({
            status: "pending", // Pending cart order,
            products: [],
            reference,
            to,
            from
        });
        const { orderId } = order;

        await addOrderProduct({
            orderId,
            productId: pick(products).productId,
            quantity: chance.integer({ min: 1, max: 20 })
        });
        await addOrderProduct({
            orderId,
            productId: pick(products).productId,
            quantity: chance.integer({ min: 1, max: 20 })
        });
        await addOrderProduct({
            orderId,
            productId: pick(products).productId,
            quantity: chance.integer({ min: 1, max: 20 })
        });

        ok(order.to, "Expected shipping address before submitting");
        order = await setOrder({
            ...order,
            status: "submitted"
        });
    }

    {
        const submittedOrders = await listOrders({
            status: "submitted"
        });
        let mostRecent = submittedOrders.at(-1);

        // If this is not true, then maybe are there tests running at the same time?
        // At time of writing this, they are serial tests
        ok(mostRecent.reference === reference, "Expected the most recent order to be the just submitted order")

        ok(mostRecent.to, "Expected shipping address before processing");

        // Mark the order as processing to indicate to the customer
        // that things are happening
        mostRecent = await setOrder({
            ...mostRecent,
            status: "processing"
        });

        const { orderId } = mostRecent;

        // Inventory shelf just for this order when it comes in
        // Extra priority!
        const { inventoryId } = await addInventory({
            type: "inventory"
        })

        // Ensure we have everything in stock
        {
            const orderedProducts = await listOrderProducts(orderId);

            const partner = {
                address: [
                    chance.address(),
                    chance.city()
                ],
                countryCode: "NZL"
            };

            {
                // Submit the order to our partner... whoever that is
                // Ask them to send it to our location
                await addOrder({
                    status: "submitted",
                    from: partner,
                    to: {
                        locationId,
                        inventoryId
                    },
                    products: orderedProducts
                        .map(({ productId, quantity }) => ({ productId, quantity }))
                });
            }

            {
                // We received the orders from the partner!
                for (const { productId, quantity } of orderedProducts) {
                    await addInventoryProduct({
                        status: "available",
                        from: partner,
                        to: {
                            locationId,
                            inventoryId
                        },
                        inventoryId,
                        productId,
                        quantity,
                        identifiers: Array.from({ length: quantity }, () => ({
                            type: "barcode",
                            identifier: v4(),
                            identifiedAt: new Date().toISOString()
                        }))
                    })
                }
            }
        }


        // Pick the order ready for shipping

        const picking = await addLocation({
            type: "picking"
        });

        const pickingInventory = await addInventory({
            type: "picking",
            locationId: picking.locationId
        });

        {

            const availableProducts = await listInventoryProducts({
                inventoryId,
                status: "available"
            });

            const orderProducts = await listOrderProducts(orderId);

            const productIds = [...new Set(orderProducts.map(product => product.productId))];

            const barcodes = new Map(
                productIds.map(
                    productId => {
                        const matching = availableProducts.filter(
                            product => product.productId === productId
                        );
                        const barcodes = matching
                            .flatMap<Identifier>(
                                product => (product.identifiers ?? [])
                            )
                            .filter(
                                identifier => identifier.type === "barcode"
                            );

                        return [productId, barcodes] as const;
                    }
                )
            );

            const allocated = new Map<string, Identifier[]>();

            for (const { productId, quantity } of await listOrderProducts(orderId)) {

                const identifiers = Array.from({ length: quantity }, () => barcodes.get(productId).pop());

                const productAllocated = allocated.get(productId) ?? [];
                productAllocated.push(...identifiers);
                allocated.set(productId, productAllocated);

                await addInventoryProduct({
                    productId,
                    quantity,
                    inventoryId: pickingInventory.inventoryId,
                    identifiers: identifiers.map(identifier => ({
                        ...identifier,
                        identifiedAt: new Date().toISOString()
                    }))
                });
            }

            const allocatedProducts = availableProducts.filter(
                product => {
                    if (!product.identifiers) return false;
                    const productAllocated = allocated.get(product.productId);
                    if (!productAllocated) return false;
                    return productAllocated.find(identifier => product.identifiers.includes(identifier))
                }
            );

            const partial = allocatedProducts.filter(
                product => {
                    const productAllocated = allocated.get(product.productId);
                    return !productAllocated.every(identifier => product.identifiers.includes(identifier))
                }
            );

            const fullyAllocated = allocatedProducts.filter(
                product => !partial.includes(product)
            );

            // Record<productId, inventoryProductId>
            const productAllocationInventory: Record<string, ShipmentTo> = {};

            for (const [productId, identifiers] of allocated.entries()) {
                const { inventoryProductId } = await addInventoryProduct({
                    status: "available",
                    inventoryId: pickingInventory.inventoryId,
                    productId,
                    quantity: identifiers.length,
                    identifiers
                });
                productAllocationInventory[productId] = {
                    inventoryProductId,
                    inventoryId: pickingInventory.inventoryId
                };
            }

            await Promise.all(
                fullyAllocated.map(
                    product => setInventoryProduct({
                        ...product,
                        status: "void",
                        to: productAllocationInventory[product.productId]
                    })
                )
            );

            await Promise.all(
                partial.map(
                    async product => {
                        const allocatedIdentifiers = allocated.get(product.productId);
                        const usedIdentifiers = allocatedIdentifiers.filter(
                            identifier => product.identifiers.includes(identifier)
                        );
                        const remainingIdentifiers = product.identifiers.filter(
                            identifier => !usedIdentifiers.includes(identifier)
                        );

                        const target = await setInventoryProduct({
                            ...product,
                            inventoryProductId: v4(),
                            status: "available",
                            identifiers: remainingIdentifiers
                        });

                        await setInventoryProduct({
                            ...product,
                            inventoryProductId: v4(),
                            status: "split",
                            to: [
                                {
                                    inventoryId: target.inventoryId,
                                    inventoryProductId: target.inventoryProductId
                                },
                                productAllocationInventory[product.productId]
                            ]
                        });

                    }
                )
            );



        }

        // Pack the products
        {
            const pickedProducts = await listInventoryProducts({
                inventoryId: pickingInventory.inventoryId,
                status: "available"
            });

            console.log(pickedProducts);
            ok(pickedProducts.length === 3);


            const packageLocation = await addLocation({
                type: "packing"
            });
            const packageInventory = await addInventory({
                type: "packing",
                locationId: packageLocation.locationId
            });

            for (const product of pickedProducts) {

                const target = await setInventoryProduct({
                    ...product,
                    inventoryId: packageInventory.inventoryId,
                    inventoryProductId: v4()
                });

                await setInventoryProduct({
                    ...product,
                    status: "void",
                    to: {
                        inventoryId: target.inventoryId,
                        inventoryProductId: target.inventoryProductId
                    }
                });
            }

            // Ship the order!
            {
                await addShipment({
                    status: "pending",
                    from: {
                        locationId,
                        inventoryId: packageInventory.inventoryId
                    },
                    to: mostRecent.to,
                    identifiers: [
                        {
                            type: "tracking",
                            identifier: v4(),
                            identifiedAt: new Date().toISOString()
                        }
                    ]
                })
            }
        }
    }

    function pick<T>(values: T[]): T {
        const index = Math.round(
            Math.random() * (values.length - 1)
        );
        return values[index] || values.find(Boolean);
    }
}