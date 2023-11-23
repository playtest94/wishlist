import { useState, useEffect } from 'react';


import { Inter } from 'next/font/google'

import supabase from "@/helpers/supabase-client"

const inter = Inter({ subsets: ['latin'] })


const nonEditable = ["id", "created_at", "product_id", "participant_id", "wishlist", "amount"]

export default function Participations({ participationData }) {
  const [detailData, setDetailData] = useState(false);
  const [participations, setParticipations] = useState(participationData || []);
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({});

  const closeModal = () => {
    setDetailData(null)
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)

    const dataToSend = {}
    Object.keys(formData).forEach((key) => {
      if (!nonEditable.includes(key) && typeof (formData[key]) != "object") {
        dataToSend[key] = formData[key]
      }
    })

    console.log("dataToSend", dataToSend)

    try {
      const { data, error } = await supabase
        .from('ProductParticipants')
        .update(dataToSend)
        .eq('id', formData.id)
        .select('*, Participants(*), Products(*)')

      if (error) throw error
      if (data.length) {
        updateParticipationOnList(data[0])
        setDetailData(null)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }



  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const updateParticipationOnList = (updatedParticipation) => {
    if (!updatedParticipation) return
    const index = participations.findIndex(p => p.id == updatedParticipation.id)
    if (index == -1) return

    setParticipations([...participations.slice(0, index), updatedParticipation, ...participations.slice(index + 1)])

  }

  useEffect(() => {
    setFormData(detailData || {})
  }, [detailData])


  return (
    <main
      className={`${inter.className}`}
    >
      <div className="sm:container sm:mx-auto pt-10 pb-10">

        <h1 className="flex items-center justify-center font-semibold mb-8 text-3xl">Abonos</h1>


        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Participante
                </th>
                <th scope="col" className="px-6 py-3">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3">
                  Metodo
                </th>
                <th scope="col" className="px-6 py-3">
                  Voucher
                </th>
                <th scope="col" className="px-6 py-3">
                  -
                </th>
              </tr>
            </thead>
            <tbody>
              {participations.filter(p => p.is_credit).map((participation) => {
                const {
                  id,
                  voucher_url: voucherUrl,
                  amount,
                  payment_method: paymentMethod,
                  completed,
                  Products: product = {},
                  Participants: participant } = participation


                return <tr key={id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {participant.name}
                  </th>
                  <td className="px-6 py-4">
                    {`${product?.name} - ${product?.reserved ? "RESERVADO" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    {amount}
                  </td>
                  <td className="px-6 py-4">
                    {`${paymentMethod || ""}${completed ? " - ✅" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    {voucherUrl && <div
                      onClick={() => window.open(voucherUrl, "_blank")}
                      className="md:shrink-0 cursor-pointer">
                      <img className="w-20 h-20 object-contain" src={voucherUrl || "https://placehold.co/800x400"} alt="" />
                    </div>}
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400" onClick={() => setDetailData(participation)}>
                      Editar
                    </button>
                  </td>
                </tr>
              })}

            </tbody>
          </table>
        </div>

        <h1 className="flex items-center justify-center font-semibold mb-8 mt-8 text-3xl">Regalos</h1>


        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Participante
                </th>
                <th scope="col" className="px-6 py-3">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3">
                  Monto
                </th>
                <th scope="col" className="px-6 py-3">
                  Completado
                </th>
                <th scope="col" className="px-6 py-3">
                  -
                </th>
              </tr>
            </thead>
            <tbody>
              {participations.filter(p => !p.is_credit).map((participation) => {
                const {
                  id,
                  completed,
                  amount,
                  Products: product = {},
                  Participants: participant } = participation

                return <tr key={id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {participant.name}
                  </th>
                  <td className="px-6 py-4">
                    {`${product?.name} - ${product?.reserved ? "RESERVADO" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    {amount}
                  </td>
                  <td className="px-6 py-4">
                    {`${completed ? " ✅" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400" onClick={() => setDetailData(participation)}>
                      Editar
                    </button>
                  </td>
                </tr>
              })}

            </tbody>
          </table>
        </div>

      </div>

      {
        detailData && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

            <div className="bg-white p-10 md:w-1/2 lg:w-1/3 roundedshadow-lg overflow-y-scroll max-sm:min-w-full flex flex-col flex-wrap content-center h-full overflow-y-auto">

              <form onSubmit={handleSubmit} >

                {Object.keys(formData).map(key => {

                  if (formData[key] && typeof (formData[key]) === "object" && formData[key].name) {
                    return <div className="mb-4" key={`${key}_name`}>
                      <label htmlFor="amount" className="text-sm font-medium text-gray-700">{`${key}_name:`}</label>
                      <input
                        disabled={true}
                        id={`${key}_name`}
                        name={`${key}_name`}
                        value={formData[key].name}
                        // onChange={handleInputChange}
                        className="w-full p-2 border rounded text-black" />
                    </div>
                  }

                  return <div className="mb-2" key={key}>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">{`${key}:`}</label>
                    <input
                      disabled={nonEditable.includes(key)}
                      id={key}
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded text-black" />
                  </div>
                })}
                <div className="text-right">
                  <button type="submit" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 disabled:cursor-not-allowed" disabled={isLoading}>
                    {isLoading && <svg className="animate-spin mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>}
                    {isLoading ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={closeModal}>
                    Cerrar
                  </button>
                </div>
              </form>


            </div>
          </div>
        )
      }

    </main >
  )
}

const fetchWishlist = (slug) => supabase
  .from('Wishlists')
  .select('*')
  .eq("slug", slug)
  .limit(1)
  .single()

const fetchProductParticipations = (wishlistId) => supabase
  .from('ProductParticipants')
  .select('*, Participants(*), Products(*)')
  .eq("wishlist", wishlistId)


export async function getServerSideProps(ctx) {

  const { code, slug } = ctx.query

  const { data: wishlist } = await fetchWishlist(slug)

  // console.log(wishlist)
  if (code != wishlist.edit_code) return {
    props: {
      participationData: [],
    }
  }
  const { data: participationData, error } = await fetchProductParticipations(wishlist?.id)

  // console.log({ error })
  const sorted = participationData?.sort((a, b) => {
    if (a.Participants.name.toLowerCase() < b.Participants.name.toLowerCase()) return -1
    if (a.Participants.name.toLowerCase() > b.Participants.name.toLowerCase()) return 1

    return 0

  })
  // Pass data to the page via props
  return {
    props: {
      participationData: sorted ?? [],
    }
  }
}