import { createContext, useEffect, useState } from "react";

var myWidget

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function CloudinaryUploadWidget({ uwConfig, onSuccess, buttonText = "Subir imagen ⬆️" }) {
  const [loaded, setLoaded] = useState(false);
  const windowRef = window.cloudinary

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById("uw");
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("id", "uw");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.addEventListener("load", () => setLoaded(true));
        document.body.appendChild(script);


      } else {
        // If already loaded, update the state
        setLoaded(true);

      }
    }
  }, [loaded]);


  useEffect(() => {
    return () => myWidget = null
  }, [])
  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>

      <button
        id="upload_widget"
        className="bg-gray-200 p-2 rounded m-2 text-black text-sm"
        onClick={() => {
          if (!myWidget) {
            myWidget = window.cloudinary.createUploadWidget(
              uwConfig,
              (error, result) => {
                if (!error && result && result.event === "success") {
                  // console.log("Done! Here is the image info: ", result.info);
                  onSuccess(result.info.secure_url);
                }
              }
            );
          }
          myWidget.open()
        }}
        type="button"
      >{buttonText}
      </button>



    </CloudinaryScriptContext.Provider>
  );
}

export default CloudinaryUploadWidget;
export { CloudinaryScriptContext };
