import {ProductListComponentInfo, handler as baseHandler} from "../product/list";
import {useInput} from "../../data";
export const path = "/order/checkout";

export interface OrderCheckoutComponentInfo extends ProductListComponentInfo {

}

export async function handler() {
    const base = await baseHandler();

    return {
        ...base
    }
}

export function Component() {
    const {
        order,
        offers,
        productImages
    } = useInput<OrderCheckoutComponentInfo>();
}