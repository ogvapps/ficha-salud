# Asignar Rol de Admin

## Instrucciones:

1. Reemplaza UID_DEL_USUARIO con el UID que copiaste
2. Ejecuta este comando en la terminal:

```bash
firebase auth:set-custom-claims UID_DEL_USUARIO '{"admin":true}'
```

## Verificar:

```bash
firebase auth:get UID_DEL_USUARIO
```

Deberías ver: `"admin": true` en customClaims

---

## Ejemplo:

Si tu UID es: `abc123xyz`

Ejecuta:
```bash
firebase auth:set-custom-claims abc123xyz '{"admin":true}'
```
