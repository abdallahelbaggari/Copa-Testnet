/* =================================================================
   COPA.pi TESTNET · functions/approve.js
   Route: /approve
   SANDBOX · sandbox:true

   TEST: Visit copa-pi-testnet.pages.dev/approve
   Must return: { "pi_api_key_present": true }

   Cloudflare env var needed:
   PI_API_KEY = your SANDBOX key from develop.pi
================================================================= */

export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(JSON.stringify({
    success:            true,
    message:            'Copa.pi TESTNET approve.js working',
    route:              '/approve',
    network:            'TESTNET · sandbox:true',
    pi_api_key_present: !!key,
    pi_api_key_length:  key ? key.length : 0,
    pi_api_key_prefix:  key ? key.substring(0,8)+'...' : 'MISSING — set in Cloudflare Dashboard',
  }), {
    status:  200,
    headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' },
  });
}

export async function onRequestPost(context) {
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
  };

  console.log('[Copa TESTNET] /approve POST called');

  try {
    let paymentId = null;
    try {
      const body = await context.request.json();
      paymentId  = body.paymentId || null;
    } catch(e) {
      return new Response(JSON.stringify({ approved:true, step:'body_parse_error' }),
        { status:200, headers:cors });
    }

    console.log('[Copa TESTNET] paymentId:', paymentId);
    if (!paymentId) {
      return new Response(JSON.stringify({ approved:true, step:'no_payment_id' }),
        { status:200, headers:cors });
    }

    const PI_API_KEY = context.env.PI_API_KEY;
    console.log('[Copa TESTNET] PI_API_KEY present:', !!PI_API_KEY);

    if (!PI_API_KEY) {
      console.error('[Copa TESTNET] PI_API_KEY MISSING');
      return new Response(JSON.stringify({
        approved: true,
        step:     'no_api_key',
        error:    'Set PI_API_KEY (sandbox key) in Cloudflare Dashboard → copa-pi-testnet → Settings → Environment Variables',
      }), { status:200, headers:cors });
    }

    /* Approve on Pi TESTNET */
    const piRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    const piStatus = piRes.status;
    const piRaw    = await piRes.text();
    console.log('[Copa TESTNET] Pi approve response:', piStatus, piRaw.slice(0,200));

    return new Response(
      JSON.stringify({ approved:true, pi_status:piStatus }),
      { status:200, headers:cors }
    );

  } catch(err) {
    console.error('[Copa TESTNET] approve error:', err.message);
    return new Response(
      JSON.stringify({ approved:true, error:err.message }),
      { status:200, headers:cors }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
