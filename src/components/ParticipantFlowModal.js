import { useState, useMemo } from 'react';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';


const cloudNameEnv = process.env.NEXT_PUBLIC_CLOUD_NAME;
const uploadPresetEnv = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

export default function ParticipantFlowModal({ folderName, product, participant, onClose, onFinish, paymentMethods = [], onChangeStep }) {
    // Replace with your own cloud name
    const [cloudName] = useState(cloudNameEnv);
    // Replace with your own upload preset
    const [uploadPreset] = useState(uploadPresetEnv);

    const [uwConfig] = useState({
        cloudName,
        uploadPreset,
        sources: ["local"], // restrict the upload sources to URL and local files
        multiple: false,  //restrict upload to a single file
        folder: folderName, //upload files to the specified folder
    });


    const [formData, setFormData] = useState({
        name: participant?.name,
        amount: product?.estimated_price - product?.credit_amount,
        paymentMethod: "",
        voucherUrl: ""
    })

    const paymentMethodInfo = useMemo(() => paymentMethods.find(p => p.name === formData.paymentMethod)?.info, [formData.paymentMethod])
    const [step, setStep] = useState("initial")


    const giftDisabled = product.credit_amount > 0
    const creditDisabled = false


    const changeStep = (name) => {
        onChangeStep?.(name)
        setStep(name)
    }

    const handleGiftSubmit = (e) => {
        e.preventDefault()
        onFinish({
            isCredit: false,
            participantName: formData.name,
            amount: product?.estimated_price
        })
    }

    const handleCreditSubmit = () => {
        changeStep("payment")
    }

    const handleFinishCredit = () => {
        onFinish({
            isCredit: true,
            participantName: formData.name,
            amount: formData.amount,
            voucherUrl: formData.voucherUrl,
            paymentMethod: formData.paymentMethod
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const initialView =
        <div className="grid text-black mt-10 gap-2">
            <div className={`w-25 bg-gray-100 p-5 rounded text-center justify-center  py-10 ${giftDisabled ? "opacity-50 hover:bg-gray-100 focus:bg-gray-100 " : "cursor-pointer hover:bg-gray-400 focus:bg-gray-400"}`}
                onClick={() => !giftDisabled && changeStep("references")}>
                <p>Me encargare de toda la logistica de comprar el regalo<br />
                    <span className="text-xl">🎁
                    </span>
                </p>
            </div>
            <div className={`w-25 bg-gray-100 p-5 rounded text-center justify-center  py-10 ${creditDisabled ? "opacity-50 hover:bg-gray-100 focus:bg-gray-100 " : "cursor-pointer hover:bg-gray-400 focus:bg-gray-400"}`}
                onClick={() => !creditDisabled && changeStep("set_amount")}>
                <p >Quiero dar el dinero para que los papas se encarguen de comprar <br />
                    <span className="text-xl">💵
                    </span>
                </p>
            </div>
        </div>


    const referencesView =
        <div className="mt-5 justify-center">
            <h3 className="text-black font-semibold text-center mb-4" >Donde conseguirlo</h3>
            <div className="gap-2 flex flex-col mb-8 ">
                {(product?.references || []).length == 0 && <span className="text-black text-center">No hay referencias</span>}
                {(product?.references || []).map((ref, i) =>
                    <div key={`${ref.name}-${i}`} className="flex row gap-4">

                        <label className="text-black">{`${ref.name}:`}</label>
                        <a href={ref.link_url} className="block text-m font-medium text-black underline" target="_blank" onClick={null}>Visitar</a>
                    </div>)}
            </div>
            <form onSubmit={handleGiftSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">A nombre de:</label>
                    <input
                        disabled={participant}
                        required
                        placeholder="Escribe tu nombre"
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded text-black" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => changeStep("initial")}>
                        Regresar
                    </button>
                    <button type="submit"
                        className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-green-800 hover:bg-gray-400 ml-2">
                        Reservar regalo
                    </button>
                </div>
            </form>
        </div>


    const amountView =
        <div className="mt-5 justify-center">
            <h3 className="text-black font-semibold text-center mb-4" >Colocar monto</h3>

            <form onSubmit={handleCreditSubmit}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">A nombre de:</label>
                    <input
                        disabled={participant}
                        required
                        placeholder="Escribe tu nombre"
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded text-black" />
                </div>
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto a abonar (puedes cambiarlo):</label>
                    <input
                        required={true}
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded text-black" />
                </div>
                <div className="flex items-center justify-center">
                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => changeStep("initial")}>
                        Regresar
                    </button>
                    <button type="submit"
                        className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-green-800 hover:bg-gray-400 ml-2">
                        Ver datos de pago
                    </button>
                </div>
            </form>
        </div>

    const paymentView =
        <div className="display-felx flex-col mt-5 justify-center">

            <h2 className="mb-2 text-lg text-center font-semibold text-gray-900">{`¿Como puedo abonar mis ${formData.amount} USD?`}</h2>
            <div className="flex-col flex text-gray-400 items-center ">
                {/* <label className="self-center" for="paymentMethod">Click para ver opciones:</label> */}
                <select className="bg-gray-100 p-2 my-4 rounded" id="paymentMethod" name="paymentMethod" onChange={handleInputChange} value={formData.paymentMethod}>
                    <option value="" >Selecciona una opcion</option>
                    {paymentMethods.map(paymentMethod => (
                        <option key={paymentMethod.name} value={`${paymentMethod.name}`}>
                            {paymentMethod.name}
                        </option>
                    ))}
                </select>

                <p>{paymentMethodInfo}</p>
            </div>

            <div className="mb-2 mt-5 flex row" >

                <div>
                    <CloudinaryUploadWidget uwConfig={uwConfig} buttonText="Subir comprobante ⬆️" onSuccess={(url) => {
                        setFormData({ ...formData, voucherUrl: url })
                    }} />
                </div>
                <img className="w-16 object-contain ml-2" src={formData.voucherUrl || "https://placehold.co/400x800"} alt="Modern building architecture" />

            </div>

            <div className="flex items-center justify-center mt-5">
                <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => changeStep("set_amount")}>
                    Regresar
                </button>
                <button type="button" disabled={!formData.voucherUrl || !formData.paymentMethod} className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-green-800 hover:bg-gray-400 ml-2 disabled:cursor-not-allowed disabled:opacity-25" onClick={handleFinishCredit}>
                    Guardar mi abono
                </button>
            </div>
        </div>

    return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

        <div className="bg-white p-10 md:w-1/2 lg:w-1/3 roundedshadow-lg overflow-y-scroll max-sm:min-w-full flex flex-col flex-wrap content-center">
            <div className="flex row justify-end mb-4" style={{ marginRight: -10 }}>
                <button type="button" className="px-4 py-2 font-semibold  text-sm shadow rounded-md text-black hover:bg-gray-400" onClick={() => onClose()}>
                    X
                </button>
            </div>
            <div className="flex row bg-pink-50 p-4 rounded-lg gap-4">
                <div className="md:shrink-0">
                    <img className="w-16 h-16 object-contain" src={product.image_url || "https://placehold.co/800x400"} alt="Modern building architecture" />
                </div>
                <div>
                    <div className="uppercase tracking-wide text-l text-indigo-500 font-semibold">{product.name}</div>
                    <div className="tracking-wide text-sm text-black font-semibold mt-2">{`Precio estimado: ${product.estimated_price ? product.estimated_price + " USD" : " - "}`}</div>
                    {product.credit_amount > 0 && <div className="tracking-wide text-sm text-black font-semibold mt-2">{`Faltan: ${product.estimated_price ? product.estimated_price - product.credit_amount + " USD" : " - "}`}</div>}
                </div>
            </div>

            {step == "initial" && initialView}
            {step == "references" && referencesView}
            {step == "set_amount" && amountView}
            {step == "payment" && paymentView}


        </div>
    </div >
}