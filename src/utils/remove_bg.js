const fs = require("node:fs");
const path = require("node:path");

const REMOVE_BG_API_KEY = process.env.REACT_APP_REMOVE_BG_API_KEY ?? process.env.REMOVE_BG_API_KEY;

if (!REMOVE_BG_API_KEY) {
  throw new Error("Remove.bg API key is missing. Set REACT_APP_REMOVE_BG_API_KEY in your environment.");
}

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SOURCE_DIR = path.join(ROOT_DIR, "public", "lights_png");
const TARGET_DIR = path.join(ROOT_DIR, "public", "lights");

async function removeBg(blob) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", blob);

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": REMOVE_BG_API_KEY },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

async function processAll() {
  await fs.promises.mkdir(TARGET_DIR, { recursive: true });
  const files = (await fs.promises.readdir(SOURCE_DIR)).filter((file) => file.toLowerCase().endsWith(".png"));

  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    const outputPath = path.join(TARGET_DIR, file);

    try {
      const buffer = await fs.promises.readFile(inputPath);
      const fileBlob = new Blob([buffer]);
      const rbgResultData = await removeBg(fileBlob);
      await fs.promises.writeFile(outputPath, Buffer.from(rbgResultData));
      console.log(`✔ Processed ${file}`);
    } catch (error) {
      console.error(`✖ Failed ${file}:`, error.message);
    }
  }
}

if (require.main === module) {
  processAll().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
