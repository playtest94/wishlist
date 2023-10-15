import { useState, useEffect, useMemo } from 'react';


import { Inter } from 'next/font/google'
import Confetti from 'react-confetti'

import Product from '@/components/Product';

import * as EventTrack from "@/helpers/events"

import supabase from "@/helpers/supabase-client"

const inter = Inter({ subsets: ['latin'] })

export default function Home({ productsData, participantData }) {

  const { width, height } = useWindowSize()
  const [showConffeti, setShowConffeti] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalIndicationOpen, setModalIndicationOpen] = useState(false);
  const [isModalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [products, setProducts] = useState(productsData || []);
  const [selectedProduct, setSelectedProduct] = useState();
  const [participant, setParticipant] = useState(participantData);
  const [productParticipants, setProductParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalType, setModalType] = useState();


  const resetDatabase = async () => {

    const { data, error } = await supabase
      .from('Products')
      .update({ reserved: false, credit_amount: 0 })
      .gte('id', 0)
      .select()

    await supabase
      .from("ProductParticipants")
      .delete()
      .gt("id", 1)
  }

  useEffect(() => {
    // resetDatabase()
  }, [])

  const sendEvent = (name, { participantId = participant?.id, productId = selectedProduct?.id, extra = {} } = {}) =>
    EventTrack.send(name, participantId, productId, extra)

  useEffect(() => {
    const itemKey = "first_open3"
    const isFirstTime = localStorage.getItem(itemKey)
    if (isFirstTime == null) {
      setModalIndicationOpen(true)
      localStorage.setItem(itemKey, true)
      localStorage.setItem("first_id", participant?.id)
      sendEvent(EventTrack.EventTypes.FIRST_LOAD)
    } else {
      sendEvent(EventTrack.EventTypes.LOAD)
    }
  }, [])

  const totalAmount = useMemo(() => {
    if (!participant?.ProductParticipants) return 0
    return participant.ProductParticipants.reduce((accumulator, currentValue) => accumulator + (currentValue.is_credit ? currentValue.amount : 0), 0);

  }, [participant?.ProductParticipants])
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
  });

  const fetchParticipantsInAProduct = (productId) => {
    return supabase
      .from('ProductParticipants')
      .select('*,Participants(*)')
      .eq("product_id", productId)
  };

  const handleFetchParticipantsInAProduct = async (productId) => {
    const { data, error } = await fetchParticipantsInAProduct(productId)
    if (!error) setProductParticipants(data)
  };

  const fetchParticipantById = async (participantId) => {
    const { data, error } = await supabase
      .from('Participants')
      .select('*,ProductParticipants(*)')
      .eq("id", participantId)

    if (!error && data.length) setParticipant(data[0])
  };


  const updateProductOnList = (updatedProduct) => {
    if (!updatedProduct) return
    const index = products.findIndex(p => p.id == updatedProduct.id)
    if (index == -1) return

    setProducts([...products.slice(0, index), updatedProduct, ...products.slice(index + 1)])

  }

  const openModal = (product, type) => {
    setIsModalOpen(true);
    setSelectedProduct(product)
    setModalType(type)
    if (type === 'complete') setFormData({ ...formData, amount: product.estimated_price || '' })
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setProductParticipants([])
    setShowParticipants(false)
    setFormData({ ...formData, amount: "" })
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCredit = modalType == "credit"
    const productHasEstimatedPrice = selectedProduct.estimated_price !== null
    if (formData.name.trim() === '' || (isCredit && formData.amount.trim() === '')) {
      // Realiza una validación para campos vacíos
      alert('Por favor, complete todos los campos.');
      return;
    }

    // return
    // Si no hay campos vacíos, puedes enviar los datos al endpoint.
    try {
      setIsLoading(true)
      let pId = participant?.id
      if (!pId) { // se crea el participante si no existe
        const { data: participantCreated, error } = await supabase
          .from('Participants')
          .insert([
            { name: formData.name },
          ])
          .select()
        if (error) throw error
        pId = participantCreated.length ? participantCreated[0].id : null
        setParticipant(participantCreated[0])
      }

      const { data: previusApplies, error: previusAppliesError } = await supabase // se verifica si ya participo en este producto
        .from('ProductParticipants')
        .select('*')
        .eq("product_id", selectedProduct.id)
        .eq("participant_id", pId)

      if (previusAppliesError) throw previusAppliesError


      const previus = previusApplies.length ? {
        id: previusApplies[0].id,
        amount: previusApplies[0].amount + parseInt(formData.amount)
      } : { amount: formData.amount }

      const dataToSend = {
        id: previus?.id,
        product_id: selectedProduct.id,
        participant_id: pId,
        amount: isCredit ? previus.amount : selectedProduct.estimated_price,
        is_credit: isCredit
      }
      const { data: productParticipants, error: productParticipantsError } = await supabase
        .from('ProductParticipants')
        .upsert(dataToSend)
        .select('*,Products(*)')

      if (productParticipantsError) throw productParticipantsError


      const newCreditAmount = productHasEstimatedPrice ? selectedProduct.credit_amount + parseInt(formData.amount || selectedProduct.estimatedPrice) : productParticipants[0].amount

      const { data: productUpdated, error: productUpdateError } = await supabase
        .from('Products')
        .update({
          credit_amount: newCreditAmount,
          reserved: !isCredit ||
            (productHasEstimatedPrice && newCreditAmount >= selectedProduct.estimated_price)
        })
        .eq('id', selectedProduct.id)
        .select("*,Participants(id,name)")

      if (!productUpdated.length || productUpdateError) {//rollback relationship
        await supabase
          .from("ProductParticipants")
          .delete()
          .eq("id", productParticipants[0].id)
        throw productUpdateError
      }

      updateProductOnList(productUpdated[0])
      setFormData({ ...formData, amount: "" })
      fetchParticipantById(pId)

      alert('Gracias por tu aporte, te lo agradecemos un monton');
      isCredit && setModalPaymentOpen(true)
      setShowConffeti(true)
      closeModal()
    } catch (error) {
      console.log("throw error", error)
      alert('Hubo un error al enviar los datos');
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (participant) setFormData({ ...formData, name: participant.name })
  }, [participant])

  useEffect(() => {

  }, [])

  return (
    <main
      className={`${inter.className}`}
    >
      <div className="md:container md:mx-auto pt-10 pb-10">

        <header className="relative bg-cover bg-center bg-opacity-50 bg-blue-500 h-96 md:max-w-2xl mx-auto " style={{ backgroundImage: 'url("https://res.cloudinary.com/dzbdfh66n/image/upload/v1697052496/wishlist/cusnrvwyvkomval5lhwj.png")' }}>
          <button className="w-10 h-10 absolute top-2 right-2 hover:bg-white-200 bg-black rounded bg-opacity-70 active:bg-gray-500 active:bg-opacity-50" onClick={() => {
            sendEvent(EventTrack.EventTypes.OPEN_ACLARATIONS_PRESS)
            setModalIndicationOpen(true)
          }}>
            <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="h-2/3 flex items-center justify-center">
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-4 text-center">
              <h1 className="text-5xl font-bold" style={{ fontFamily: "Caveat,Helvetica,Arial,sans-serif" }}>Adrián Alejandro</h1>
              <p className="text-lg mt-4">Fecha del evento: 28.10.2023</p>
            </div>
          </div>

        </header>
        <h1 className="flex items-center justify-center font-semibold mt-8 text-3xl">Lista de regalos</h1>
        <p className="mt-2 p-4 text-center">Nuestro mayor regalo es compartir este momento tan especial con ustedes. Pero si le quieres dar un obsequio a nuestro bebe acá te dejamos algunas opciones:</p>

        {products.map(product => (
          <Product key={product.id}
            id={product.id}
            name={product.name}
            imageUrl={product.image_url}
            referenceLink={product.reference_link}
            estimatedPrice={product.estimated_price}
            creditAmount={product.credit_amount}
            reserved={product.reserved}
            onGiftPress={() => {
              sendEvent(EventTrack.EventTypes.GIFT_PRESS, { productId: product.id })
              openModal(product, "complete")
            }}
            onCreditPress={() => {
              sendEvent(EventTrack.EventTypes.CREDIT_PRESS, { productId: product.id })
              openModal(product, "credit")
            }}
            onReferenceLinkPress={() => {
              sendEvent(EventTrack.EventTypes.OPEN_REFERENCE_PRESS, { productId: product.id })
            }}
            fetchParticipantsInAProduct={fetchParticipantsInAProduct}
          />
        ))}

        {participant && <div className="fixed left-4 top-4 bg-black bg-opacity-50 rounded p-5">{`¡Gracias ${participant?.name}! ❤️`}</div>}

        {totalAmount > 0 && <div className="fixed right-10 bottom-12">
          <button className="bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => {
            sendEvent(EventTrack.EventTypes.OPEN_PAYMENT_METHODS_PRESS)
            setModalPaymentOpen(true)
          }} >
            <span>{`Total: ${totalAmount} USD`}</span>
          </button>
        </div>}

      </div>


      {
        isModalOpen && selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 w-80 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-black">{selectedProduct.name}</h2>

              {Boolean(selectedProduct.Participants.length) && <div>

                {!showParticipants && <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-full shadow-sm mb-4" onClick={() => {
                  handleFetchParticipantsInAProduct(selectedProduct.id)
                  setShowParticipants(true)
                }}>Ver participantes</button>}
                {showParticipants && <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-full shadow-sm mb-2" onClick={() => setShowParticipants(false)}>Ocultar participantes</button>}
                {showParticipants && <div className="mb-6">
                  {productParticipants.map(participant => <div key={participant.id} className="grid grid-cols-2 gap-4">
                    <div className="text-black text-sm">{participant.Participants.name}</div>
                    <div className="text-black text-sm">{participant.amount === null ? "-" : `${participant.amount} USD`}</div>
                  </div>)}
                </div>}
              </div>}
              {modalType == "complete" && <p className="text-black text-xs mb-2">Entenderemos que te encargaras de la compra del regalo, si no es asi puedes utilizar la opcion de abonar y nosotros nos encargamos❤️</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">A nombre de:</label>
                  <input
                    disabled={participant}
                    required
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black" />
                </div>
                {modalType == "credit" && <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto:</label>
                  <input
                    required={modalType == "credit"}
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-black" />
                </div>}
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

      {
        isModalIndicationOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-5 w-100 rounded shadow-lg">

              <h2 className="mb-2 text-xl text-center font-semibold text-gray-900">Aclaraciones:</h2>
              <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
                <li>
                  Regalar: Entendemos que te haras cargo la gestion de comprar y pagar el producto.
                </li>
                <li>
                  Abonar: Significa que aportaras una parte del costo del producto, y nosotros nos encargaremos de toda la gestion.
                </li>
                <li>
                  Si tu obsequio lo pides por internet y no llega a tiempo, no te preocupes, puedes darnoslo cuando llegue
                </li>
                <li>
                  Puedes abonar en distintos productos y abajo a tu derecha aparecera un boton azul(presionalo para ver las opciones de pago) con el monto total que todos tus abonos.
                </li>
              </ul>

              <div className="flex text-black max-w-md mt-5">
                <svg width="30px" height="30px" viewBox="0 0 24 24" className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Arriba a la derecha tienes un boton para ver esto de nuevo
              </div>

              <div className="flex items-center justify-center mt-5">
                <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => setModalIndicationOpen(false)}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        isModalPaymentOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-5 w-100 rounded shadow-lg">

              <h2 className="mb-2 text-xl text-center font-semibold text-gray-900">¿Como puedo abonar?</h2>
              <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
                <li>
                  ZELLE: ealvarado.btm@gmail.com
                </li>
                <li>
                  ZINLI: pdiaz.btm@gmail.com
                </li>
                <li>
                  BINANCEPAY: diaz2209@gmail.com
                </li>
                <li>
                  PAYONEER: pedro.diaz.btm@gmail.com
                </li>
                <li>
                  EFECTIVO (Puede ser el dia del evento)
                </li>

              </ul>

              <div className="flex text-black max-w-md mt-10">
                <svg width="30px" height="30px" viewBox="0 0 24 24" className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Recuerda enviarnos el comprobante por whatsapp
              </div>

              <div className="flex items-center justify-center mt-5">
                <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => setModalPaymentOpen(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )
      }


    </main >
  )
}

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}



const fetchParticipantByNotionId = async (participantId) => supabase
  .from('Participants')
  .select('*,ProductParticipants(*)')
  .eq("notion_id", participantId)


const fetchProducts = () => supabase
  .from('Products')
  .select('*,Participants(id,name))')
  .order('reserved', { ascending: true })
  .order('credit_amount', { ascending: false })
  .order('priority', { ascending: false });




export async function getServerSideProps(ctx) {
  console.log("args", ctx.query)
  const { p: notionId } = ctx.query
  const { data: dataProducts } = await fetchProducts()
  let participant = null
  if (notionId) {
    const { data } = await fetchParticipantByNotionId(notionId)
    if (data?.length) participant = data[0]
  }
  // Pass data to the page via props
  return {
    props: {
      productsData: dataProducts || null,
      participantData: participant || null
    }
  }
}