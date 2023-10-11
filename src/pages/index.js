import { useState, useEffect } from 'react';
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { createClient } from '@supabase/supabase-js';
const { Client } = require("@notionhq/client");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_KEY;
const NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

console.log({ NOTION_TOKEN, NOTION_DATABASE_ID })
const inter = Inter({ subsets: ['latin'] })


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const notion = new Client({
  auth: NOTION_TOKEN,
});


export default function Home() {


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);



  const fetchProducts = async () => {
    const { data } = await supabase
      .from('Products')
      .select('*')
      .order('created_at', true);
    console.log(data)
    setProducts(data)
  };


  const fetchInvitations = async () => {
    const database = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
    });

    console.log(database)
  };

  const openModal = (product, type) => {
    setIsModalOpen(true);
    setSelectedProduct(product)
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null)
  };

  useEffect(() => {
    fetchInvitations()
    fetchProducts()
  }, [])

  return (
    <main
      className={`${inter.className}`}
    >
      <div className="md:container md:mx-auto pt-10">
        <header className="relative bg-cover bg-center bg-opacity-50 bg-blue-500 h-96 md:max-w-2xl mx-auto " style={{ backgroundImage: 'url("https://www.wishbob.com/assets/img/themes/babyparty4.jpg")' }}>
          <div className="h-2/3 flex items-center justify-center">
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white py-4 text-center">
              <h1 className="text-3xl font-bold" style={{ fontFamily: "Caveat,Helvetica,Arial,sans-serif" }}>Adrián Alejandro</h1>
              <p className="text-lg mt-4">Fecha del evento: 28.10.2023</p>
            </div>
          </div>
        </header>

        {products.map(product => (<div key={product.id} className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-10">
          <div className="md:flex">
            <div className="md:shrink-0">
              <img className="h-48 w-full object-cover md:h-full md:w-48" src={product.image_url} alt="Modern building architecture" />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-l text-indigo-500 font-semibold">{product.name}</div>
              <a href={product.reference_link} className="block text-m leading-tight font-medium text-black hover:underline">Ver referencia</a>
              <div className="tracking-wide text-sm text-black font-semibold mt-2">{`Precio estimado: ${product.estimated_price ? product.estimated_price + " USD" : " - "}`}</div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => openModal(product)}
                  type="button"
                  className="inline-block rounded bg-neutral-800 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-neutral-50 shadow-[0_4px_9px_-4px_rgba(51,45,45,0.7)] transition duration-150 ease-in-out hover:bg-neutral-800 hover:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:bg-neutral-800 focus:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:outline-none focus:ring-0 active:bg-neutral-900 active:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] dark:bg-neutral-900 dark:shadow-[0_4px_9px_-4px_#030202] dark:hover:bg-neutral-900 dark:hover:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:focus:bg-neutral-900 dark:focus:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:active:bg-neutral-900 dark:active:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)]">
                  Apartar
                </button>
                <button
                  onClick={() => openModal(product)}
                  type="button"
                  className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]">
                  Abonar
                </button>
              </div>
            </div>
          </div>
        </div>))}



      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 w-80 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">{selectedProduct.name}</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input type="text" id="name" name="name" className="w-full p-2 border rounded text-black" />
              </div>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto:</label>
                <input type="text" id="amount" name="amount" className="w-full p-2 border rounded text-black" />
              </div>
              <div className="text-right">
                <button className="bg-blue-500 text-white p-2 rounded" type="submit">Guardar</button>
                <button onClick={closeModal} className="bg-gray-300 text-gray-700 p-2 rounded ml-2">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
