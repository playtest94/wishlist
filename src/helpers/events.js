import supabase from "./supabase-client"

export const EventTypes = {
    LOAD: "LOAD",
    FIRST_LOAD: "FIRST_LOAD",
    GIFT_PRESS: "GIFT_PRESS",
    CREDIT_PRESS: "CREDIT_PRESS",
    OPEN_REFERENCE_PRESS: "OPEN_REFERENCE_PRESS",
    OPEN_ACLARATIONS_PRESS: "OPEN_ACLARATIONS_PRESS",
    OPEN_PAYMENT_METHODS_PRESS: "OPEN_PAYMENT_METHODS_PRESS"
}

export const send = async (name, participantId, productId, extra = {}) => {
    const { data, error } = await supabase
        .from('Events')
        .insert(
            {
                name,
                participant: participantId,
                product: productId,
                extra: { ...extra, first_id: localStorage.getItem("first_id") }
            },
        )
}