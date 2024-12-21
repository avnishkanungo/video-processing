import express from "express";
import ffmpeg from "fluent-ffmpeg";
import { downloadVideo, setupDirectories, processVideo, uploadVideo, deleteRawVideo, deleteProcessedVideo } from "./storage";
import { isVideoNew, setVideo } from "./firestore";
// import { Request, Response } from "express";

setupDirectories();
const app = express();
app.use(express.json());
// const port = 3000;

app.post("/process-video", async (req, res) => {

    let data;
    try {
      const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
      data = JSON.parse(message);
      if (!data.name) {
        throw new Error('Invalid message payload received.');
      }
    } catch (error) {
      console.error(error);
      res.status(400).send('Bad Request: missing filename.');
    }

    const inputVideoName = data.name;
    const outputVideoName = `processed-${inputVideoName}`;
    const videoId = inputVideoName.split(".")[0];

    if (!isVideoNew(videoId)) {
        res.status(400).send('Bad Request: video already processing or processed.');
      } else {
        await setVideo(videoId, {
          id: videoId,
          uid: videoId.split('-')[0],
          status: 'processing'
        });
      }

    await downloadVideo(inputVideoName)

    try{
        await processVideo(inputVideoName, outputVideoName);

    }catch (error) {
        Promise.all([
            deleteRawVideo(inputVideoName),
            deleteProcessedVideo(outputVideoName)
        ])
        console.error(error);
        res.status(500).send('Video Processing Failed');
    }

    await uploadVideo(outputVideoName);

    await setVideo(videoId, {
        status: 'processed',
        filename: outputVideoName
      });

    Promise.all([
        deleteRawVideo(inputVideoName),
        deleteProcessedVideo(outputVideoName)
    ])    
    
    res.status(200).send('Processing finished successfully');
    
});

app.post("/process-video-test",  (req, res) => {
    //getinput video path
    const inputVideoPath = req.body.inputVideoPath;
    const outputVideoPath = req.body.outputVideoPath;

    if (!inputVideoPath || !outputVideoPath) {
        res.status(400).send("inputVideoPath or outputVideoPath is missing");
    }

    ffmpeg(inputVideoPath)
        .outputOption("-vf", "scale=-1:720")
        .on("end", () => {
            res.status(200).send("Video processing finished successfully");
        })
        .on("error", (err) => {
            console.error(`An Error occured: ${err.message}`);
            res.status(500).send(`Error processing video: ${err.message}`);
        })
        .save(outputVideoPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`video processing service listening on port ${port} or http://localhost:${port}`);
});