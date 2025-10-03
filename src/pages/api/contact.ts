import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    const host = import.meta.env.SMTP_HOST || 'smtp.mi.com.co';
    const port = Number(import.meta.env.SMTP_PORT || 465);
    const secure = import.meta.env.SMTP_SECURE !== undefined
      ? String(import.meta.env.SMTP_SECURE) === 'true'
      : port === 465; // si no se especifica, inferir por puerto
    const user = import.meta.env.SMTP_USER;
    const pass = import.meta.env.SMTP_PASS;
    const to = import.meta.env.CONTACT_TO || user;
    const authMethod = import.meta.env.SMTP_AUTH_METHOD; // opcional: 'PLAIN' | 'LOGIN' | 'CRAM-MD5'
    const tlsRejectUnauthorized = String(import.meta.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true') === 'true';
    const fromAddress = import.meta.env.SMTP_FROM || user;
    const fromName = import.meta.env.SMTP_FROM_NAME || 'Salarcon Tech Contact';
    const family = Number(import.meta.env.SMTP_FAMILY || 4); // fuerza IPv4 por defecto

    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'Configura SMTP_USER y SMTP_PASS en .env.' }), { status: 500 });
    }

    const createTransporter = (
      cfg: { host: string; port: number; secure: boolean },
      method?: 'PLAIN' | 'LOGIN' | 'CRAM-MD5'
    ) =>
      nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        family,
        auth: { user, pass },
        authMethod: method ?? authMethod,
        // En 587 fuerza STARTTLS si no es conexión segura
        requireTLS: !cfg.secure,
        tls: { rejectUnauthorized: tlsRejectUnauthorized },
        logger: false,
        debug: false,
        connectionTimeout: 15_000,
        socketTimeout: 20_000,
      });

    const candidates = [
      { host, port, secure },
      // Fallback: si el puerto es 465 (SSL), intenta 587 (STARTTLS)
      { host, port: 587, secure: false },
      // Fallback inverso: si vienes de 587, intenta 465
      { host, port: 465, secure: true },
    ];

    let transporter: nodemailer.Transporter | null = null;
    let lastVerifyError: any = null;
    let usedCfg: { host: string; port: number; secure: boolean } | null = null;
    let usedAuthMethod: 'PLAIN' | 'LOGIN' | 'CRAM-MD5' | undefined = undefined;

    const methodsToTry: Array<'PLAIN' | 'LOGIN' | 'CRAM-MD5'> = authMethod
      ? [authMethod as 'PLAIN' | 'LOGIN' | 'CRAM-MD5']
      : ['PLAIN', 'LOGIN', 'CRAM-MD5'];

    outer: for (const cfg of candidates) {
      for (const method of methodsToTry) {
        try {
          const t = createTransporter(cfg, method);
          await t.verify();
          transporter = t;
          usedCfg = cfg;
          usedAuthMethod = method;
          break outer;
        } catch (ve: any) {
          lastVerifyError = ve;
          // Evitar log detallado de errores de SMTP en producción
          console.warn('SMTP verify error with cfg', { host: cfg.host, port: cfg.port, secure: cfg.secure, method });
          // intenta siguiente método/cfg
        }
      }
    }

    if (!transporter) {
      return new Response(
        JSON.stringify({
          error:
            `No se pudo verificar la conexión SMTP. ` +
            (lastVerifyError?.message || 'Revisa host, puerto, secure y credenciales.'),
          hint:
            'Si tu servidor requiere AUTH LOGIN, establece SMTP_AUTH_METHOD=LOGIN en .env.',
        }),
        { status: 502 }
      );
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

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
      replyTo: email,
      envelope: { from: user as string, to },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error enviando correo');
    return new Response(
      JSON.stringify({ error: 'Error enviando el correo.' }),
      { status: 500 }
    );
  }
};