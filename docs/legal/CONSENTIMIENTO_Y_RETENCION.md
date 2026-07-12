# Textos de consentimiento y política de retención — BORRADOR PARA REVISIÓN

> **Estado:** Borrador del 11 de julio de 2026. Revisar junto con `AVISO_PRIVACIDAD.md` antes de usar con datos reales.

## 1. Texto de consentimiento — solicitud de membresía

Casilla obligatoria (sin marcar por defecto) en el formulario de solicitud:

> ☐ He leído el [Aviso de privacidad](/privacidad) y acepto el tratamiento de mis datos personales para gestionar mi solicitud y mi participación deportiva en el Club, incluidas las transferencias a los encargados ahí descritos.

Casillas opcionales, independientes:

> ☐ Acepto que mi **nombre** aparezca en rankings y eventos públicos del Club. *(preseleccionada: sí — el jugador puede desmarcarla)*
>
> ☐ Acepto que mi **fotografía** se muestre en la plataforma. *(preseleccionada: no)*

Nota bajo el formulario (ya existe una versión en la interfaz; alinear la redacción):

> Al continuar aceptas el aviso de privacidad. Tener una cuenta no concede automáticamente membresía del club.

## 2. Texto de consentimiento — inicio de sesión

Bajo los botones de correo y Google en `/ingresar`:

> Al continuar aceptas el [Aviso de privacidad](/privacidad). Usamos tu correo únicamente para autenticarte y enviarte avisos del servicio.

## 3. Política de retención (interna)

| Dato | Plazo | Mecanismo |
|---|---|---|
| Tokens de enlace mágico | 15 min de validez; depuración de expirados ≥ 24 h | Tarea de limpieza programada (pendiente de implementar) |
| Sesiones | 30 días o cierre de sesión; depurar expiradas/revocadas ≥ 90 días | Tarea de limpieza programada (pendiente de implementar) |
| Solicitudes rechazadas/retiradas | 12 meses, luego eliminar o anonimizar | Revisión manual trimestral hasta automatizar |
| Perfil y cuenta (supresión procedente) | ≤ 30 días tras la solicitud | Procedimiento manual documentado; anonimizar `player_profiles.full_name`, desvincular `user_id`, conservar resultados anonimizados |
| Resultados y transacciones de rating | Vida de los récords deportivos del Club | Inmutables; se anonimiza el titular, no el resultado |
| Registros de auditoría | 5 años | Revisión anual |
| Preferencias de notificación | Vida de la cuenta | Se eliminan con la cuenta |

**Pendientes técnicos derivados:** tarea programada de depuración (tokens, sesiones, solicitudes), procedimiento de anonimización, y exportación de datos del titular (derecho de acceso). Registrados como alcance post-piloto en `PROJECT_STATUS.md`.

## 4. Matriz encargado–subencargado

Vercel (hosting, EE. UU.), Neon (PostgreSQL, EE. UU.), Resend (correo, EE. UU.), Google (OAuth opcional, EE. UU.). Verificar al contratar cada plan: acuerdo de tratamiento de datos (DPA) disponible en los tres proveedores; activar la firma del DPA en cada dashboard con el nombre legal del Club.
