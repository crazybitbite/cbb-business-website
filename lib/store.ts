import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
    id: number | string
    name: string
    price: number
    /** Currency the price is stored in (defaults to USD) */
    currency?: string
    image?: string
}

interface CartItem extends Product {
    quantity: number
}

interface CartState {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: number | string) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items
                const existingItem = items.find((item) => item.id === product.id)

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] })
                }
            },
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                })
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            totalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
)
