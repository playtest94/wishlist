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

export const EventTypesTitles = {
    LOAD: "Abrio la pagina",
    FIRST_LOAD: "Abrio la pagina por primera vez",
    GIFT_PRESS: "Presiono Regalar",
    CREDIT_PRESS: "Presiono Abonar",
    OPEN_REFERENCE_PRESS: "Vio una referencia",
    OPEN_ACLARATIONS_PRESS: "Abrio las aclaraciones",
    OPEN_PAYMENT_METHODS_PRESS: "Abrio los metodos de pago"
}

export const EventTypesDesc = {
    LOAD: () => "",
    FIRST_LOAD: () => "",
    GIFT_PRESS: (productName) => `Presiono Regalar en ${productName}`,
    CREDIT_PRESS: (productName) => `Presiono Abonr en ${productName}`,
    OPEN_REFERENCE_PRESS: (productName) => `Vio la referencia de ${productName}`,
    OPEN_ACLARATIONS_PRESS: () => "",
    OPEN_PAYMENT_METHODS_PRESS: () => "",
}

export const send = async (name, participantId, productId, wishlistId, extra = {}) => {
    const { data, error } = await supabase
        .from('Events')
        .insert(
            {
                name,
                participant: participantId,
                product: productId,
                wishlist_id: wishlistId,
                extra: { ...extra, first_id: localStorage.getItem("first_id") }
            },
        )
}