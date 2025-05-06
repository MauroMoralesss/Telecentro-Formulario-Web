export const completar = async (req, res) => {
  try {
    const formulario = await obtenerFormularioPorId(req.params.id);

    if (!formulario) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    if (!["Iniciado", "Rechazado"].includes(formulario.estado)) {
      return res.status(403).json({
        message: "Este formulario no puede ser completado en su estado actual",
      });
    }

    const files = req.files;
    let url_interior = null;
    let url_exterior = null;

    const procesarVideo = async (archivo, tipo) => {
      const inputPath = archivo.path;
      const outputPath = inputPath.replace(/\.mp4$/, `-${tipo}-compressed.mp4`);

      console.log(`🎬 ${tipo}: Ruta original:`, inputPath);

      await execAsync(
        `ffmpeg -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -crf 28 -preset veryfast -c:a aac -b:a 128k "${outputPath}"`
      );

      console.log(`✅ ${tipo}: Comprimido:`, outputPath);

      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "video",
        folder: "formularios",
      });

      // 🧹 Limpieza
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);

      return result.secure_url;
    };

    try {
      if (files?.video_interior) {
        url_interior = await procesarVideo(files.video_interior[0], "interior");
      }

      if (files?.video_exterior) {
        url_exterior = await procesarVideo(files.video_exterior[0], "exterior");
      }
    } catch (err) {
      console.error("🔥 Error en compresión/subida:", err);
      return res.status(500).json({ message: "Error al procesar los videos" });
    }

    const dispositivosPayload = req.body.dispositivos
      ? JSON.parse(req.body.dispositivos)
      : [];

    await borrarDispositivosPorFormulario(formulario.id_formulario);

    await crearDispositivos(formulario.id_formulario, dispositivosPayload);

    const { motivo_cierre, checklist, observaciones } = req.body;

    const actualizado = await actualizarFormulario(req.params.id, {
      motivo_cierre,
      checklist,
      observaciones,
      url_video_interior: url_interior,
      url_video_exterior: url_exterior,
      estado: "En revision",
    });

    const dispositivos = await obtenerDispositivosPorFormulario(formulario.id_formulario);

    return res.json({ ...actualizado, dispositivos });
  } catch (error) {
    console.error("🔥 Error al completar:", error);
    res.status(500).json({ message: "Error al completar el formulario" });
  }
};

