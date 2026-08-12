// Ridimensiona e comprime l'immagine caricata dall'utente prima di salvarla
// in localStorage: converte in WebP (molto più leggero di JPEG/PNG a parità
// di qualità), con fallback a JPEG per i browser che non sanno codificarlo.
export function resizeImageToDataUrl(file, maxSize = 256, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        const webp = canvas.toDataURL("image/webp", quality);
        const supportsWebp = webp.startsWith("data:image/webp");
        resolve(supportsWebp ? webp : canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
