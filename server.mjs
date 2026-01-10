import express from "express";
import { spawn } from "child_process";
import fs from "fs";
import { Readable } from "stream";
const app = express();

function downloadVideoAsBlob(videoUrl, mimeType) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxRetries = 3;
    const attempt = () => {
      const outputBase = `temp_audio_${Date.now()}`;
      const finalAudioFile = `${outputBase}.m4a`;
      const params = `-f bestaudio[ext=m4a]/91/92 -v --embed-thumbnail -x --audio-format m4a --audio-quality 0 --no-keep-video --js-runtimes node -o ${outputBase} ${videoUrl}`;
      const ytdlpProcess = spawn("yt-dlp", params.split(" "));
      ytdlpProcess.on("close", (code) => {
        if (code === 0) {
          const audioData = fs.readFileSync(finalAudioFile);
          const videoBlob = new Blob([audioData], { type: mimeType });
          fs.unlinkSync(finalAudioFile);
          resolve(videoBlob);
        } else {
          handleFailure(`Process exited with code ${code}`);
        }
      });
      ytdlpProcess.on("error", (err) => {
        handleFailure(err);
      });
      const handleFailure = (err) => {
        if (attempts < maxRetries) {
          attempts++;
          console.log(`Attempt ${attempts} failed. Retrying...`);
          attempt();
        } else {
          reject(new Error("Max retries reached: " + err.message));
        }
      };
    };
    attempt();
  });
}

app.get("/play", (req, res) => {
  const url = req.headers["url"];
  console.log(`Received a request to download ${url}`);
  downloadVideoAsBlob(url, "audio/m4a").then((blob) => {
    const str = Readable.fromWeb(blob.stream());
    if (str) {
      res.set("X-Blob-Size", blob.size);
      res.set("Content-Type", "audio/m4a");
      res.status(206);
      str.pipe(res);
    } else {
      res.status(400).send("Error received");
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Music Server running on port ${PORT}`);
});
