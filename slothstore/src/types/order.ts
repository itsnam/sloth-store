export interface Product {
    id: string;
    quantity: number;
    size: string;
    color: string;
}

export interface Order {
    user: string;
    products: Product[];
    address?: string | null;
    total?: number;
    status?: number;
}

export interface OrderState {
    order: Order | null;
    loading: boolean;
    error: string | null;
}

export const CREATE_ORDER = 'CREATE_ORDER';
export const FETCH_ORDER = 'FETCH_ORDER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const ORDER_ERROR = 'ORDER_ERROR';

interface CreateOrderAction {
    type: typeof CREATE_ORDER;
    payload: Order;
}

interface FetchOrderAction {
    type: typeof FETCH_ORDER;
    payload: Order;
}

interface UpdateOrderAction {
    type: typeof UPDATE_ORDER;
    payload: Order;
}

interface OrderErrorAction {
    type: typeof ORDER_ERROR;
    payload: string;
}

export type OrderActionTypes =
    | CreateOrderAction
    | FetchOrderAction
    | UpdateOrderAction
    | OrderErrorAction;
