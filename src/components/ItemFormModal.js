import { useState } from 'react';
import CloudinaryUploadWidget from './CloudinaryUploadWidget';

const cloudNameEnv = process.env.NEXT_PUBLIC_CLOUD_NAME;
const uploadPresetEnv = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

export default function ItemFormModal({ folderName, data = {}, onSubmit, onClosePress, nonEditable = [], nonVisible = [], exclude = [] }) {

    const [formData, setFormData] = useState(data);
    const [isLoading, setIsLoading] = useState(false)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Replace with your own cloud name
    const [cloudName] = useState(cloudNameEnv);
    // Replace with your own upload preset
    const [uploadPreset] = useState(uploadPresetEnv);

    // Upload Widget Configuration
    // Remove the comments from the code below to add
    // additional functionality.
    // Note that these are only a few examples, to see
    // the full list of possible parameters that you
    // can add see:
    //   https://cloudinary.com/documentation/upload_widget_reference

    const [uwConfig] = useState({
        cloudName,
        uploadPreset,
        // cropping: true, //add a cropping step
        // showAdvancedOptions: true,  //add advanced options (public_id and tag)
        // sources: [ "local", "url"], // restrict the upload sources to URL and local files
        multiple: false,  //restrict upload to a single file
        folder: folderName, //upload files to the specified folder
        // tags: ["users", "profile"], //add the given tags to the uploaded files
        // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
        clientAllowedFormats: [".png", "jpeg"], //restrict uploading to image files only
        // maxImageFileSize: 2000000,  //restrict file size to less than 2MB
        // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
        // theme: "purple", //change to a purple theme
    });


    const handleSubmit = async (e) => {
        setIsLoading(true)

        const filtered = {}

        Object.keys(data).forEach((key) => {
            if (!exclude.includes(key))
                filtered[key] = formData[key];
        })

        setFormData(filtered)

        await onSubmit(e, filtered)
        setIsLoading(false)

    }

    return <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

        <div className="bg-white p-5 w-100 rounded shadow-lg max-h-full overflow-y-scroll max-md:min-w-full md:w-8/12 m-x:10">
            <form onSubmit={handleSubmit} >

                {Object.keys(formData).map(key => {

                    if (nonVisible.includes(key)) return null
                    if (key.endsWith("url")) {

                        return <div className="mb-2" key={key}>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">{`${key}:`}</label>

                            <CloudinaryUploadWidget uwConfig={uwConfig} onSuccess={(url) => {
                                setFormData({ ...formData, [key]: url })
                            }} />

                            <img className="h-48 w-48 object-contain" src={formData[key] || "https://placehold.co/800x400"} alt="Modern building architecture" />

                        </div>
                    }
                    if (formData[key] && typeof (formData[key]) === "object" && formData[key].name) {
                        return <div className="mb-4" key={`${key}_name`}>
                            <label htmlFor="amount" className="text-sm font-medium text-gray-700">{`${key}_name:`}</label>
                            <input
                                disabled={true}
                                id={`${key}_name`}
                                name={`${key}_name`}
                                value={formData[key].name}
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
                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400 ml-2" onClick={onClosePress}>
                        Cerrar
                    </button>
                </div>
            </form>


        </div>
    </div>
}