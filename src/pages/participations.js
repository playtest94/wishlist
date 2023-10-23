import { useState, useEffect, useMemo } from 'react';


import { Inter } from 'next/font/google'
import Confetti from '@/components/Conffeti'

import Product from '@/components/Product';

import * as EventTrack from "@/helpers/events"

import supabase from "@/helpers/supabase-client"

const inter = Inter({ subsets: ['latin'] })


const nonEditable = ["id", "created_at", "product_id", "participant_id"]

export default function Participations({ participationData, productsData, participantData }) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showConffeti, setShowConffeti] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(false);
  const [isModalIndicationOpen, setModalIndicationOpen] = useState(false);
  const [isModalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [participations, setParticipations] = useState(participationData || []);
  const [products, setProducts] = useState(productsData || []);
  const [selectedProduct, setSelectedProduct] = useState();
  const [participant, setParticipant] = useState(participantData);
  const [productParticipants, setProductParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalType, setModalType] = useState();



  const sendEvent = (name, { participantId = participant?.id, productId = selectedProduct?.id, extra = {} } = {}) =>
    EventTrack.send(name, participantId, productId, extra)


  const totalAmount = useMemo(() => {
    if (!participant?.ProductParticipants) return 0
    return participant.ProductParticipants.reduce((accumulator, currentValue) => accumulator + (currentValue.is_credit ? currentValue.amount : 0), 0);

  }, [participant?.ProductParticipants])
  const [formData, setFormData] = useState({

  });

  const fetchParticipantsInAProduct = (productId) => {
    return supabase
      .from('ProductParticipants')
      .select('*,Participants(*)')
      .eq("product_id", productId)
  };

  const openModal = (product, type) => {
    setIsModalOpen(true);
    setSelectedProduct(product)
    setModalType(type)
    if (type === 'complete') setFormData({ ...formData, amount: product.estimated_price || '' })
  };

  const closeModal = () => {
    setDetailData(null)
  }


  const handleSubmit = async (e) => {
    e.preventDefault();



    const dataToSend = {}

    Object.keys(formData).forEach((key) => {
      if (!nonEditable.includes(key) && typeof (formData[key]) != "object") {
        dataToSend[key] = formData[key]
      }
    })

    console.log("dataToSend", dataToSend)
    const { data, error } = await supabase
      .from('ProductParticipants')
      .update(dataToSend)
      .eq('id', formData.id)
      .select('*, Participants(*), Products(*)')

    if (!error && data.length) {
      updateParticipationOnList(data[0])
      setDetailData(null)
    }

    console.log("update", data, error)

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

  console.log(detailData)

  return (
    <main
      className={`${inter.className}`}
    >
      <div className="md:container md:mx-auto pt-10 pb-10">

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
                  Es Abono?
                </th>
                <th scope="col" className="px-6 py-3">

                </th>
              </tr>
            </thead>
            <tbody>
              {participations.filter(p => p.is_credit).map((participation) => {
                const {
                  id,
                  is_credit: isCredit,
                  amount,
                  Products: product,
                  Participants: participant } = participation

                return <tr key={id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {participant.name}
                  </th>
                  <td className="px-6 py-4">
                    {`${product.name} - ${product.reserved ? "RESERVADO" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    {amount}
                  </td>
                  <td className="px-6 py-4">
                    {isCredit ? "SI" : "NO"}
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
                  Es Abono?
                </th>
                <th scope="col" className="px-6 py-3">

                </th>
              </tr>
            </thead>
            <tbody>
              {participations.filter(p => !p.is_credit).map((participation) => {
                const {
                  id,
                  is_credit: isCredit,
                  amount,
                  Products: product,
                  Participants: participant } = participation

                return <tr key={id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {participant.name}
                  </th>
                  <td className="px-6 py-4">
                    {`${product.name} - ${product.reserved ? "RESERVADO" : ""}`}
                  </td>
                  <td className="px-6 py-4">
                    {amount}
                  </td>
                  <td className="px-6 py-4">
                    {isCredit ? "SI" : "NO"}
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
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

            <div className="bg-white p-5 rounded shadow-lg overflow-y-scroll ">

              <form onSubmit={handleSubmit} >

                {Object.keys(formData).map(key => {


                  if (typeof (formData[key]) === "object" && formData[key].name) {
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


const fetchProductParticipations = () => supabase
  .from('ProductParticipants')
  .select('*, Participants(*), Products(*)')


export async function getServerSideProps(ctx) {

  const { code } = ctx.query

  if (code != "2904") return {
    props: {
      participationData: [],
    }
  }
  const { data: participationData } = await fetchProductParticipations()

  const sorted = participationData?.sort((a, b) => {
    if (a.Participants.name.toLowerCase() < b.Participants.name.toLowerCase()) return -1
    if (a.Participants.name.toLowerCase() > b.Participants.name.toLowerCase()) return 1

    return 0

  })
  console.log(sorted.map(e => e.Participants.name))
  // Pass data to the page via props
  return {
    props: {
      participationData: sorted ?? [],
    }
  }
}