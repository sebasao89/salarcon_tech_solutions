import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    let fullName = '';
    let email = '';
    let phone = '';
    let service = '';
    let message = '';

    // Helpers de validación y sanitización
    const sanitizeText = (input: string) =>
      String(input || '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/<[^>]*>/g, '') // quita etiquetas HTML
        .replace(/[\x00-\x1F\x7F]/g, '') // quita chars de control
        .trim()
        .replace(/\s{2,}/g, ' ');
    const sanitizeEmail = (input: string) => String(input || '').trim();
    const sanitizePhone = (input: string) => String(input || '').replace(/[^0-9+]/g, '').trim();
    const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const allowedServices = new Set([
      'desarrollo-web',
      'asesoria',
      'automatizacion',
      'seguridad',
      'domotica',
      'redes',
    ]);

    // Intenta primero JSON (el cliente ahora envía JSON)
    try {
      const json = await request.clone().json();
      fullName = sanitizeText((json as any).fullName || '');
      email = sanitizeEmail((json as any).email || '');
      phone = sanitizePhone((json as any).phone || '');
      service = String((json as any).service || '').trim();
      message = sanitizeText((json as any).message || '');
    } catch {}

    // Si no hay datos tras intentar JSON, intenta FormData
    if (!fullName && !email && !message) {
      try {
        const fd = await request.formData();
        fullName = sanitizeText(String(fd.get('fullName') || ''));
        email = sanitizeEmail(String(fd.get('email') || ''));
        phone = sanitizePhone(String(fd.get('phone') || ''));
        service = String(fd.get('service') || '').trim();
        message = sanitizeText(String(fd.get('message') || ''));
      } catch {}
    }

    // Validaciones
    if (!fullName || !email || !message) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos.' }), { status: 400 });
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email inválido.' }), { status: 400 });
    }
    if (fullName.length < 2 || fullName.length > 100) {
      return new Response(JSON.stringify({ error: 'Nombre fuera de límites.' }), { status: 400 });
    }
    if (message.length < 10 || message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Mensaje fuera de límites.' }), { status: 400 });
    }
    if (service && !allowedServices.has(service)) {
      return new Response(JSON.stringify({ error: 'Servicio inválido.' }), { status: 400 });
    }
    if (phone && phone.length > 25) {
      return new Response(JSON.stringify({ error: 'Teléfono inválido.' }), { status: 400 });
    }

    // Configuración de envío (dry-run primero)
    const dryRunRaw = (import.meta as any).env?.EMAIL_DRY_RUN ?? process.env.EMAIL_DRY_RUN ?? '';
    const isDryRun = String(dryRunRaw).toLowerCase() === 'true';
    if (isDryRun) {
      // eco mínimo para debug rápido
      console.log('CONTACT dry-run', { fullName, email, phone, service, messageLen: message.length });
      return new Response(
        JSON.stringify({ ok: true, dryRun: true }),
        { status: 200 }
      );
    }

    // Configuración de Resend (API HTTP)
    const apiKey = (import.meta as any).env?.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
    const toEnv = (import.meta as any).env?.CONTACT_TO ?? process.env.CONTACT_TO;
    const toList = String(toEnv || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const fromAddress = (import.meta as any).env?.RESEND_FROM ?? process.env.RESEND_FROM ?? 'onboarding@resend.dev';
    const fromName = (import.meta as any).env?.SMTP_FROM_NAME ?? process.env.SMTP_FROM_NAME ?? 'Salarcon Tech Contact';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Falta RESEND_API_KEY en variables de entorno.' }), { status: 500 });
    }
    if (!toList.length) {
      return new Response(JSON.stringify({ error: 'Configura CONTACT_TO en variables de entorno.' }), { status: 500 });
    }

    const subject = `Nuevo mensaje de contacto: ${fullName}`;
    const text = `Nombre: ${fullName}
Email: ${email}
Teléfono: ${phone}
Servicio: ${service}
Mensaje:
${message}`;

    const html = `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Servicio:</strong> ${service}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: toList.length === 1 ? toList[0] : toList,
        subject,
        text,
        html,
        reply_to: email,
      }),
    });

    if (!resendResp.ok) {
      let errMsg = 'Error enviando correo via Resend.';
      const providerStatus = resendResp.status;
      try {
        const errText = await resendResp.text();
        let errJson: any = null;
        try { errJson = JSON.parse(errText); } catch {}
        errMsg = (errJson?.error?.message || errJson?.message || errText || errMsg).toString();
        console.error('Resend error', { status: providerStatus, err: errJson ?? errText });
      } catch {}
      // Propaga el código de estado del proveedor para facilitar el diagnóstico (p.ej. 400, 401)
      return new Response(
        JSON.stringify({ error: errMsg, providerStatus }),
        { status: providerStatus }
      );
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error enviando correo');
    return new Response(
      JSON.stringify({ error: 'Error enviando el correo.' }),
      { status: 500 }
    );
  }
};