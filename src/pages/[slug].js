import { useState, useEffect, useMemo } from 'react';


import { Inter } from 'next/font/google'
import Confetti from '@/components/Conffeti'

import Product from '@/components/Product';

import * as EventTrack from "@/helpers/events"

import supabase from "@/helpers/supabase-client"

import ItemFormModal from '@/components/ItemFormModal';
import ReferencesModal from '@/components/ReferencesModal';
import ParticipantFlowModal from '@/components/ParticipantFlowModal';
import { checkIfValidUUID } from '@/helpers/utils';

const inter = Inter({ subsets: ['latin'] })

export default function Home({ wishlist, error, editMode = false, productsData, participantData, }) {

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showConffeti, setShowConffeti] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalIndicationOpen, setModalIndicationOpen] = useState(false);
  const [isModalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [products, setProducts] = useState(productsData || []);
  const [selectedProduct, setSelectedProduct] = useState();
  const [participant, setParticipant] = useState(participantData);
  const [productParticipants, setProductParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [references, setReferences] = useState(undefined)
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
    !editMode && EventTrack.send(name, participantId, productId, wishlist.id, extra)

  useEffect(() => {
    if (error) return
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
    return participant.ProductParticipants.reduce((accumulator, currentValue) => accumulator + (currentValue.amount), 0);

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

  useEffect(() => {
    let timer
    if (showConffeti) {
      timer = setTimeout(() => {
        setShowConffeti(false)
        modalType === "credit" && setModalPaymentOpen(true)
      }, 4000)
    }
    return () => timer && clearTimeout(timer)
  }, [showConffeti])

  useEffect(() => {
    let timer
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
    return () => timer && clearTimeout(timer)
  }, [showSuccessMessage])

  const updateProductOnList = (updatedProduct) => {
    if (!updatedProduct) return
    const index = products.findIndex(p => p.id == updatedProduct.id)
    if (index == -1) return

    setProducts([...products.slice(0, index), updatedProduct, ...products.slice(index + 1)])

  }

  const deleteProductOnList = (updatedProduct) => {
    if (!updatedProduct) return
    const index = products.findIndex(p => p.id == updatedProduct.id)
    if (index == -1) return

    setProducts([...products.slice(0, index), ...products.slice(index + 1)])

  }

  const addProductOnList = (updatedProduct) => {
    if (!updatedProduct) return


    setProducts([updatedProduct, ...products])

  }

  const openModal = (product, type) => {
    setIsModalOpen(true);
    setSelectedProduct(product)
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setProductParticipants([])
    setShowParticipants(false)
  };

  const handleSubmit = async ({ isCredit, participantName, amount, voucherUrl }) => {

    const productHasEstimatedPrice = selectedProduct.estimated_price !== null

    try {
      setIsLoading(true)
      let pId = participant?.id
      if (!pId) { // se crea el participante si no existe
        const { data: participantCreated, error } = await supabase
          .from('Participants')
          .insert([
            { name: participantName, wishlist: wishlist.id },
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
        amount: previusApplies[0].amount + parseInt(amount)
      } : { amount }

      const dataToSend = {
        id: previus?.id,
        product_id: selectedProduct.id,
        participant_id: pId,
        amount: isCredit ? previus.amount : selectedProduct.estimated_price,
        is_credit: isCredit,
        voucher_url: voucherUrl
      }
      const { data: productParticipants, error: productParticipantsError } = await supabase
        .from('ProductParticipants')
        .upsert(dataToSend)
        .select('*,Products(*)')

      if (productParticipantsError) throw productParticipantsError


      const newCreditAmount = productHasEstimatedPrice ? selectedProduct.credit_amount + parseInt(amount || selectedProduct.estimatedPrice) : productParticipants[0].amount

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
      closeModal()
      updateProductOnList(productUpdated[0])
      fetchParticipantById(pId)
      setShowSuccessMessage(true)
      setShowConffeti(true)

      sendEvent(isCredit ? EventTrack.EventTypes.FINISH_CREDIT : EventTrack.EventTypes.FINISH_GIFT, { productId: selectedProduct?.id, participantId: pId, extra: { amount } },)

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

  const handleProductSubmit = async (e, data) => {
    e.preventDefault();

    console.log("data to send", data)
    const { data: newProduct, error } = await supabase
      .from('Products')
      .upsert(data)
      .select('*')
      .limit(1)
      .single()

    if (!error) {
      if (data.id)
        updateProductOnList(newProduct)
      else
        addProductOnList(newProduct)

      setShowProductForm(false)
    }

  }
  const handleDelete = async (product) => {
    const res = await supabase
      .from("Products")
      .delete()
      .eq("id", product.id)
    deleteProductOnList(product)
    console.log(res)

  }

  const handleCloseReferences = async (newReferences = [], productId) => {
    if (editMode) {
      const { data: productUpdated, error: productUpdateError } = await supabase
        .from('Products')
        .update({
          references: newReferences,
        })
        .eq('id', productId)
        .select("*")


      console.log("UPDATE", productUpdated[0], productUpdateError)
      updateProductOnList(productUpdated[0])

    }
    setReferences(undefined)
  }

  // useEffect(() => {
  //   if (participant) setFormData({ ...formData, name: participant.name })
  // }, [participant])


  if (error) return <p>{error}</p>


  return (
    <main
      className={`${inter.className}`}
    >
      <div className="md:container md:mx-auto pt-10 pb-10">

        <header className="relative bg-cover bg-center bg-opacity-50 bg-blue-500 h-96 md:max-w-2xl mx-auto " style={{ backgroundImage: `url('${wishlist?.display?.cover_photo_url}')` }}>
          <button className="w-10 h-10 absolute top-2 right-2 hover:bg-white-200 bg-black rounded bg-opacity-70 active:bg-gray-500 active:bg-opacity-50" onClick={() => {
            sendEvent(EventTrack.EventTypes.OPEN_ACLARATIONS_PRESS)
            setModalIndicationOpen(true)
          }}>
            <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {false && <div className="absolute top-0 left-0 right-0 bottom-0">
            <svg fill="#000000" width="40px" height="40px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 74.207 74.207" >
              <g>
                <path d="M57.746,14.658h-2.757l-1.021-3.363c-0.965-3.178-3.844-5.313-7.164-5.313H28.801c-3.321,0-6.201,2.135-7.165,5.313
		l-1.021,3.363h-4.153C7.385,14.658,0,22.043,0,31.121v20.642c0,9.077,7.385,16.462,16.462,16.462h41.283
		c9.077,0,16.462-7.385,16.462-16.462V31.121C74.208,22.043,66.823,14.658,57.746,14.658z M68.208,51.762
		c0,5.769-4.693,10.462-10.462,10.462H16.462C10.693,62.223,6,57.53,6,51.762V31.121c0-5.769,4.693-10.462,10.462-10.462h8.603
		l2.313-7.621c0.192-0.631,0.764-1.055,1.423-1.055h18.003c0.659,0,1.23,0.424,1.423,1.057l2.314,7.619h7.204
		c5.769,0,10.462,4.693,10.462,10.462L68.208,51.762L68.208,51.762z"/>
                <path d="M37.228,25.406c-8.844,0-16.04,7.195-16.04,16.04c0,8.844,7.195,16.039,16.04,16.039s16.041-7.195,16.041-16.039
		C53.269,32.601,46.073,25.406,37.228,25.406z M37.228,51.486c-5.536,0-10.04-4.504-10.04-10.039c0-5.536,4.504-10.04,10.04-10.04
		c5.537,0,10.041,4.504,10.041,10.04C47.269,46.982,42.765,51.486,37.228,51.486z"/>
              </g>
            </svg>
          </div>}
          <div className="h-2/3 flex items-center justify-center">
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-4 text-center">
              <h1 className="text-5xl font-bold" style={{ fontFamily: "Caveat,Helvetica,Arial,sans-serif" }}>{wishlist?.display?.title}</h1>
              <p className="text-lg mt-4">{`Fecha del evento: ${wishlist?.display?.date}`}</p>
            </div>
          </div>

        </header>
        <h1 className="flex items-center justify-center font-semibold mt-8 text-3xl">Lista de regalos</h1>
        <p className="mt-2 p-4 text-center">{wishlist?.display?.description}</p>

        {editMode &&
          <div className="flex justify-center mt-10">
            <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-full shadow-sm mb-4" onClick={() => {
              setSelectedProduct({
                name: "",
                estimated_price: 0,
                credit_amount: 0,
                image_url: "",
                reference_link: "",
                reserved: false,
                priority: 0,
                visible: false,
                wishlist: wishlist?.id
              })
              setShowProductForm(true)

            }}>Agregar nuevo producto</button>
          </div>}

        {products.map(product => {
          return <Product key={product.id}
            id={product.id}
            name={product.name}
            imageUrl={product.image_url}
            referenceLink={product.reference_link}
            estimatedPrice={product.estimated_price}
            creditAmount={product.credit_amount}
            reserved={product.reserved}
            visible={product.visible}

            onReferenceLinkPress={() => {
              setReferences({ data: product?.references, productId: product.id })
              sendEvent(EventTrack.EventTypes.OPEN_REFERENCES_LIST_PRESS, { productId: product.id })
            }}
            isEditMode={editMode}
            onEditPress={() => {
              setSelectedProduct(product)
              setShowProductForm(true)
            }}
            onDeletePress={() => {
              handleDelete(product)
            }}
            fetchParticipantsInAProduct={fetchParticipantsInAProduct}

            onParticipatePress={() => {
              openModal(product, "complete")
            }}
          />
        })}

        {participant && <div className="fixed left-4 top-4 bg-black bg-opacity-50 rounded p-5">{`¡Gracias ${participant?.name}! ❤️`}</div>}

        {false && totalAmount > 0 && <div className="fixed right-10 bottom-12">
          <button className="animate-bounce bg-blue-300 hover:bg-blue-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => {
            sendEvent(EventTrack.EventTypes.OPEN_PAYMENT_METHODS_PRESS)
            setModalPaymentOpen(true)
          }} >
            <span>{`Total: ${totalAmount} USD`}</span>
          </button>
        </div>}

        {showSuccessMessage && < div id="toast-bottom-left" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow bottom-5 left-5 dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800" role="alert">
          <div className="text-sm font-normal">Gracias por tu aporte, te lo agradecemos un monton ❤️</div>
        </div>}


      </div>

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

              <h2 className="mb-2 text-lg text-center font-semibold text-gray-900">{`¿Como puedo abonar mis ${totalAmount} USD?`}</h2>
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

      {editMode && showProductForm &&
        <ItemFormModal
          folderName={wishlist?.slug}
          data={selectedProduct}
          onSubmit={handleProductSubmit}
          onClosePress={() => {
            setShowProductForm(false);
            setSelectedProduct(null);
          }}
          nonEditable={["id"]}
          nonVisible={["Participants", "wishlist", "created_at", "credit_amount", "reserved", "references"]}
          exclude={["Participants", "credit_amount", "reserved", "references"]}
        />}

      {(references?.data === null || references?.data) &&
        <ReferencesModal
          onVisitPress={() => {
            sendEvent(EventTrack.EventTypes.OPEN_REFERENCE_PRESS, { productId: references?.productId })
          }}
          isEditMode={editMode}
          references={references?.data || []}
          onClose={(data) => handleCloseReferences(data, references?.productId)}
        />}



      {isModalOpen && selectedProduct &&
        <ParticipantFlowModal
          folderName={wishlist?.slug}
          product={selectedProduct}
          onClose={closeModal}
          participant={participant}
          onFinish={handleSubmit}
        />}

      {showConffeti && <Confetti />}

    </main >
  )
}


const fetchParticipantByNotionIdOrSlug = async (participantId, wishlist) => {
  const isUuid = checkIfValidUUID(participantId)
  const base = supabase
    .from('Participants')
    .select('*,ProductParticipants(*)')
    .eq("wishlist", wishlist)

  if (isUuid) base.eq("notion_id", participantId)
  if (!isUuid) base.eq("slug", participantId)

  return base
    .limit(1)
    .single()
}

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
const fetchWishlist = (slug) => supabase
  .from('Wishlists')
  .select('*')
  .eq("slug", slug)
  .limit(1)
  .single()


export async function getServerSideProps(ctx) {
  const { p: participantId, code } = ctx.query
  const { slug } = ctx.query


  if (!slug) return {
    props: {
      error: "Lista invalida"
    }
  }

  const { data: wishlist } = await fetchWishlist(slug)
  if (!wishlist) return {
    props: {
      error: "Esta lista no existe"
    }
  }
  const editMode = code === wishlist?.edit_code

  const { data: dataProducts } = await fetchProducts(wishlist, editMode)
  let participant = null
  if (participantId) {
    const { data, error } = await fetchParticipantByNotionIdOrSlug(participantId, wishlist)
    console.log(participantId, data, error)
    if (data) participant = data
  }

  // Pass data to the page via props

  return {
    props: {
      productsData: dataProducts || null,
      participantData: participant || null,
      wishlist,
      editMode
    }
  }
}