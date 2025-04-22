// src/pages/api/cloudinary-signature.js - Versione sicura

// import { v2 as cloudinary } from "cloudinary";

// // Configurazione di Cloudinary
// cloudinary.config({
//   cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
//   api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
//   api_secret: import.meta.env.CLOUDINARY_API_SECRET,
// });

export async function POST({ request }) {
  try {
    // Estrai i parametri dalla richiesta
    const body = await request.json();
    const { paramsToSign = {} } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Per sicurezza, dovremmo generare la firma lato server
    // Qui la versione semplificata per il POC
    // In produzione, questo dovrebbe essere fatto in un endpoint serverless sicuro

    // Parametri per la firma
    const signParams = {
      timestamp,
      folder: paramsToSign.folder || "blog-images",
      api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
    };

    // Nota: in un server reale useremmo cloudinary.utils.api_sign_request
    // ma per il POC, possiamo simulare una firma valida
    const signature = "simulazione_firma_temporanea";

    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
        folder: paramsToSign.folder || "blog-images",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
