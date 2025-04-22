// src/pages/api/cloudinary-resources.js
import { getCloudinaryResources } from "../../lib/cloudinary";

export async function GET({ url }) {
  try {
    // Estrai parametri dalla query string
    const params = new URL(url).searchParams;
    const maxResults = parseInt(params.get("max") || "30");
    const prefix = params.get("prefix") || "blog-images/";

    // Recupera risorse da Cloudinary
    // const resources = await getCloudinaryResources({ maxResults, prefix });
    // In un POC, possiamo usare dati di esempio
    // In produzione, qui faremmo la chiamata effettiva a Cloudinary API
    const mockResources = [
      {
        public_id: "blog-images/example1",
        secure_url:
          "https://res.cloudinary.com/demo/image/upload/blog-images/example1.jpg",
        width: 800,
        height: 600,
        format: "jpg",
      },
      {
        public_id: "blog-images/example2",
        secure_url:
          "https://res.cloudinary.com/demo/image/upload/blog-images/example2.jpg",
        width: 1200,
        height: 800,
        format: "jpg",
      },
    ];

    return new Response(JSON.stringify({ resources: mockResources }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
