# Vídeos propios

Sube aquí los vídeos ya comprimidos con **estos nombres** (en minúsculas) y la web los usa en lugar de YouTube:

| Archivo          | Dónde sale                         |
|------------------|------------------------------------|
| `inicio.mp4`     | el vídeo de la portada (autoplay)  |
| `soapglory.mp4`  | Soap&Glory (vertical)              |
| `schweppes.mp4`  | Schweppes                          |
| `china.mp4`      | China                              |
| `lexus.mp4`      | Lexus (sustituye al vídeo de Instagram) |
| `portugal.mp4`   | Portugal                           |

Opcional: la portada de cada uno como `inicio.jpg`, `soapglory.jpg`… (si no está, se usa la de YouTube).

Si falta un `.mp4`, ese vídeo sigue saliendo desde YouTube.

Comprimir (ffmpeg): `ffmpeg -i original.mov -c:v libx264 -crf 24 -preset slow -vf "scale=-2:1080" -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k nombre.mp4`
(vertical: `scale=1080:-2`; sin sonido: `-an`). HandBrake: preset "Fast 1080p30" con "Web Optimized".
Máximo 100 MB por archivo en GitHub (25 MB si lo subes arrastrando desde la web).
