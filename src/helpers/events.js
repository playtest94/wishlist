import supabase from "./supabase-client"

export const EventTypes = {
    LOAD: "LOAD",
    FIRST_LOAD: "FIRST_LOAD",
    GIFT_PRESS: "GIFT_PRESS",
    CREDIT_PRESS: "CREDIT_PRESS",
    OPEN_REFERENCES_LIST_PRESS: "OPEN_REFERENCES_LIST_PRESS",
    OPEN_REFERENCE_PRESS: "OPEN_REFERENCE_PRESS",
    OPEN_ACLARATIONS_PRESS: "OPEN_ACLARATIONS_PRESS",
    OPEN_PAYMENT_METHODS_PRESS: "OPEN_PAYMENT_METHODS_PRESS",
    FINISH_CREDIT: "FINISH_CREDIT",
    FINISH_GIFT: "FINISH_CREDIT"
}

export const EventTypesTitles = {
    LOAD: "Abrio la pagina",
    FIRST_LOAD: "Abrio la pagina por primera vez",
    GIFT_PRESS: "Presiono Regalar",
    CREDIT_PRESS: "Presiono Abonar",
    OPEN_REFERENCES_LIST_PRESS: "Abrio la lista de referencias",
    OPEN_REFERENCE_PRESS: "Visito el link de una referencia",
    OPEN_ACLARATIONS_PRESS: "Abrio las aclaraciones",
    OPEN_PAYMENT_METHODS_PRESS: "Abrio los metodos de pago",
    FINISH_CREDIT: "Abono a un producto",
    FINISH_GIFT: "Se encargara de regalarte un producto"
}

export const EventTypesDesc = {
    LOAD: () => "",
    FIRST_LOAD: () => "",
    GIFT_PRESS: (productName) => `Presiono Regalar en ${productName}`,
    CREDIT_PRESS: (productName) => `Presiono Abonar en ${productName}`,
    OPEN_REFERENCES_LIST_PRESS: (productName) => `Abrio la lista de referencias de ${productName}`,
    OPEN_REFERENCE_PRESS: (productName) => `Visito la referencia de ${productName}`,
    OPEN_ACLARATIONS_PRESS: () => "",
    OPEN_PAYMENT_METHODS_PRESS: () => "",
    FINISH_CREDIT: (productName, extra = {}) => `Hizo un abono de ${extra?.amount} USD a ${productName}`,
    FINISH_GIFT: (productName) => `Se encargara de regalarte ${productName}`,
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