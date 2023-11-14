import { useState } from 'react';


export default function ReferencesModal({ references: initialRefs = [], isEditMode, onClose }) {
    const [references, setReferences] = useState(initialRefs)
    const [formData, setFormData] = useState({ name: "", value: "" })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim() === '' || formData.value.trim() === '') {
            // Realiza una validación para campos vacíos
            alert('Por favor, complete todos los campos.');
            return;
        }


        addRef({ name: formData.name, link_url: formData.value })
        // setFormData
    }

    const addRef = (newRef) => {
        setReferences([...references, newRef])
    }
    const removeRef = (i) => {
        setReferences([...references.slice(0, i), ...references.slice(i + 1)])
    }

    return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

        <div className="bg-white p-5 rounded shadow-lg max-h-full overflow-y-scroll m-x:10 flex flex-col flex-wrap content-center w-full md:w-1/2 lg:w-1/3">

            <h1 className="text-black font-semibold text-center text-xl mb-4"> Referencias:</h1>

            {!references.length && <p className="text-black text-center mt-4">No hay referencias todavia</p>}
            <div className="gap-2 flex flex-col ">
                {references.map((ref, i) =>
                    <div key={`${ref.name}-${i}`} className="flex row gap-4">

                        <label className="text-black">{`${ref.name}:`}</label>
                        <a href={ref.link_url} className="block text-m font-medium text-black underline" target="_blank" onClick={() => onVisitPress()}>Visitar</a>
                        {isEditMode && <button className="px-1 bg-gray-200 hover:bg-gray-300 rounded" onClick={() => removeRef(i)}>➖</button>}
                    </div>)}
            </div>

            {isEditMode && <div className="text-black font-medium  text-right mt-4">

                <form onSubmit={onSubmit} className="flex flex-row gap-2">
                    <input
                        placeholder="Nombre"
                        required
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-28 p-2 border rounded text-black" />
                    <input
                        placeholder="Link"
                        required
                        type="text"
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        className="p-2 border rounded text-black " />

                    <button className="px-3 bg-gray-200 hover:bg-gray-300 rounded"> ➕</button>
                </form>
            </div>}

            <div className="flex items-center justify-center mt-8">
                <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={() => onClose(references)}>
                    Cerrar
                </button>
            </div>
        </div>
    </div>
}