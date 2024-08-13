import { useEffect, useState } from "react";

import supabase from "@/helpers/supabase-client"

import Home from ".";

export default function Edit({ wishlist, redirectPath, productsData = [] }) {

    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        if (editMode) return
        let sign = prompt("Ingresa el codigo para editar");
        if (sign == wishlist.edit_code) {
            setEditMode(true)
        } else {
            window.location.href = `${window.location.origin}/${redirectPath}`
        }

    }, [editMode])

    if (!editMode) return null

    return <Home wishlist={wishlist} editMode={editMode} productsData={productsData} />
}


const fetchWishlist = (slug) => supabase
    .from('Wishlists')
    .select('*')
    .eq("slug", slug)
    .limit(1)
    .single()


const fetchProducts = (wishlist, editMode = false) => {

    let baseQuery = supabase
        .from('Products')
        .select('*,Participants(id,name)')
        .eq("wishlist", wishlist?.id)

    if (!editMode) baseQuery = baseQuery.eq("visible", true)

    return baseQuery
        .order('reserved', { ascending: true })
        .order('credit_amount', { ascending: false })
        .order('priority', { ascending: false });
}

export async function getServerSideProps(ctx) {

    const { slug } = ctx.query

    const { data: wishlist } = await fetchWishlist(slug)
    if (!wishlist) return {
        props: {
            error: "Esta lista no existe"
        }
    }
    const { data: dataProducts } = await fetchProducts(wishlist, true)

    return {
        props: {
            wishlist,
            redirectPath: slug,
            productsData: dataProducts || null,
        }
    }
}