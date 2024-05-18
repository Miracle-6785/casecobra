"use server"

import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const getPaymentStatus = async (orderId: string) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id || !user.email) throw new Error("You need to be logged in to see this page.")

    const order = await db.order.findFirst({
        where: {
            id: orderId,
            userId: user.id
        },
        include: {
            billingAddress: true,
            configuration: true,
            shippingAddress: true,
        }
    })

    if (!order) throw new Error("Order not found")

    if (order.isPaid) {
        return order
    } else {
        return false
    }
}