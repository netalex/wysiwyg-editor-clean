// netlify/functions/git-gateway-token.js

const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

/**
 * Funzione serverless Netlify per generare un token JWT per Git Gateway
 *
 * Questa funzione autentica l'utente contro Supabase e genera un token JWT
 * compatibile con Git Gateway per permettere l'accesso al repository
 */
exports.handler = async (event, context) => {
  // Controlla se la richiesta è una POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // Estrai i dati dalla richiesta
    const { supabase_token } = JSON.parse(event.body);

    if (!supabase_token) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing supabase_token in request body",
        }),
      };
    }

    // Verifica il token Supabase con la chiave segreta di Supabase
    // Questo richiede la chiave segreta di Supabase come variabile d'ambiente
    const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

    if (!SUPABASE_JWT_SECRET) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase JWT secret not configured" }),
      };
    }

    let decodedSupabaseToken;
    try {
      decodedSupabaseToken = jwt.verify(supabase_token, SUPABASE_JWT_SECRET);
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Supabase token" }),
      };
    }

    // Estrai l'ID utente e gli altri metadati dal token Supabase
    const {
      sub: user_id,
      email,
      app_metadata,
      user_metadata,
    } = decodedSupabaseToken;

    // Controlla se l'utente è un amministratore verificando i ruoli in app_metadata
    // Questo è un esempio, adatta la logica in base alla tua struttura dei ruoli
    const isAdmin =
      app_metadata &&
      (app_metadata.roles?.includes("admin") || app_metadata.role === "admin");

    if (!isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "User is not authorized to use Git Gateway",
        }),
      };
    }

    // Ottieni il token Git Gateway chiamando l'endpoint Netlify Identity
    const GIT_GATEWAY_URL = process.env.SITE_URL
      ? `${process.env.SITE_URL}/.netlify/identity/git/token`
      : "/.netlify/identity/git/token";

    const GIT_GATEWAY_SECRET = process.env.NETLIFY_IDENTITY_WEBHOOK_SECRET;

    if (!GIT_GATEWAY_SECRET) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Git Gateway secret not configured" }),
      };
    }

    // Crea un JWT per Git Gateway
    const gitGatewayToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 ora di scadenza
        sub: user_id,
        email,
        app_metadata,
        user_metadata,
        // Aggiungi qui eventuali altri campi necessari per Git Gateway
      },
      GIT_GATEWAY_SECRET
    );

    // Chiamata a Git Gateway per ottenere un token di accesso GitHub
    const gitGatewayResponse = await fetch(GIT_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${gitGatewayToken}`,
      },
    });

    if (!gitGatewayResponse.ok) {
      const errorText = await gitGatewayResponse.text();
      console.error("Git Gateway error:", errorText);

      return {
        statusCode: gitGatewayResponse.status,
        body: JSON.stringify({
          error: "Failed to get Git Gateway token",
          details: errorText,
        }),
      };
    }

    const gatewayData = await gitGatewayResponse.json();

    // Restituisci il token Git Gateway al client
    return {
      statusCode: 200,
      body: JSON.stringify({ token: gatewayData.token }),
    };
  } catch (error) {
    console.error("Error processing Git Gateway token request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};
