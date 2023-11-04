
import { useState } from 'react';

export default function Product({
    id,
    name,
    imageUrl,
    referenceLink,
    estimatedPrice,
    creditAmount,
    reserved,
    visible,
    onGiftPress,
    onCreditPress,
    isEditMode,
    onEditPress,
    onDeletePress,
    onReferenceLinkPress,
    fetchParticipantsInAProduct }) {

    const [showParticipants, setShowParticipants] = useState(false)
    const [productParticipants, setProductParticipants] = useState([]);

    const handleFetchParticipantsInAProduct = async (productId) => {
        const { data, error } = await fetchParticipantsInAProduct(productId)
        console.log(data)
        if (!error) setProductParticipants(data)
    };

    return <div key={id} className={`max-w-md mx-auto bg-white ${visible ? 'opacity-100' : 'opacity-60'} rounded-xl shadow-md overflow-hidden md:max-w-xl mt-10`}>
        <div className="md:flex">
            <div className="md:shrink-0">
                <img className="h-48 w-full object-contain md:h-48 md:w-48" src={imageUrl || "https://placehold.co/800x400"} alt="Modern building architecture" />
            </div>
            <div className="p-8 w-full pr-10">
                <div className="uppercase tracking-wide text-l text-indigo-500 font-semibold">{name}</div>
                <div className="flex row items-center gap-4">
                    <p class="underline underline-offset-4 cursor-pointer text-black font-semibold" onClick={onReferenceLinkPress}>Donde conseguirlo</p>
                </div>

                {reserved && <div className="tracking-wide text-sm text-black font-semibold mt-2">{`RESERVADO`}</div>}
                {!reserved && <div className="tracking-wide text-sm text-black font-semibold mt-2">{`Precio estimado: ${estimatedPrice ? estimatedPrice + " USD" : " - "}`}</div>}
                {estimatedPrice != null && creditAmount > 0 && !reserved &&
                    <div className="tracking-wide text-m text-black font-semibold">{`Restan: ${estimatedPrice ? estimatedPrice - creditAmount + " USD" : " - "}`}</div>}
                {estimatedPrice != null &&
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-300">
                        <div className="bg-green-600 h-2.5 rounded-full mt-4" style={{ width: `${creditAmount >= estimatedPrice ? "100" : String(creditAmount * 100 / estimatedPrice)}%` }} />
                    </div>}
                {(!reserved || isEditMode) && < div className="grid grid-cols-3 gap-4 mt-6">
                    {!reserved && <button
                        disabled={creditAmount > 0}
                        onClick={onGiftPress}
                        type="button"
                        className="inline-block rounded px-0 pt-3 pb-3 bg-neutral-800 text-xs font-medium uppercase leading-normal text-neutral-50 shadow-[0_4px_9px_-4px_rgba(51,45,45,0.7)] transition duration-150 ease-in-out hover:bg-neutral-800 hover:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:bg-neutral-800 focus:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] focus:outline-none focus:ring-0 active:bg-neutral-900 active:shadow-[0_8px_9px_-4px_rgba(51,45,45,0.2),0_4px_18px_0_rgba(51,45,45,0.1)] dark:bg-neutral-900 dark:shadow-[0_4px_9px_-4px_#030202] dark:hover:bg-neutral-900 dark:hover:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:focus:bg-neutral-900 dark:focus:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] dark:active:bg-neutral-900 dark:active:shadow-[0_8px_9px_-4px_rgba(3,2,2,0.3),0_4px_18px_0_rgba(3,2,2,0.2)] disabled:opacity-25">
                        Regalar 🎁
                    </button>}
                    {!reserved && <button
                        onClick={onCreditPress}
                        type="button"
                        className="inline-block rounded px-0 pt-3 pb-3 bg-primary text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]">
                        Abonar 💵
                    </button>}
                    {isEditMode && < div className="flex row items-center gap-1">
                        <button
                            onClick={onEditPress}
                            type="button"
                            className="inline-block w-8 rounded px-0 py-2 bg-primary text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]">
                            ✏️
                        </button>
                        <button
                            onClick={onDeletePress}
                            type="button"
                            className="inline-block w-8 rounded px-0 py-2  bg-primary text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]">
                            🗑️
                        </button>
                    </div>}
                </div>}


                {reserved && <h1 className="flex items-center justify-center font-semibold mt-8 text-black">¡GRACIAS!</h1>}
                {reserved && !showParticipants && <div className="flex items-center justify-center ">
                    <button className=" px-4 py-2 text-sm bg-cyan-500 text-white rounded-full shadow-sm mb-4" onClick={() => {
                        handleFetchParticipantsInAProduct(id)
                        setShowParticipants(true)
                    }}>Ver participantes
                    </button>
                </div>}
                {showParticipants && <div className="flex items-center justify-center ">
                    <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-full shadow-sm mb-2" onClick={() => setShowParticipants(false)}>
                        Ocultar participantes
                    </button>
                </div>}

                {showParticipants && <div className="mb-6">

                    {productParticipants.map(participant => <div key={participant.id} className="grid grid-cols-2 gap-4 ">
                        <div className="text-black text-sm text-right">{participant.Participants.name}</div>
                        <div className="text-black text-sm text-left">{participant.amount === null ? "- - - - - - - --> ❤️" : `${participant.amount} USD`}</div>
                    </div>)}
                </div>}
            </div>
        </div>
    </div >
}