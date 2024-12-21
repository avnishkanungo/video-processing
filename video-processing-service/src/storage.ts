import { Storage } from "@google-cloud/storage";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

const storage = new Storage();

const rawVideoBucket = "ak-yt-raw-video-bucket";
const processedVideoBucket = "ak-yt-processed-video-bucket";

const localRawVideoPath = "./raw-video";
const localProcessedVideoPath = "./processed-video";

export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}

/**
 * @param inputVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param outputVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function processVideo(inputVideoName: string, outputVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${inputVideoName}`)
        .outputOption("-vf", "scale=-1:720")
        .on("end", () => {
            console.log("Video processing finished successfully");
            resolve();
        })
        .on("error", (err) => {
            console.error(`An Error occured: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${outputVideoName}`);
    })
    
};


/**
 * @param inputVideoName - The name of the file to download from the 
 * {@link rawVideoBucket} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadVideo(inputVideoName: string) {
    await storage.bucket(rawVideoBucket)
        .file(inputVideoName)
        .download({destination: `${localRawVideoPath}/${inputVideoName}`});
    console.log(`gs://${rawVideoBucket}/${inputVideoName} downloaded to ${localRawVideoPath}/${inputVideoName}`);
}


/**
 * @param outputVideoName - The name of the file to download from the 
 * Videos from {@link localProcessedVideoPath} bucket folder uploaded into the {@link processedVideoBucket} bucket.
 * @returns A promise that resolves when the file has been downloaded.
 * sets the video to public
 */
export async function uploadVideo(outputVideoName: string) {

    const bucket = storage.bucket(processedVideoBucket);
    await bucket.upload(`${localProcessedVideoPath}/${outputVideoName}`, {
        destination: outputVideoName
    })
    console.log(`${localProcessedVideoPath}/${outputVideoName} uploaded to gs://${processedVideoBucket}/${outputVideoName}`);

    bucket.file(outputVideoName).makePublic();
}

export function deleteRawVideo(inputVideoName: string) {
    deleteFile(`${localRawVideoPath}/${inputVideoName}`);
}

export function deleteProcessedVideo(outputVideoName: string) {
    deleteFile(`${localProcessedVideoPath}/${outputVideoName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */

function deleteFile(filePath: string):Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Error deleting file at ${filePath}:`, err);
                    reject(err);
                } else {
                    console.log(`Deleted file at ${filePath}`);
                    resolve();
                }
            });
        }
        else {
            console.log(`File at ${filePath} does not exist`);
            resolve();
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory at ${dirPath}`);
    }
}


